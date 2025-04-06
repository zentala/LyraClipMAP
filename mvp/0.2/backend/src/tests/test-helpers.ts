import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserRole, User, Artist, Lyrics, Song, Prisma } from '@prisma/client';
import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TestLogger } from './test-logger';
import { DbTestHelper } from './db-test.helper';

@Injectable()
export class TestHelpers {
  public adminUser: User;
  public regularUser: User;
  public artist: Artist;
  public lyrics: Lyrics;
  public song: Song;
  public adminToken: string;
  public userToken: string;

  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
    @Inject(JwtService)
    private readonly jwtService: JwtService,
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    private readonly dbTestHelper: DbTestHelper
  ) {}

  async cleanupDatabase() {
    // Delete records in correct order to avoid foreign key constraints
    await this.prisma.playlistSong.deleteMany();
    await this.prisma.playlistShare.deleteMany();
    await this.prisma.playlist.deleteMany();
    await this.prisma.songTag.deleteMany();
    await this.prisma.tag.deleteMany();
    await this.prisma.song.deleteMany();
    await this.prisma.lyrics.deleteMany();
    await this.prisma.artist.deleteMany();
    await this.prisma.userPreferences.deleteMany();
    await this.prisma.user.deleteMany();
  }

  async createTestUser(role: UserRole = UserRole.USER): Promise<User> {
    TestLogger.debug('Creating test user', { role }, 'test');
    const timestamp = Date.now();
    const email = `test.${role.toLowerCase()}.${timestamp}@example.com`;
    const username = `test.${role.toLowerCase()}.${timestamp}`;
    TestLogger.verbose('Generated unique credentials', { email, username }, 'test');

    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          role,
        },
      });
      TestLogger.info('Created test user', { id: user.id, email: user.email, role: user.role }, 'test');
      return user;
    } catch (error) {
      TestLogger.error('Failed to create test user', error, 'test');
      throw error;
    }
  }

  async createTestArtist(name: string = 'Test Artist') {
    return this.prisma.artist.create({
      data: {
        name,
        bio: 'Test Bio',
        imageUrl: 'https://example.com/image.jpg',
      },
    });
  }

  async createTestLyrics(): Promise<Lyrics> {
    return this.prisma.lyrics.create({
      data: {
        text: 'Test lyrics content',
        language: 'en',
        sourceUrl: 'https://example.com/lyrics',
        timestamps: {}
      }
    });
  }

  async createTestSong(artistId: number, lyricsId?: number) {
    return this.prisma.song.create({
      data: {
        title: 'Test Song',
        duration: 180,
        genre: 'pop',
        releaseYear: 2024,
        audioUrl: 'https://example.com/song.mp3',
        artist: {
          connect: { id: artistId },
        },
        ...(lyricsId && {
          lyrics: {
            connect: { id: lyricsId },
          },
        }),
      },
      include: {
        artist: true,
        lyrics: true,
      },
    });
  }

  async generateToken(user: any): Promise<string> {
    TestLogger.debug('Generating token', { userId: user.id, role: user.role }, 'auth');
    TestLogger.verbose('Token configuration', {
      secret: this.configService.get('JWT_SECRET'),
      environment: process.env.NODE_ENV
    }, 'auth');

    try {
      const token = this.jwtService.sign(
        { sub: user.id, role: user.role, type: 'access_token' },
        {
          secret: this.configService.get('JWT_SECRET'),
          expiresIn: '24h',
          algorithm: 'HS256'
        }
      );

      const decoded = this.jwtService.decode(token);
      TestLogger.debug('Token generated and verified', {
        tokenPrefix: token.substring(0, 20) + '...',
        decoded
      }, 'auth');

      return token;
    } catch (error) {
      TestLogger.error('Token generation failed', error, 'auth');
      throw error;
    }
  }

  async setupTestData() {
    TestLogger.groupStart('Setting up test data');
    const timestamp = Date.now();

    try {
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      this.adminUser = await this.prisma.user.create({
        data: {
          email: `admin-${timestamp}@test.com`,
          password: hashedPassword,
          username: `admin-${timestamp}`,
          role: 'ADMIN',
        },
      });
      TestLogger.info('Created admin user', { id: this.adminUser.id, email: this.adminUser.email }, 'test');

      // Create regular user
      this.regularUser = await this.prisma.user.create({
        data: {
          email: `user-${timestamp}@test.com`,
          password: hashedPassword,
          username: `user-${timestamp}`,
          role: 'USER',
        },
      });
      TestLogger.info('Created regular user', { id: this.regularUser.id, email: this.regularUser.email }, 'test');

      // Generate JWT tokens
      this.adminToken = await this.generateToken(this.adminUser);
      this.userToken = await this.generateToken(this.regularUser);
      TestLogger.info('Generated tokens', {
        adminToken: 'present',
        userToken: 'present'
      }, 'auth');

      // Create test artist
      this.artist = await this.prisma.artist.create({
        data: {
          name: 'Test Artist',
          bio: 'Test bio',
          imageUrl: 'https://example.com/test-artist.jpg',
        },
      });
      TestLogger.info('Created test artist', { id: this.artist.id, name: this.artist.name }, 'test');

      // Create test lyrics
      this.lyrics = await this.prisma.lyrics.create({
        data: {
          text: 'Test lyrics content',
          language: 'en',
          sourceUrl: 'https://example.com/lyrics/test-song',
          timestamps: {}
        },
      });
      TestLogger.info('Created test lyrics', { id: this.lyrics.id }, 'test');

      // Create test song
      this.song = await this.prisma.song.create({
        data: {
          title: 'Test Song',
          artistId: this.artist.id,
          duration: 180000,
          lyricsId: this.lyrics.id,
          genre: 'pop',
          releaseYear: 2024,
          audioUrl: 'https://example.com/audio/test-song.mp3'
        },
      });
      TestLogger.info('Created test song', { id: this.song.id, title: this.song.title }, 'test');

      const result = {
        adminUser: this.adminUser,
        regularUser: this.regularUser,
        adminToken: this.adminToken,
        userToken: this.userToken,
        artist: this.artist,
        lyrics: this.lyrics,
        song: this.song
      };

      TestLogger.groupEnd();
      return result;
    } catch (error) {
      TestLogger.error('Failed to setup test data', error, 'test');
      TestLogger.groupEnd();
      throw error;
    }
  }

  async ensureTestData() {
    await this.dbTestHelper.cleanupExistingData();
    const testData = await this.setupTestData();
    await this.verifyTestDataCreated(testData);
    return testData;
  }

  private async verifyTestDataCreated(data: any) {
    for (const [key, value] of Object.entries(data)) {
      if (!value) {
        throw new Error(`Failed to create test data: ${key}`);
      }
    }
    return data;
  }
} 