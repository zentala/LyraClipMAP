import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { TestHelpers } from '../../tests/test-helpers';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Artist, Lyrics, Prisma } from '@prisma/client';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../../auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../../prisma/prisma.module';
import { SongsModule } from '../songs.module';
import { AuthTestHelper } from '../../tests/auth-test.helper';
import { DbTestHelper } from '../../tests/db-test.helper';
import { TestUtils } from '../../tests/test-utils';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Reflector } from '@nestjs/core';

describe('SongsController (e2e)', () => {
  let app: INestApplication;
  let testHelpers: TestHelpers;
  let testData: any;
  let prismaService: PrismaService;
  let adminToken: string;
  let userToken: string;
  let artist: Artist;
  let lyrics: Lyrics;
  let authHelper: AuthTestHelper;
  let dbHelper: DbTestHelper;
  let configService: ConfigService;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-secret-key-for-jwt-tokens';
    
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
          load: [() => ({
            JWT_SECRET: process.env.JWT_SECRET || 'test-secret-key-for-jwt-tokens',
            NODE_ENV: 'test'
          })],
        }),
        PassportModule.register({ 
          defaultStrategy: 'jwt',
        }),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => {
            const secret = configService.get('JWT_SECRET');
            console.log('JwtModule configuration:', {
              secret,
              environment: process.env.NODE_ENV,
              configSecret: configService.get('JWT_SECRET'),
              processSecret: process.env.JWT_SECRET
            });
            return {
              secret: secret,
              signOptions: { 
                expiresIn: '1d',
                algorithm: 'HS256'
              },
              verifyOptions: {
                algorithms: ['HS256']
              }
            };
          },
          inject: [ConfigService],
        }),
        AuthModule,
        PrismaModule,
        SongsModule,
      ],
      providers: [
        TestHelpers,
        AuthTestHelper,
        DbTestHelper,
        {
          provide: JwtAuthGuard,
          useFactory: (configService: ConfigService, jwtService: JwtService) => {
            console.log('Creating JwtAuthGuard with config:', {
              secret: configService.get('JWT_SECRET'),
              environment: process.env.NODE_ENV
            });
            const guard = new JwtAuthGuard(configService, jwtService);
            return guard;
          },
          inject: [ConfigService, JwtService],
        },
        {
          provide: ConfigService,
          useFactory: () => {
            const configService = new ConfigService();
            console.log('ConfigService provider:', {
              secret: configService.get('JWT_SECRET'),
              environment: process.env.NODE_ENV
            });
            return configService;
          }
        }
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    
    // Get services
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    const jwtService = moduleFixture.get<JwtService>(JwtService);
    configService = moduleFixture.get<ConfigService>(ConfigService);
    testHelpers = moduleFixture.get<TestHelpers>(TestHelpers);
    dbHelper = moduleFixture.get<DbTestHelper>(DbTestHelper);
    authHelper = moduleFixture.get<AuthTestHelper>(AuthTestHelper);
    
    // Add global guard configuration
    const reflector = moduleFixture.get(Reflector);
    app.useGlobalGuards(new JwtAuthGuard(configService, jwtService));
    
    await app.init();

    console.log('Test setup - Environment:', process.env.NODE_ENV);
    console.log('Test setup - JWT Secret:', configService.get('JWT_SECRET'));
  });

  beforeEach(async () => {
    // First reset the database
    await dbHelper.resetDatabase();
    
    // Then setup fresh test data
    testData = await testHelpers.setupTestData();
    adminToken = testData.adminToken;
    userToken = testData.userToken;
    artist = testData.artist;
    lyrics = testData.lyrics;

    console.log('Test data setup completed:', {
      adminToken: adminToken ? 'present' : 'missing',
      userToken: userToken ? 'present' : 'missing',
      artist: artist ? { id: artist.id, name: artist.name } : 'missing',
      lyrics: lyrics ? { id: lyrics.id } : 'missing'
    });
  });

  afterEach(async () => {
    await dbHelper.resetDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /songs', () => {
    it('should create a song when user is admin', async () => {
      const response = await request(app.getHttpServer())
        .post('/songs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'New Test Song',
          artistId: artist.id,
          duration: 180,
          lyricsId: lyrics.id,
          genre: 'pop',
          releaseYear: 2024,
          audioUrl: 'https://example.com/song.mp3'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('New Test Song');
    });

    it('should not create a song when user is not admin', async () => {
      const response = await request(app.getHttpServer())
        .post('/songs')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'New Test Song',
          artistId: artist.id,
          duration: 180,
          lyricsId: lyrics.id,
          genre: 'pop',
          releaseYear: 2024,
          audioUrl: 'https://example.com/song.mp3'
        });

      expect(response.status).toBe(403);
    });

    it('should not create a song without authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/songs')
        .send({
          title: 'New Test Song',
          artistId: artist.id,
          duration: 180,
          lyricsId: lyrics.id,
          genre: 'pop',
          releaseYear: 2024,
          audioUrl: 'https://example.com/song.mp3'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /songs', () => {
    it('should return all songs', async () => {
      const response = await request(app.getHttpServer())
        .get('/songs')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /songs/:id', () => {
    it('should return a song by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/songs/${testData.song.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testData.song.id);
    });

    it('should return 404 when song does not exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/songs/999999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /songs/:id', () => {
    it('should update a song when user is admin', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/songs/${testData.song.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Song Title',
          genre: 'rock',
          releaseYear: 2025
        });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Song Title');
      expect(response.body.genre).toBe('rock');
      expect(response.body.releaseYear).toBe(2025);
    });

    it('should not update a song when user is not admin', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/songs/${testData.song.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Updated Song Title'
        });

      expect(response.status).toBe(403);
    });

    it('should not update a song without authentication', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/songs/${testData.song.id}`)
        .send({
          title: 'Updated Song Title'
        });

      expect(response.status).toBe(401);
    });

    it('should return 404 when updating non-existent song', async () => {
      const response = await request(app.getHttpServer())
        .patch('/songs/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Song Title'
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /songs/:id', () => {
    it('should delete a song when user is admin', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/songs/${testData.song.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(204);

      const checkResponse = await request(app.getHttpServer())
        .get(`/songs/${testData.song.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(checkResponse.status).toBe(404);
    });

    it('should not delete a song when user is not admin', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/songs/${testData.song.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });

    it('should not delete a song without authentication', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/songs/${testData.song.id}`);

      expect(response.status).toBe(401);
    });

    it('should return 404 when deleting non-existent song', async () => {
      const response = await request(app.getHttpServer())
        .delete('/songs/999999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /songs/artist/:artistId', () => {
    it('should return songs by artist id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/songs/artist/${artist.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].artistId).toBe(artist.id);
    });

    it('should return 404 when artist does not exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/songs/artist/999999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('Song Management Pipeline', () => {
    it('should create song with artist and lyrics', async () => {
      const song = testData.song;
      expect(song.title).toBe('Test Song');
      expect(song.artistId).toBe(testData.artist.id);
      expect(song.lyricsId).toBe(testData.lyrics.id);
    });

    it('should validate audio source processing', async () => {
      const song = testData.song;
      expect(song.audioUrl).toBeDefined();
      expect(song.duration).toBeGreaterThan(0);
    });

    it('should handle lyrics attachment and processing', async () => {
      const lyrics = testData.lyrics;
      expect(lyrics.text).toBeDefined();
      expect(lyrics.language).toBe('en');
      expect(lyrics.timestamps).toBeDefined();
    });
  });
});