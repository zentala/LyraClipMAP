import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../server/src/app.module';
import { PrismaService } from '../../../server/src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('Songs API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let authToken: string;
  let testUser;
  let testArtist;
  let testSong;

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
    await prisma.songLike.deleteMany();
    await prisma.audioSource.deleteMany();
    await prisma.textContent.deleteMany();
    await prisma.song.deleteMany();
    await prisma.artist.deleteMany();
    await prisma.user.deleteMany();

    // Create test user
    testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashed-password', // In a real test, this would be properly hashed
        name: 'Test User',
      },
    });

    // Create test artist
    testArtist = await prisma.artist.create({
      data: {
        name: 'Test Artist',
        createdById: testUser.id,
      },
    });

    // Create test song
    testSong = await prisma.song.create({
      data: {
        title: 'Test Song',
        artistId: testArtist.id,
        createdById: testUser.id,
        audioSources: {
          create: {
            url: 'https://youtube.com/watch?v=test123',
            sourceType: 'YOUTUBE',
            isMain: true,
          },
        },
      },
      include: {
        audioSources: true,
      },
    });

    // Generate JWT token for authentication
    authToken = jwtService.sign({ 
      sub: testUser.id,
      email: testUser.email,
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.songLike.deleteMany();
    await prisma.audioSource.deleteMany();
    await prisma.textContent.deleteMany();
    await prisma.song.deleteMany();
    await prisma.artist.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('GET /songs', () => {
    it('should return paginated list of songs', () => {
      return request(app.getHttpServer())
        .get('/songs')
        .expect(200)
        .expect(res => {
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.meta).toBeDefined();
          expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
          
          const foundSong = res.body.data.find(song => song.id === testSong.id);
          expect(foundSong).toBeDefined();
          expect(foundSong.title).toBe('Test Song');
        });
    });

    it('should filter songs by search term', () => {
      return request(app.getHttpServer())
        .get('/songs?search=Test')
        .expect(200)
        .expect(res => {
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThanOrEqual(1);
          
          const foundSong = res.body.data.find(song => song.id === testSong.id);
          expect(foundSong).toBeDefined();
        });
    });

    it('should return empty array for non-matching search', () => {
      return request(app.getHttpServer())
        .get('/songs?search=NonExistentSong')
        .expect(200)
        .expect(res => {
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBe(0);
          expect(res.body.meta.total).toBe(0);
        });
    });

    it('should filter songs by artist ID', () => {
      return request(app.getHttpServer())
        .get(`/songs?artistId=${testArtist.id}`)
        .expect(200)
        .expect(res => {
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThanOrEqual(1);
          
          const foundSong = res.body.data.find(song => song.id === testSong.id);
          expect(foundSong).toBeDefined();
        });
    });
  });

  describe('GET /songs/:id', () => {
    it('should return a specific song by ID', () => {
      return request(app.getHttpServer())
        .get(`/songs/${testSong.id}`)
        .expect(200)
        .expect(res => {
          expect(res.body.id).toBe(testSong.id);
          expect(res.body.title).toBe('Test Song');
          expect(res.body.artist).toBeDefined();
          expect(res.body.artist.id).toBe(testArtist.id);
          expect(res.body.audioSources).toBeInstanceOf(Array);
          expect(res.body.audioSources.length).toBe(1);
          expect(res.body.audioSources[0].sourceType).toBe('YOUTUBE');
        });
    });

    it('should return 404 for non-existent song ID', () => {
      return request(app.getHttpServer())
        .get('/songs/nonexistent-id')
        .expect(404);
    });
  });

  describe('POST /songs', () => {
    it('should create a new song when authenticated', () => {
      return request(app.getHttpServer())
        .post('/songs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'New Test Song',
          artistId: testArtist.id,
          description: 'Created in E2E test',
          audioSources: [
            {
              url: 'https://youtube.com/watch?v=new123',
              sourceType: 'YOUTUBE',
              isMain: true
            }
          ]
        })
        .expect(201)
        .expect(res => {
          expect(res.body.id).toBeDefined();
          expect(res.body.title).toBe('New Test Song');
          expect(res.body.description).toBe('Created in E2E test');
        });
    });

    it('should return 401 when not authenticated', () => {
      return request(app.getHttpServer())
        .post('/songs')
        .send({
          title: 'Unauthorized Song',
          artistId: testArtist.id
        })
        .expect(401);
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/songs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing required title
          artistId: testArtist.id
        })
        .expect(400);
    });
  });

  describe('PUT /songs/:id', () => {
    it('should update an existing song when authenticated', async () => {
      // First create a song to update
      const createRes = await request(app.getHttpServer())
        .post('/songs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Song to Update',
          artistId: testArtist.id,
          audioSources: [
            {
              url: 'https://youtube.com/watch?v=update123',
              sourceType: 'YOUTUBE',
              isMain: true
            }
          ]
        })
        .expect(201);
      
      const songId = createRes.body.id;

      // Then update it
      return request(app.getHttpServer())
        .put(`/songs/${songId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Song Title',
          description: 'Updated in E2E test'
        })
        .expect(200)
        .expect(res => {
          expect(res.body.id).toBe(songId);
          expect(res.body.title).toBe('Updated Song Title');
          expect(res.body.description).toBe('Updated in E2E test');
        });
    });

    it('should return 401 when not authenticated', () => {
      return request(app.getHttpServer())
        .put(`/songs/${testSong.id}`)
        .send({
          title: 'Unauthorized Update'
        })
        .expect(401);
    });

    it('should return 404 for non-existent song ID', () => {
      return request(app.getHttpServer())
        .put('/songs/nonexistent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Update Non-existent'
        })
        .expect(404);
    });
  });

  describe('DELETE /songs/:id', () => {
    it('should delete an existing song when authenticated', async () => {
      // First create a song to delete
      const createRes = await request(app.getHttpServer())
        .post('/songs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Song to Delete',
          artistId: testArtist.id,
          audioSources: [
            {
              url: 'https://youtube.com/watch?v=delete123',
              sourceType: 'YOUTUBE',
              isMain: true
            }
          ]
        })
        .expect(201);
      
      const songId = createRes.body.id;

      // Then delete it
      await request(app.getHttpServer())
        .delete(`/songs/${songId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify it's deleted
      return request(app.getHttpServer())
        .get(`/songs/${songId}`)
        .expect(404);
    });

    it('should return 401 when not authenticated', () => {
      return request(app.getHttpServer())
        .delete(`/songs/${testSong.id}`)
        .expect(401);
    });

    it('should return 404 for non-existent song ID', () => {
      return request(app.getHttpServer())
        .delete('/songs/nonexistent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('POST /songs/:id/like', () => {
    it('should like a song when authenticated', () => {
      return request(app.getHttpServer())
        .post(`/songs/${testSong.id}/like`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201)
        .expect(res => {
          expect(res.body.songId).toBe(testSong.id);
          expect(res.body.userId).toBe(testUser.id);
        });
    });

    it('should return 409 when song already liked', () => {
      return request(app.getHttpServer())
        .post(`/songs/${testSong.id}/like`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(409);
    });

    it('should return 401 when not authenticated', () => {
      return request(app.getHttpServer())
        .post(`/songs/${testSong.id}/like`)
        .expect(401);
    });
  });

  describe('DELETE /songs/:id/like', () => {
    it('should unlike a song when authenticated', () => {
      return request(app.getHttpServer())
        .delete(`/songs/${testSong.id}/like`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });

    it('should return 404 when song not liked', () => {
      return request(app.getHttpServer())
        .delete(`/songs/${testSong.id}/like`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 when not authenticated', () => {
      return request(app.getHttpServer())
        .delete(`/songs/${testSong.id}/like`)
        .expect(401);
    });
  });
});