import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { TestHelpers } from '../../tests/test-helpers';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaModule } from '../../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

describe('Search Integration Tests', () => {
  let app: INestApplication;
  let testHelpers: TestHelpers;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        AppModule,
        PrismaModule,
        JwtModule.register({
          secret: process.env.JWT_SECRET || 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      providers: [TestHelpers],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    testHelpers = moduleFixture.get<TestHelpers>(TestHelpers);
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Setup test data
    await testHelpers.setupTestData();
  });

  afterAll(async () => {
    await testHelpers.cleanupDatabase();
    await app.close();
  });

  describe('Search with Filtering', () => {
    it('should filter songs by artist name', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/songs')
        .query({ artist: 'Taylor Swift' })
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].artist.name).toBe('Taylor Swift');
    });

    it('should filter songs by genre', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/songs')
        .query({ genre: 'Pop' })
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].genre).toBe('Pop');
    });

    it('should filter songs by release year range', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/songs')
        .query({ yearFrom: 2020, yearTo: 2024 })
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      response.body.forEach(song => {
        expect(song.releaseYear).toBeGreaterThanOrEqual(2020);
        expect(song.releaseYear).toBeLessThanOrEqual(2024);
      });
    });
  });

  describe('Pagination', () => {
    it('should return paginated results with default values', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/songs')
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(response.body.items.length).toBeLessThanOrEqual(10); // Default limit
    });

    it('should respect custom page and limit parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/songs')
        .query({ page: 2, limit: 5 })
        .expect(200);

      expect(response.body.page).toBe(2);
      expect(response.body.limit).toBe(5);
      expect(response.body.items.length).toBeLessThanOrEqual(5);
    });

    it('should handle empty pages correctly', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/songs')
        .query({ page: 999 })
        .expect(200);

      expect(response.body.items).toHaveLength(0);
      expect(response.body.total).toBeGreaterThan(0);
    });
  });

  describe('Search Relevance', () => {
    it('should return results ordered by relevance score', async () => {
      const query = 'love';
      const response = await request(app.getHttpServer())
        .get('/search/songs')
        .query({ q: query })
        .expect(200);

      expect(response.body.items).toBeInstanceOf(Array);
      expect(response.body.items.length).toBeGreaterThan(0);
      expect(response.body.items[0]).toHaveProperty('relevanceScore');
      
      // Check if results are ordered by relevance
      const scores = response.body.items.map(item => item.relevanceScore);
      const sortedScores = [...scores].sort((a, b) => b - a);
      expect(scores).toEqual(sortedScores);
    });

    it('should prioritize exact matches in titles', async () => {
      const exactTitle = 'Love Story';
      const response = await request(app.getHttpServer())
        .get('/search/songs')
        .query({ q: exactTitle })
        .expect(200);

      expect(response.body.items[0].title).toBe(exactTitle);
      expect(response.body.items[0].relevanceScore).toBeGreaterThan(0.9);
    });

    it('should include partial matches with lower scores', async () => {
      const query = 'love';
      const response = await request(app.getHttpServer())
        .get('/search/songs')
        .query({ q: query })
        .expect(200);

      const partialMatches = response.body.items.filter(
        item => item.title.toLowerCase().includes(query) || 
               item.artist.name.toLowerCase().includes(query)
      );

      expect(partialMatches.length).toBeGreaterThan(1);
      partialMatches.forEach(match => {
        expect(match.relevanceScore).toBeLessThan(1);
        expect(match.relevanceScore).toBeGreaterThan(0);
      });
    });
  });
}); 