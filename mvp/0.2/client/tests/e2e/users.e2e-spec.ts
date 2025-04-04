import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../server/src/app.module';
import { PrismaService } from '../../../server/src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('Users API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let accessToken: string;
  let testUser;
  let testUser2;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);

    // Clean database before tests
    await prisma.userPreferences.deleteMany();
    await prisma.songLike.deleteMany();
    await prisma.artistLike.deleteMany();
    await prisma.playlistSong.deleteMany();
    await prisma.playlist.deleteMany();
    await prisma.user.deleteMany();

    // Create test users
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    
    testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
      },
    });
    
    testUser2 = await prisma.user.create({
      data: {
        email: 'test2@example.com',
        password: hashedPassword,
        name: 'Test User 2',
      },
    });

    // Generate JWT token for authentication
    accessToken = jwtService.sign({ 
      sub: testUser.id,
      email: testUser.email,
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.userPreferences.deleteMany();
    await prisma.songLike.deleteMany();
    await prisma.artistLike.deleteMany();
    await prisma.playlistSong.deleteMany();
    await prisma.playlist.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('GET /users/:id', () => {
    it('should return user profile when authenticated', () => {
      return request(app.getHttpServer())
        .get(`/users/${testUser.id}`)
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
        .get(`/users/${testUser.id}`)
        .expect(401);
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/users/nonexistent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('PUT /users/:id', () => {
    it('should update user profile when authenticated as that user', () => {
      return request(app.getHttpServer())
        .put(`/users/${testUser.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Updated Test User',
        })
        .expect(200)
        .expect(res => {
          expect(res.body.id).toBe(testUser.id);
          expect(res.body.email).toBe(testUser.email);
          expect(res.body.name).toBe('Updated Test User');
          expect(res.body.password).toBeUndefined(); // Password should not be returned
        });
    });

    it('should return 403 when attempting to update another user\'s profile', () => {
      return request(app.getHttpServer())
        .put(`/users/${testUser2.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Unauthorized Update',
        })
        .expect(403);
    });

    it('should return 400 with invalid data', () => {
      return request(app.getHttpServer())
        .put(`/users/${testUser.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: 'invalid-email', // Invalid email format
        })
        .expect(400);
    });
  });

  describe('GET /users/:id/preferences', () => {
    it('should return null when user has no preferences', () => {
      return request(app.getHttpServer())
        .get(`/users/${testUser.id}/preferences`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toBeNull();
        });
    });

    it('should return preferences after they are set', async () => {
      // First, set preferences
      await request(app.getHttpServer())
        .put(`/users/${testUser.id}/preferences`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          theme: 'dark',
          language: 'en',
          notificationsEnabled: true,
        })
        .expect(200);

      // Then, get them
      return request(app.getHttpServer())
        .get(`/users/${testUser.id}/preferences`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body.theme).toBe('dark');
          expect(res.body.language).toBe('en');
          expect(res.body.notificationsEnabled).toBe(true);
        });
    });

    it('should return 403 when attempting to get another user\'s preferences', () => {
      return request(app.getHttpServer())
        .get(`/users/${testUser2.id}/preferences`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
    });
  });

  describe('PUT /users/:id/preferences', () => {
    it('should update user preferences', () => {
      return request(app.getHttpServer())
        .put(`/users/${testUser.id}/preferences`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          theme: 'light',
          language: 'fr',
          notificationsEnabled: false,
        })
        .expect(200)
        .expect(res => {
          expect(res.body.theme).toBe('light');
          expect(res.body.language).toBe('fr');
          expect(res.body.notificationsEnabled).toBe(false);
        });
    });

    it('should return 403 when attempting to update another user\'s preferences', () => {
      return request(app.getHttpServer())
        .put(`/users/${testUser2.id}/preferences`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          theme: 'dark',
        })
        .expect(403);
    });
  });

  describe('GET /users/:id/liked-songs', () => {
    it('should return empty array when user has no liked songs', () => {
      return request(app.getHttpServer())
        .get(`/users/${testUser.id}/liked-songs`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body.data).toEqual([]);
          expect(res.body.meta.total).toBe(0);
        });
    });

    it('should return 403 when attempting to access another user\'s liked songs', () => {
      return request(app.getHttpServer())
        .get(`/users/${testUser2.id}/liked-songs`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
    });
  });

  describe('GET /users/:id/liked-artists', () => {
    it('should return empty array when user has no liked artists', () => {
      return request(app.getHttpServer())
        .get(`/users/${testUser.id}/liked-artists`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body.data).toEqual([]);
          expect(res.body.meta.total).toBe(0);
        });
    });

    it('should return 403 when attempting to access another user\'s liked artists', () => {
      return request(app.getHttpServer())
        .get(`/users/${testUser2.id}/liked-artists`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
    });
  });

  describe('GET /users/:id/playlists', () => {
    beforeEach(async () => {
      // Create test playlists
      await prisma.playlist.create({
        data: {
          name: 'Test Playlist 1',
          description: 'First test playlist',
          isPublic: true,
          userId: testUser.id,
        },
      });
      
      await prisma.playlist.create({
        data: {
          name: 'Test Playlist 2',
          description: 'Second test playlist',
          isPublic: false,
          userId: testUser.id,
        },
      });
    });

    afterEach(async () => {
      // Clean up playlists
      await prisma.playlist.deleteMany({
        where: { userId: testUser.id },
      });
    });

    it('should return user playlists', () => {
      return request(app.getHttpServer())
        .get(`/users/${testUser.id}/playlists`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBe(2);
          expect(res.body.meta.total).toBe(2);
          
          // Verify playlist properties
          const playlist1 = res.body.data.find(p => p.name === 'Test Playlist 1');
          const playlist2 = res.body.data.find(p => p.name === 'Test Playlist 2');
          
          expect(playlist1).toBeDefined();
          expect(playlist1.isPublic).toBe(true);
          expect(playlist1.userId).toBe(testUser.id);
          
          expect(playlist2).toBeDefined();
          expect(playlist2.isPublic).toBe(false);
          expect(playlist2.userId).toBe(testUser.id);
        });
    });

    it('should return 403 when attempting to access another user\'s playlists', () => {
      return request(app.getHttpServer())
        .get(`/users/${testUser2.id}/playlists`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
    });
  });

  // Test specific edge cases
  describe('Edge cases', () => {
    it('should handle email update conflict', () => {
      return request(app.getHttpServer())
        .put(`/users/${testUser.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: testUser2.email, // Try to update to existing email
        })
        .expect(409); // Conflict
    });

    it('should sanitize user input', () => {
      return request(app.getHttpServer())
        .put(`/users/${testUser.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: '<script>alert("XSS")</script>',
        })
        .expect(200)
        .expect(res => {
          // The API should sanitize this input, either by escaping or removing script tags
          // The exact behavior depends on the implementation, so we just check it doesn't contain
          // the unfiltered script tag
          expect(res.body.name).not.toBe('<script>alert("XSS")</script>');
        });
    });
  });
});