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

describe('Playlists E2E Tests', () => {
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

    await testHelpers.setupTestData();
  });

  afterAll(async () => {
    await testHelpers.cleanupDatabase();
    await app.close();
  });

  describe('Playlist Management', () => {
    it('should create a new playlist', async () => {
      const response = await request(app.getHttpServer())
        .post('/playlists')
        .set('Authorization', `Bearer ${testHelpers.adminToken}`)
        .send({
          name: 'My Test Playlist',
          description: 'A playlist for testing',
          isPublic: true
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('My Test Playlist');
      expect(response.body.isPublic).toBe(true);
    });

    it('should add songs to a playlist', async () => {
      const playlist = await prisma.playlist.create({
        data: {
          name: 'Test Playlist',
          userId: testHelpers.adminUser.id,
          isPublic: true
        }
      });

      const response = await request(app.getHttpServer())
        .post(`/playlists/${playlist.id}/songs`)
        .set('Authorization', `Bearer ${testHelpers.adminToken}`)
        .send({
          songIds: [testHelpers.song.id]
        })
        .expect(201);

      const playlistWithSongs = await prisma.playlist.findUnique({
        where: { id: playlist.id },
        include: {
          songs: {
            include: {
              song: true
            }
          }
        }
      });

      expect(playlistWithSongs.songs).toHaveLength(1);
      expect(playlistWithSongs.songs[0].song.id).toBe(testHelpers.song.id);
    });

    it('should remove songs from a playlist', async () => {
      const playlist = await prisma.playlist.create({
        data: {
          name: 'Test Playlist',
          userId: testHelpers.adminUser.id,
          isPublic: true,
          songs: {
            create: {
              songId: testHelpers.song.id,
              order: 1
            }
          }
        }
      });

      await request(app.getHttpServer())
        .delete(`/playlists/${playlist.id}/songs/${testHelpers.song.id}`)
        .set('Authorization', `Bearer ${testHelpers.adminToken}`)
        .expect(204);

      const updatedPlaylist = await prisma.playlist.findUnique({
        where: { id: playlist.id },
        include: {
          songs: true
        }
      });

      expect(updatedPlaylist.songs).toHaveLength(0);
    });
  });

  describe('User Collections', () => {
    it('should get user\'s playlists', async () => {
      await prisma.playlist.createMany({
        data: [
          {
            name: 'User Playlist 1',
            userId: testHelpers.regularUser.id,
            isPublic: true
          },
          {
            name: 'User Playlist 2',
            userId: testHelpers.regularUser.id,
            isPublic: false
          }
        ]
      });

      const response = await request(app.getHttpServer())
        .get('/playlists/my')
        .set('Authorization', `Bearer ${testHelpers.userToken}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('isPublic');
    });

    it('should get only public playlists for other users', async () => {
      // Cleanup existing playlists
      await prisma.playlistSong.deleteMany();
      await prisma.playlistShare.deleteMany();
      await prisma.playlist.deleteMany();

      await prisma.playlist.createMany({
        data: [
          {
            name: 'Public Playlist',
            userId: testHelpers.adminUser.id,
            isPublic: true
          },
          {
            name: 'Private Playlist',
            userId: testHelpers.adminUser.id,
            isPublic: false
          }
        ]
      });

      const response = await request(app.getHttpServer())
        .get(`/playlists/user/${testHelpers.adminUser.id}`)
        .set('Authorization', `Bearer ${testHelpers.userToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].isPublic).toBe(true);
    });
  });

  describe('Playlist Sharing', () => {
    it('should share a playlist with another user', async () => {
      const playlist = await prisma.playlist.create({
        data: {
          name: 'Shared Playlist',
          userId: testHelpers.adminUser.id,
          isPublic: false
        }
      });

      await request(app.getHttpServer())
        .post(`/playlists/${playlist.id}/share`)
        .set('Authorization', `Bearer ${testHelpers.adminToken}`)
        .send({
          userId: testHelpers.regularUser.id,
          permission: 'VIEW'
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/playlists/${playlist.id}`)
        .set('Authorization', `Bearer ${testHelpers.userToken}`)
        .expect(200);

      expect(response.body.id).toBe(playlist.id);
    });

    it('should allow collaborative editing of shared playlists', async () => {
      const playlist = await prisma.playlist.create({
        data: {
          name: 'Collaborative Playlist',
          userId: testHelpers.adminUser.id,
          isPublic: false
        }
      });

      await request(app.getHttpServer())
        .post(`/playlists/${playlist.id}/share`)
        .set('Authorization', `Bearer ${testHelpers.adminToken}`)
        .send({
          userId: testHelpers.regularUser.id,
          permission: 'EDIT'
        })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/playlists/${playlist.id}/songs`)
        .set('Authorization', `Bearer ${testHelpers.userToken}`)
        .send({
          songIds: [testHelpers.song.id]
        })
        .expect(201);

      const updatedPlaylist = await prisma.playlist.findUnique({
        where: { id: playlist.id },
        include: {
          songs: {
            include: {
              song: true
            }
          }
        }
      });

      expect(updatedPlaylist.songs).toHaveLength(1);
      expect(updatedPlaylist.songs[0].song.id).toBe(testHelpers.song.id);
    });
  });
}); 