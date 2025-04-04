import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ArtistsModule } from '../artists.module';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthModule } from '../../auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('Artists Integration Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let adminToken: string;
  let userToken: string;
  let adminUser: User;
  let normalUser: User;

  const testArtist = {
    name: 'Test Artist',
    bio: 'Test Bio',
    imageUrl: 'https://example.com/image.jpg',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        ArtistsModule,
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
    configService = moduleFixture.get<ConfigService>(ConfigService);

    await app.init();

    // Clean up database before tests
    await prismaService.$transaction([
      prismaService.song.deleteMany(),
      prismaService.lyrics.deleteMany(),
      prismaService.artist.deleteMany(),
      prismaService.user.deleteMany(),
    ]);

    // Create test users and get their tokens
    adminUser = await prismaService.user.create({
      data: {
        email: 'admin@test.com',
        password: 'hashedPassword',
        username: 'admin',
        role: 'ADMIN',
      },
    });

    normalUser = await prismaService.user.create({
      data: {
        email: 'user@test.com',
        password: 'hashedPassword',
        username: 'user',
        role: 'USER',
      },
    });

    adminToken = jwtService.sign({ 
      sub: adminUser.id, 
      email: adminUser.email,
      role: adminUser.role 
    });

    userToken = jwtService.sign({ 
      sub: normalUser.id, 
      email: normalUser.email,
      role: normalUser.role 
    });
  });

  afterAll(async () => {
    await prismaService.$transaction([
      prismaService.song.deleteMany(),
      prismaService.lyrics.deleteMany(),
      prismaService.artist.deleteMany(),
      prismaService.user.deleteMany(),
    ]);
    await app.close();
  });

  describe('POST /artists', () => {
    it('should create a new artist when user is admin', () => {
      return request(app.getHttpServer())
        .post('/artists')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testArtist)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe(testArtist.name);
          expect(res.body.bio).toBe(testArtist.bio);
          expect(res.body.imageUrl).toBe(testArtist.imageUrl);
        });
    });

    it('should not create artist when user is not admin', () => {
      return request(app.getHttpServer())
        .post('/artists')
        .set('Authorization', `Bearer ${userToken}`)
        .send(testArtist)
        .expect(403);
    });

    it('should not create artist without authentication', () => {
      return request(app.getHttpServer())
        .post('/artists')
        .send(testArtist)
        .expect(401);
    });
  });

  describe('GET /artists', () => {
    let createdArtist;

    beforeAll(async () => {
      createdArtist = await prismaService.artist.create({
        data: testArtist,
      });
    });

    afterAll(async () => {
      await prismaService.artist.delete({
        where: { id: createdArtist.id },
      });
    });

    it('should return all artists', () => {
      return request(app.getHttpServer())
        .get('/artists')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('name', testArtist.name);
        });
    });

    it('should not return artists without authentication', () => {
      return request(app.getHttpServer())
        .get('/artists')
        .expect(401);
    });
  });

  describe('GET /artists/:id', () => {
    let createdArtist;

    beforeAll(async () => {
      createdArtist = await prismaService.artist.create({
        data: testArtist,
      });
    });

    afterAll(async () => {
      await prismaService.artist.delete({
        where: { id: createdArtist.id },
      });
    });

    it('should return a single artist', () => {
      return request(app.getHttpServer())
        .get(`/artists/${createdArtist.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', createdArtist.id);
          expect(res.body.name).toBe(testArtist.name);
        });
    });

    it('should return 404 for non-existent artist', () => {
      return request(app.getHttpServer())
        .get('/artists/999999')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    it('should not return artist without authentication', () => {
      return request(app.getHttpServer())
        .get(`/artists/${createdArtist.id}`)
        .expect(401);
    });
  });

  describe('PATCH /artists/:id', () => {
    let createdArtist;

    beforeEach(async () => {
      createdArtist = await prismaService.artist.create({
        data: testArtist,
      });
    });

    afterEach(async () => {
      await prismaService.artist.delete({
        where: { id: createdArtist.id },
      });
    });

    const updateData = {
      name: 'Updated Artist Name',
      bio: 'Updated Bio',
    };

    it('should update artist when user is admin', () => {
      return request(app.getHttpServer())
        .patch(`/artists/${createdArtist.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe(updateData.name);
          expect(res.body.bio).toBe(updateData.bio);
        });
    });

    it('should not update artist when user is not admin', () => {
      return request(app.getHttpServer())
        .patch(`/artists/${createdArtist.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(403);
    });

    it('should not update artist without authentication', () => {
      return request(app.getHttpServer())
        .patch(`/artists/${createdArtist.id}`)
        .send(updateData)
        .expect(401);
    });
  });

  describe('DELETE /artists/:id', () => {
    let createdArtist;

    beforeEach(async () => {
      createdArtist = await prismaService.artist.create({
        data: testArtist,
      });
    });

    it('should delete artist when user is admin', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/artists/${createdArtist.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', createdArtist.id);
      
      // Skip the afterEach cleanup for this test since we've already deleted the artist
      createdArtist = null;
    });

    it('should not delete artist when user is not admin', () => {
      return request(app.getHttpServer())
        .delete(`/artists/${createdArtist.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should return 404 when trying to delete non-existent artist', () => {
      return request(app.getHttpServer())
        .delete('/artists/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should not delete artist without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/artists/${createdArtist.id}`)
        .expect(401);
    });

    afterEach(async () => {
      if (createdArtist) {
        try {
          await prismaService.artist.delete({
            where: { id: createdArtist.id },
          });
        } catch (error) {
          // Ignore error if artist was already deleted
          if (!error.message.includes('Record to delete does not exist')) {
            throw error;
          }
        }
      }
    });
  });
}); 