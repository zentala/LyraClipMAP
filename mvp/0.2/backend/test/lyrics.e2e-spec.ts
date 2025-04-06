import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('LyricsController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // Wyczyść bazę danych przed każdym testem
    await prismaService.$executeRaw`TRUNCATE TABLE "Lyrics" CASCADE`;
  });

  afterEach(async () => {
    await prismaService.$executeRaw`TRUNCATE TABLE "Lyrics" CASCADE`;
    await app.close();
  });

  describe('/lyrics/search (GET)', () => {
    it('should return lyrics matching the query', async () => {
      // Najpierw utwórz testowe dane
      await prismaService.lyrics.create({
        data: {
          text: 'test lyrics content',
          timestamps: [],
          language: 'en',
        },
      });

      return request(app.getHttpServer())
        .get('/lyrics/search')
        .query({ q: 'test lyrics' })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('text');
          expect(res.body[0].text).toContain('test lyrics');
          expect(res.body[0]).toHaveProperty('createdAt');
          expect(res.body[0]).toHaveProperty('updatedAt');
        });
    });

    it('should return empty array when no matches found', () => {
      return request(app.getHttpServer())
        .get('/lyrics/search')
        .query({ q: 'nonexistent lyrics' })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(0);
        });
    });
  });

  describe('/lyrics/generate-lrc (POST)', () => {
    it('should create lyrics with LRC content', () => {
      const data = {
        lyrics: 'test lyrics\nsecond line',
        timestamps: [1000, 2000],
      };

      return request(app.getHttpServer())
        .post('/lyrics/generate-lrc')
        .send(data)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.text).toBe(data.lyrics);
          expect(res.body.lrc).toBe('[00:01.00]test lyrics\n[00:02.00]second line');
          expect(res.body.timestamps).toEqual(data.timestamps);
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
        });
    });

    it('should handle empty lyrics', () => {
      const data = {
        lyrics: '',
        timestamps: [],
      };

      return request(app.getHttpServer())
        .post('/lyrics/generate-lrc')
        .send(data)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.text).toBe('');
          expect(res.body.lrc).toBe('');
          expect(res.body.timestamps).toEqual([]);
        });
    });
  });

  describe('/lyrics/map-timestamps (POST)', () => {
    it('should create lyrics with mapped timestamps', () => {
      const data = {
        lyrics: 'test lyrics',
        timestamps: [1000, 2000],
      };

      return request(app.getHttpServer())
        .post('/lyrics/map-timestamps')
        .send(data)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.text).toBe(data.lyrics);
          expect(res.body.timestamps).toEqual([
            { word: 'test', timestamp: 1000 },
            { word: 'lyrics', timestamp: 2000 },
          ]);
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
        });
    });

    it('should handle empty lyrics', () => {
      const data = {
        lyrics: '',
        timestamps: [],
      };

      return request(app.getHttpServer())
        .post('/lyrics/map-timestamps')
        .send(data)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.content).toBe('');
          expect(res.body.timestamps).toEqual([]);
        });
    });
  });
}); 