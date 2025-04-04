import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prismaService = app.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await prismaService.user.deleteMany();
  });

  afterAll(async () => {
    await prismaService.user.deleteMany();
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser',
    };

    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(typeof res.body.access_token).toBe('string');
        });
    });

    it('should not register a user with existing email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toBe('User already exists');
        });
    });

    it('should not register a user with invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...registerDto, email: 'invalid-email' })
        .expect(400);
    });

    it('should not register a user with short password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...registerDto, password: '123' })
        .expect(400);
    });

    it('should not register a user with short username', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...registerDto, username: 'ab' })
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser',
    };

    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);
    });

    it('should login successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(typeof res.body.access_token).toBe('string');
        });
    });

    it('should not login with incorrect password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ ...loginDto, password: 'wrongpassword' })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toBe('Invalid credentials');
        });
    });

    it('should not login with non-existent email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ ...loginDto, email: 'nonexistent@example.com' })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toBe('Invalid credentials');
        });
    });
  });

  describe('/auth/refresh (POST)', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser',
    };

    let accessToken: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);
      accessToken = response.body.access_token;
    });

    it('should refresh token successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(typeof res.body.access_token).toBe('string');
          expect(res.body.access_token).not.toBe(accessToken);
        });
    });

    it('should not refresh token without authorization header', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toBe('No token provided');
        });
    });

    it('should not refresh token with invalid token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toBe('Invalid token');
        });
    });
  });
}); 