import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('TextContentController (e2e)', () => {
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
    await prismaService.textContent.deleteMany();
  });

  afterEach(async () => {
    await prismaService.textContent.deleteMany();
    await app.close();
  });

  describe('/text-content (POST)', () => {
    it('should create text content', () => {
      const data = {
        content: 'Test content',
        type: 'article',
        language: 'en',
      };

      return request(app.getHttpServer())
        .post('/text-content')
        .send(data)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.content).toBe(data.content);
          expect(res.body.type).toBe(data.type);
          expect(res.body.language).toBe(data.language);
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
        });
    });

    it('should handle missing language field', () => {
      const data = {
        content: 'Test content',
        type: 'article',
      };

      return request(app.getHttpServer())
        .post('/text-content')
        .send(data)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.content).toBe(data.content);
          expect(res.body.type).toBe(data.type);
          expect(res.body.language).toBeNull();
        });
    });
  });

  describe('/text-content (GET)', () => {
    it('should return all text contents', async () => {
      // Najpierw utwórz testowe dane
      await prismaService.textContent.create({
        data: {
          content: 'Test content 1',
          type: 'article',
          language: 'en',
        },
      });
      await prismaService.textContent.create({
        data: {
          content: 'Test content 2',
          type: 'note',
          language: 'pl',
        },
      });

      return request(app.getHttpServer())
        .get('/text-content')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(2);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('content');
          expect(res.body[0]).toHaveProperty('type');
          expect(res.body[0]).toHaveProperty('language');
          expect(res.body[0]).toHaveProperty('createdAt');
          expect(res.body[0]).toHaveProperty('updatedAt');
        });
    });
  });

  describe('/text-content/:id (GET)', () => {
    it('should return text content by id', async () => {
      // Najpierw utwórz testowe dane
      const created = await prismaService.textContent.create({
        data: {
          content: 'Test content',
          type: 'article',
          language: 'en',
        },
      });

      return request(app.getHttpServer())
        .get(`/text-content/${created.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.content).toBe('Test content');
          expect(res.body.type).toBe('article');
          expect(res.body.language).toBe('en');
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
        });
    });

    it('should return 404 for non-existent id', () => {
      return request(app.getHttpServer())
        .get('/text-content/999')
        .expect(404);
    });
  });

  describe('/text-content/:id (PUT)', () => {
    it('should update text content', async () => {
      // Najpierw utwórz testowe dane
      const created = await prismaService.textContent.create({
        data: {
          content: 'Test content',
          type: 'article',
          language: 'en',
        },
      });

      const updateData = {
        content: 'Updated content',
        type: 'note',
        language: 'pl',
      };

      return request(app.getHttpServer())
        .put(`/text-content/${created.id}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.content).toBe(updateData.content);
          expect(res.body.type).toBe(updateData.type);
          expect(res.body.language).toBe(updateData.language);
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
        });
    });

    it('should return 404 for non-existent id', () => {
      return request(app.getHttpServer())
        .put('/text-content/999')
        .send({
          content: 'Updated content',
          type: 'note',
          language: 'pl',
        })
        .expect(404);
    });
  });

  describe('/text-content/:id (DELETE)', () => {
    it('should remove text content', async () => {
      // Najpierw utwórz testowe dane
      const created = await prismaService.textContent.create({
        data: {
          content: 'Test content',
          type: 'article',
          language: 'en',
        },
      });

      return request(app.getHttpServer())
        .delete(`/text-content/${created.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.content).toBe('Test content');
          expect(res.body.type).toBe('article');
          expect(res.body.language).toBe('en');
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
        });
    });

    it('should return 404 for non-existent id', () => {
      return request(app.getHttpServer())
        .delete('/text-content/999')
        .expect(404);
    });
  });

  describe('/text-content/detect-language (POST)', () => {
    it('should detect language from text', () => {
      const data = {
        text: 'This is a test text in English',
      };

      return request(app.getHttpServer())
        .post('/text-content/detect-language')
        .send(data)
        .expect(200)
        .expect((res) => {
          expect(res.body).toBe('en');
        });
    });

    it('should return default language for empty text', () => {
      const data = {
        text: '',
      };

      return request(app.getHttpServer())
        .post('/text-content/detect-language')
        .send(data)
        .expect(200)
        .expect((res) => {
          expect(res.body).toBe('en');
        });
    });
  });
}); 