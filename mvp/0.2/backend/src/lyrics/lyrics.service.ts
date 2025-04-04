import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LyricsService {
  constructor(private readonly prisma: PrismaService) {}

  async searchLyrics(query: string) {
    return this.prisma.lyrics.findMany({
      where: {
        content: {
          contains: query,
        },
      },
    });
  }

  async generateLRC(lyrics: string, timestamps: number[]) {
    const lines = lyrics.split('\n');
    const lrcLines = [];
    
    // Zakładamy, że każda linia ma odpowiadający jej timestamp
    for (let i = 0; i < Math.min(lines.length, timestamps.length); i++) {
      const time = new Date(timestamps[i]);
      const minutes = time.getUTCMinutes().toString().padStart(2, '0');
      const seconds = time.getUTCSeconds().toString().padStart(2, '0');
      const milliseconds = Math.floor(time.getUTCMilliseconds() / 10).toString().padStart(2, '0');
      
      lrcLines.push(`[${minutes}:${seconds}.${milliseconds}]${lines[i].trim()}`);
    }
    
    const lrcContent = lrcLines.join('\n');
    
    return this.prisma.lyrics.create({
      data: {
        content: lyrics,
        lrc: lrcContent,
        timestamps: timestamps,
      },
    });
  }

  async mapWordTimestamps(lyrics: string, timestamps: number[]) {
    const words = lyrics.split(/\s+/);
    const mappedTimestamps = [];
    
    // Zakładamy, że każde słowo ma odpowiadający mu timestamp
    for (let i = 0; i < Math.min(words.length, timestamps.length); i++) {
      mappedTimestamps.push({
        word: words[i],
        timestamp: timestamps[i],
      });
    }
    
    return this.prisma.lyrics.create({
      data: {
        content: lyrics,
        timestamps: mappedTimestamps,
      },
    });
  }
} 