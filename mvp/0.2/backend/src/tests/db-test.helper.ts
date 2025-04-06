import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SongExtended, LyricsExtended, SongCreateInput, LyricsCreateInput } from '../types/prisma-extensions';
import { TestLogger } from './test-logger';
import { CLEANUP_ORDER } from './db-cleanup-order';

@Injectable()
export class DbTestHelper {
  constructor(private readonly prisma: PrismaService) {}

  async resetDatabase() {
    TestLogger.groupStart('Database Reset');
    
    for (const table of CLEANUP_ORDER) {
      try {
        await this.prisma.$executeRawUnsafe(
          `DELETE FROM "public"."${table}" WHERE 1=1`
        );
        await this.verifyTableEmpty(table);
        TestLogger.debug(`Cleared table: ${table}`, null, 'database');
      } catch (error) {
        TestLogger.error(`Failed to clear table ${table}`, error, 'database');
        throw error; // Fail fast on cleanup errors
      }
    }
    TestLogger.groupEnd();
  }

  private async verifyTableEmpty(table: string): Promise<void> {
    const count = await this.prisma.$executeRawUnsafe(
      `SELECT COUNT(*) FROM "public"."${table}"`
    );
    if (count > 0) {
      throw new Error(`Table ${table} still has ${count} records after cleanup`);
    }
  }

  async verifyDatabaseState() {
    TestLogger.groupStart('Database State Verification');
    let hasRecords = false;

    for (const table of CLEANUP_ORDER) {
      const count = await this.prisma[table.toLowerCase()].count();
      if (count > 0) {
        hasRecords = true;
        TestLogger.warn(`Table ${table} still has ${count} records`, null, 'database');
      } else {
        TestLogger.debug(`Table ${table} is empty`, null, 'database');
      }
    }

    if (!hasRecords) {
      TestLogger.info('Database is clean - all tables are empty', null, 'database');
    }
    TestLogger.groupEnd();
    return !hasRecords;
  }

  async ensureTestData() {
    await this.cleanupExistingData();
    const testData = await this.setupTestData();
    await this.verifyTestDataCreated(testData);
    return testData;
  }

  async cleanupExistingData() {
    await this.verifyDatabaseState();
    await this.resetDatabase();
    await this.verifyDatabaseState();
  }

  private async verifyTestDataCreated(data: any) {
    for (const [key, value] of Object.entries(data)) {
      if (!value) {
        throw new Error(`Failed to create test data: ${key}`);
      }
    }
  }

  async createTestArtist() {
    return this.prisma.artist.create({
      data: {
        name: `Test Artist ${Date.now()}`,
        bio: 'Test artist bio',
        imageUrl: 'https://example.com/artist.jpg'
      }
    });
  }

  async createTestLyrics(): Promise<LyricsExtended> {
    const data: LyricsCreateInput = {
      text: 'Test lyrics content\nLine 2\nLine 3',
      language: 'en',
      sourceUrl: 'https://example.com/lyrics',
      timestamps: {}
    };

    const lyrics = await this.prisma.lyrics.create({ data });
    return {
      ...lyrics,
      text: data.text,
      language: data.language,
      sourceUrl: data.sourceUrl,
      timestamps: data.timestamps
    };
  }

  async createTestSong(artistId: number, lyricsId: number): Promise<SongExtended> {
    const data: SongCreateInput = {
      title: `Test Song ${Date.now()}`,
      artistId,
      duration: 180,
      lyricsId,
      genre: 'pop',
      releaseYear: 2024,
      audioUrl: 'https://example.com/song.mp3'
    };

    const song = await this.prisma.song.create({ data });
    return {
      ...song,
      genre: data.genre,
      releaseYear: data.releaseYear
    };
  }

  async setupTestData() {
    const artist = await this.createTestArtist();
    const lyrics = await this.createTestLyrics();
    const song = await this.createTestSong(artist.id, lyrics.id);
    
    TestLogger.info('Test data setup completed:', {
      artist: { id: artist.id, name: artist.name },
      lyrics: { id: lyrics.id, text: lyrics.text.substring(0, 20) + '...' },
      song: { id: song.id, title: song.title }
    }, 'database');

    return { artist, lyrics, song };
  }
}
