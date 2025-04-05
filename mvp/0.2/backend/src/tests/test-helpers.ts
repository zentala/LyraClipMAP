import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserRole, User, Artist, Lyrics, Song, Prisma } from '@prisma/client';
import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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

  async createTestUser(role: UserRole = UserRole.USER) {
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    return this.prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        password: hashedPassword,
        username: `testuser-${Date.now()}`,
        role,
      },
    });
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
        content: 'Test lyrics content',
        language: 'en',
        sourceUrl: 'https://example.com/lyrics',
        timestamps: { '00:00': 'Test lyrics' }
      }
    });
  }

  async createTestSong(artistId: number, lyricsId?: number) {
    return this.prisma.song.create({
      data: {
        title: 'Test Song',
        duration: 180,
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

  generateToken(userId: number, role: UserRole) {
    return this.jwtService.sign(
      {
        sub: userId,
        role: role,
        type: 'access_token'
      },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '1d',
        algorithm: 'HS256'
      }
    );
  }

  async setupTestData() {
    const timestamp = Date.now();

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

    // Create regular user
    this.regularUser = await this.prisma.user.create({
      data: {
        email: `user-${timestamp}@test.com`,
        password: hashedPassword,
        username: `user-${timestamp}`,
        role: 'USER',
      },
    });

    // Generate JWT tokens
    this.adminToken = this.generateToken(this.adminUser.id, this.adminUser.role);
    this.userToken = this.generateToken(this.regularUser.id, this.regularUser.role);

    // Create test artist
    this.artist = await this.prisma.artist.create({
      data: {
        name: 'Test Artist',
        bio: 'Test bio',
        imageUrl: 'https://example.com/test-artist.jpg',
      },
    });

    // Create test lyrics
    this.lyrics = await this.prisma.lyrics.create({
      data: {
        content: 'Test lyrics content',
        language: 'en',
        sourceUrl: 'https://example.com/lyrics/test-song',
      },
    });

    // Create test song
    this.song = await this.prisma.song.create({
      data: {
        title: 'Test Song',
        artistId: this.artist.id,
        duration: 180000, // 3 minutes in milliseconds
        audioUrl: 'https://example.com/audio/test-song.mp3',
        lyricsId: this.lyrics.id,
      },
    });

    console.log('Test setup completed:', {
      adminUser: this.adminUser.id,
      regularUser: this.regularUser.id,
      artist: this.artist.id,
      lyrics: this.lyrics.id,
      song: this.song.id,
    });

    return {
      adminUser: this.adminUser,
      regularUser: this.regularUser,
      artist: this.artist,
      lyrics: this.lyrics,
      song: this.song,
    };
  }
} 