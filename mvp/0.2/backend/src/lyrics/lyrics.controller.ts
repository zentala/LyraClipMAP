import { Controller, Post, Body } from '@nestjs/common';
import { LyricsService } from './lyrics.service';

@Controller('lyrics')
export class LyricsController {
  constructor(private readonly lyricsService: LyricsService) {}

  @Post('search')
  async searchLyrics(@Body('query') query: string) {
    return this.lyricsService.searchLyrics(query);
  }

  @Post('lrc')
  async createLyricsFromLrc(
    @Body('lyrics') lyrics: string,
    @Body('lrcContent') lrcContent: string,
  ) {
    return this.lyricsService.createLyricsFromLrc(lyrics, lrcContent);
  }

  @Post('timestamps')
  async createLyricsWithTimestamps(
    @Body('lyrics') lyrics: string,
    @Body('timestamps') timestamps: { word: string; timestamp: number }[],
  ) {
    return this.lyricsService.createLyricsWithTimestamps(lyrics, timestamps);
  }
} 