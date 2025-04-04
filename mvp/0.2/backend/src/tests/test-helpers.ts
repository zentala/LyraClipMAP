import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

export class TestHelpers {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async cleanupDatabase() {
    const tables = ['Song', 'Lyrics', 'Artist', 'User', 'UserPreferences'];
    await this.prisma.$transaction(
      tables.map((table) =>
        this.prisma.$executeRawUnsafe(`DELETE FROM "${table}" WHERE 1=1`),
      ),
    );
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

  async createTestLyrics() {
    return this.prisma.lyrics.create({
      data: {
        content: 'Test lyrics content',
        lrc: '[00:00.00]Test lyrics',
        timestamps: { '00:00': 'Test lyrics' },
      },
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
    return this.jwtService.sign({ sub: userId, role });
  }

  async setupTestData() {
    await this.cleanupDatabase();

    const adminUser = await this.createTestUser(UserRole.ADMIN);
    const regularUser = await this.createTestUser(UserRole.USER);
    const artist = await this.createTestArtist();
    const lyrics = await this.createTestLyrics();
    const song = await this.createTestSong(artist.id, lyrics.id);

    console.log('Test setup completed:', {
      adminUser: adminUser.id,
      regularUser: regularUser.id,
      artist: artist.id,
      lyrics: lyrics.id,
      song: song.id,
    });

    return {
      adminUser,
      regularUser,
      artist,
      lyrics,
      song,
      adminToken: this.generateToken(adminUser.id, UserRole.ADMIN),
      userToken: this.generateToken(regularUser.id, UserRole.USER),
    };
  }
} 