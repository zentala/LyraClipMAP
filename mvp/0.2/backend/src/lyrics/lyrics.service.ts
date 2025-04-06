import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LyricsService {
  constructor(private prisma: PrismaService) {}

  private parseLrcToTimestamps(lrcContent: string): { word: string; timestamp: number }[] {
    const lines = lrcContent.split('\n');
    const timestamps: { word: string; timestamp: number }[] = [];

    lines.forEach(line => {
      const match = line.match(/\[(\d{2}):(\d{2}\.\d{2})\](.*)/);
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseFloat(match[2]);
        const text = match[3].trim();
        const timestamp = minutes * 60 * 1000 + seconds * 1000;

        if (text) {
          timestamps.push({ word: text, timestamp });
        }
      }
    });

    return timestamps;
  }

  async searchLyrics(query: string) {
    return this.prisma.lyrics.findMany({
      where: {
        text: {
          contains: query,
        },
      },
    });
  }

  async createLyricsFromText(lyrics: string) {
    return this.prisma.lyrics.create({
      data: {
        text: lyrics,
        timestamps: [],
        language: 'en',
        sourceUrl: 'https://example.com/lyrics',
      },
    });
  }

  async createLyricsFromLrc(lyrics: string, lrcContent: string) {
    return this.prisma.lyrics.create({
      data: {
        text: lyrics,
        timestamps: this.parseLrcToTimestamps(lrcContent),
        language: 'en',
        sourceUrl: 'https://example.com/lyrics',
      },
    });
  }

  async createLyricsWithTimestamps(lyrics: string, timestamps: { word: string; timestamp: number }[]) {
    const mappedTimestamps = timestamps.map(({ word, timestamp }) => ({
      word,
      timestamp,
    }));

    return this.prisma.lyrics.create({
      data: {
        text: lyrics,
        timestamps: mappedTimestamps,
        language: 'en',
        sourceUrl: 'https://example.com/lyrics',
      },
    });
  }
} 