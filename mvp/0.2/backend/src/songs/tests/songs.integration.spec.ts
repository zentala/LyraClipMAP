import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { TestHelpers } from '../../tests/test-helpers';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('SongsController (e2e)', () => {
  let app: INestApplication;
  let testHelpers: TestHelpers;
  let testData: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const prismaService = moduleFixture.get<PrismaService>(PrismaService);
    const jwtService = moduleFixture.get<JwtService>(JwtService);
    testHelpers = new TestHelpers(prismaService, jwtService);
  });

  beforeEach(async () => {
    testData = await testHelpers.setupTestData();
  });

  afterEach(async () => {
    await testHelpers.cleanupDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /songs', () => {
    it('should create a song when user is admin', async () => {
      console.log('Creating new lyrics...');
      const newLyrics = await testHelpers.createTestLyrics();
      console.log('Created lyrics with ID:', newLyrics.id);
      console.log('Using artist with ID:', testData.artist.id);
      
      const response = await request(app.getHttpServer())
        .post('/songs')
        .set('Authorization', `Bearer ${testData.adminToken}`)
        .send({
          title: 'Test Song',
          artistId: testData.artist.id,
          duration: 180,
          audioUrl: 'https://example.com/song.mp3',
          lyricsId: newLyrics.id,
        });

      console.log('Response status:', response.status);
      console.log('Response body:', response.body);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Song');
      expect(response.body.artistId).toBe(testData.artist.id);
      expect(response.body.lyricsId).toBe(newLyrics.id);
    });

    it('should not create a song when user is not admin', () => {
      return request(app.getHttpServer())
        .post('/songs')
        .set('Authorization', `Bearer ${testData.userToken}`)
        .send({
          title: 'Test Song',
          artistId: testData.artist.id,
          duration: 180,
          audioUrl: 'https://example.com/song.mp3',
        })
        .expect(403);
    });

    it('should not create a song without authentication', () => {
      return request(app.getHttpServer())
        .post('/songs')
        .send({
          title: 'Test Song',
          artistId: testData.artist.id,
          duration: 180,
          audioUrl: 'https://example.com/song.mp3',
        })
        .expect(401);
    });
  });

  describe('GET /songs', () => {
    it('should return all songs', () => {
      return request(app.getHttpServer())
        .get('/songs')
        .set('Authorization', `Bearer ${testData.userToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('title');
          expect(res.body[0]).toHaveProperty('artistId');
        });
    });
  });

  describe('GET /songs/:id', () => {
    it('should return a song by id', () => {
      return request(app.getHttpServer())
        .get(`/songs/${testData.song.id}`)
        .set('Authorization', `Bearer ${testData.userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe(testData.song.title);
          expect(res.body.artistId).toBe(testData.artist.id);
        });
    });

    it('should return 404 when song does not exist', () => {
      return request(app.getHttpServer())
        .get('/songs/999999')
        .set('Authorization', `Bearer ${testData.userToken}`)
        .expect(404);
    });
  });

  describe('PATCH /songs/:id', () => {
    it('should update a song when user is admin', () => {
      return request(app.getHttpServer())
        .patch(`/songs/${testData.song.id}`)
        .set('Authorization', `Bearer ${testData.adminToken}`)
        .send({
          title: 'Updated Song',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testData.song.id);
          expect(res.body.title).toBe('Updated Song');
        });
    });

    it('should not update a song when user is not admin', () => {
      return request(app.getHttpServer())
        .patch(`/songs/${testData.song.id}`)
        .set('Authorization', `Bearer ${testData.userToken}`)
        .send({
          title: 'Updated Song',
        })
        .expect(403);
    });

    it('should not update a song without authentication', () => {
      return request(app.getHttpServer())
        .patch(`/songs/${testData.song.id}`)
        .send({
          title: 'Updated Song',
        })
        .expect(401);
    });

    it('should return 404 when updating non-existent song', () => {
      return request(app.getHttpServer())
        .patch('/songs/999999')
        .set('Authorization', `Bearer ${testData.adminToken}`)
        .send({
          title: 'Updated Song',
        })
        .expect(404);
    });
  });

  describe('DELETE /songs/:id', () => {
    it('should delete a song when user is admin', () => {
      return request(app.getHttpServer())
        .delete(`/songs/${testData.song.id}`)
        .set('Authorization', `Bearer ${testData.adminToken}`)
        .expect(204);
    });

    it('should not delete a song when user is not admin', () => {
      return request(app.getHttpServer())
        .delete(`/songs/${testData.song.id}`)
        .set('Authorization', `Bearer ${testData.userToken}`)
        .expect(403);
    });

    it('should not delete a song without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/songs/${testData.song.id}`)
        .expect(401);
    });

    it('should return 404 when deleting non-existent song', () => {
      return request(app.getHttpServer())
        .delete('/songs/999999')
        .set('Authorization', `Bearer ${testData.adminToken}`)
        .expect(404);
    });
  });

  describe('GET /songs/artist/:artistId', () => {
    it('should return songs by artist id', () => {
      return request(app.getHttpServer())
        .get(`/songs/artist/${testData.artist.id}`)
        .set('Authorization', `Bearer ${testData.userToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('title');
          expect(res.body[0].artistId).toBe(testData.artist.id);
        });
    });

    it('should return 404 when artist does not exist', () => {
      return request(app.getHttpServer())
        .get('/songs/artist/999999')
        .set('Authorization', `Bearer ${testData.userToken}`)
        .expect(404);
    });
  });
}); 