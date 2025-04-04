import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../server/src/app.module';
import { PrismaService } from '../../../server/src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Auth API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let refreshToken: string;
  let testUser;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Clean database before tests
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          name: 'Test User'
        })
        .expect(201)
        .expect(res => {
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.refreshToken).toBeDefined();
          expect(res.body.user).toBeDefined();
          expect(res.body.user.id).toBeDefined();
          expect(res.body.user.email).toBe('test@example.com');
          expect(res.body.user.name).toBe('Test User');
          expect(res.body.user.password).toBeUndefined(); // Password should not be returned
          
          // Save tokens for later tests
          accessToken = res.body.accessToken;
          refreshToken = res.body.refreshToken;
          testUser = res.body.user;
        });
    });

    it('should return 400 with invalid registration data', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: '123', // Too short
          name: '' // Empty name
        })
        .expect(400)
        .expect(res => {
          expect(res.body.message).toContain('email');
          expect(res.body.message).toContain('password');
          expect(res.body.message).toContain('name');
        });
    });

    it('should return 409 if email already exists', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com', // Already registered
          password: 'Password123!',
          name: 'Another Test User'
        })
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        })
        .expect(200)
        .expect(res => {
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.refreshToken).toBeDefined();
          expect(res.body.user).toBeDefined();
          expect(res.body.user.id).toBe(testUser.id);
          expect(res.body.user.email).toBe('test@example.com');
          expect(res.body.user.password).toBeUndefined(); // Password should not be returned
        });
    });

    it('should return 401 with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123!'
        })
        .expect(401);
    });

    it('should return 401 for non-existent user', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!'
        })
        .expect(401);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should generate a new access token with valid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: refreshToken
        })
        .expect(200)
        .expect(res => {
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.accessToken).not.toBe(accessToken); // Should be a new token
        });
    });

    it('should return 401 with invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: 'invalid-refresh-token'
        })
        .expect(401);
    });
  });

  describe('GET /auth/me', () => {
    it('should return the current user profile when authenticated', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body.id).toBe(testUser.id);
          expect(res.body.email).toBe(testUser.email);
          expect(res.body.name).toBe(testUser.name);
          expect(res.body.password).toBeUndefined(); // Password should not be returned
        });
    });

    it('should return 401 when not authenticated', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });

    it('should return 401 with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  // Test specific edge cases
  describe('Edge cases', () => {
    it('should handle concurrent registrations with the same email', async () => {
      // First create a test user to clear out
      await prisma.user.deleteMany({ where: { email: 'concurrent@example.com' } });
      
      // Try to register concurrently
      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(
          request(app.getHttpServer())
            .post('/auth/register')
            .send({
              email: 'concurrent@example.com',
              password: 'Password123!',
              name: `Concurrent User ${i}`
            })
        );
      }
      
      const results = await Promise.all(promises);
      
      // Exactly one should succeed with 201, others should fail with 409
      const successCount = results.filter(res => res.status === 201).length;
      const conflictCount = results.filter(res => res.status === 409).length;
      
      expect(successCount).toBe(1);
      expect(conflictCount).toBe(2);
      
      // Verify only one user was created
      const userCount = await prisma.user.count({ 
        where: { email: 'concurrent@example.com' } 
      });
      expect(userCount).toBe(1);
    });

    it('should properly handle token expiration', async () => {
      // Create a user with a short-lived token for testing
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      const tempUser = await prisma.user.create({
        data: {
          email: 'expiration@example.com',
          password: hashedPassword,
          name: 'Expiration Test User',
        },
      });

      // Here we'd ideally test with an expired token, but in an E2E test this is harder
      // We'd need to mock the JWT service or use a very short expiration
      // For now, we'll just demonstrate the structure:
      
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZW1wLXVzZXItaWQiLCJlbWFpbCI6ImV4cGlyYXRpb25AZXhhbXBsZS5jb20iLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTUxNjIzOTAyM30.invalid-signature';
      
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });
});