import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { TestHelpers } from '../../tests/test-helpers';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Artist, Lyrics } from '@prisma/client';

describe('SongsController (e2e)', () => {
  let app: INestApplication;
  let testHelpers: TestHelpers;
  let testData: any;
  let prismaService: PrismaService;
  let adminToken: string;
  let artist: Artist;
  let lyrics: Lyrics;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    const jwtService = moduleFixture.get<JwtService>(JwtService);
    testHelpers = new TestHelpers(prismaService, jwtService);
    testData = await testHelpers.setupTestData();
    adminToken = testData.adminToken;

    // Create test artist
    artist = await prismaService.artist.create({
      data: {
        name: 'Test Artist',
        bio: 'Test artist bio'
      }
    });

    // Create test lyrics
    lyrics = await prismaService.lyrics.create({
      data: {
        content: '[00:00.00]Test lyrics\n[00:05.00]Second line',
        lrc: '[00:00.00]Test lyrics\n[00:05.00]Second line',
        timestamps: {}
      }
    });
  });

  beforeEach(async () => {
    testData = await testHelpers.setupTestData();
    adminToken = testData.adminToken;
    artist = testData.artist;
    lyrics = testData.lyrics;
  });

  afterEach(async () => {
    await testHelpers.cleanupDatabase();
    await prismaService.song.deleteMany();
    await prismaService.lyrics.deleteMany();
    await prismaService.artist.deleteMany();
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

  describe('Song Management Pipeline', () => {
    it('should create song with artist and lyrics', async () => {
      // Tworzę nowe unikalne teksty dla tego testu
      const newLyrics = await prismaService.lyrics.create({
        data: {
          content: 'Unique lyrics for first test',
          lrc: '[00:00.00]Unique lyrics for first test',
          timestamps: { '00:00': 'Unique lyrics for first test' },
        }
      });
      
      console.log('Artist ID used for test:', artist.id);
      console.log('New Lyrics ID used for test:', newLyrics.id);
      
      const response = await request(app.getHttpServer())
        .post('/songs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test Song',
          artistId: artist.id,
          lyricsId: newLyrics.id,
          audioUrl: 'https://example.com/audio.mp3',
          duration: 180
        });

      console.log('Response status:', response.status);
      console.log('Response body:', JSON.stringify(response.body, null, 2));
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Song');
      expect(response.body.artistId).toBe(artist.id);
      expect(response.body.lyricsId).toBe(newLyrics.id);
      expect(response.body).toHaveProperty('artist');
      expect(response.body.artist).toHaveProperty('id', artist.id);
      expect(response.body.artist).toHaveProperty('name', artist.name);
    });

    it('should validate audio source processing', async () => {
      const song = await request(app.getHttpServer())
        .post('/songs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Audio Test Song',
          artistId: artist.id,
          audioUrl: 'https://example.com/audio.mp3'
        });

      expect(song.status).toBe(201);
      expect(song.body.audioUrl).toBe('https://example.com/audio.mp3');
      
      // Verify audio source update
      const updateResponse = await request(app.getHttpServer())
        .patch(`/songs/${song.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          audioUrl: 'https://example.com/updated-audio.mp3'
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.audioUrl).toBe('https://example.com/updated-audio.mp3');
    });

    it('should handle lyrics attachment and processing', async () => {
      // Create song without lyrics first
      const song = await request(app.getHttpServer())
        .post('/songs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Lyrics Test Song',
          artistId: artist.id,
          audioUrl: 'https://example.com/audio.mp3',
          duration: 180
        });

      console.log('Song without lyrics response:', JSON.stringify(song.body, null, 2));
      
      expect(song.status).toBe(201);
      // Sprawdzamy, czy lyrics jest null lub undefined (oba są falsy)
      expect(song.body.lyrics).toBeFalsy();

      // Tworzę nowe unikalne teksty dla tego testu
      const newLyrics = await prismaService.lyrics.create({
        data: {
          content: 'Unique lyrics for attachment test',
          lrc: '[00:00.00]Unique lyrics for attachment test',
          timestamps: { '00:00': 'Unique lyrics for attachment test' },
        }
      });

      console.log('Created new lyrics with ID:', newLyrics.id);
      
      // Attach lyrics to the song
      const updateResponse = await request(app.getHttpServer())
        .patch(`/songs/${song.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          lyricsId: newLyrics.id
        });

      console.log('Updated song response:', JSON.stringify(updateResponse.body, null, 2));
      
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body).toHaveProperty('lyrics');
      expect(updateResponse.body.lyrics).toHaveProperty('id', newLyrics.id);
    });
  });
}); 