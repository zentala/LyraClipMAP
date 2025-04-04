import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { LyricsService } from './lyrics.service';

@Controller('lyrics')
export class LyricsController {
  constructor(private readonly lyricsService: LyricsService) {}

  @Get('search')
  async searchLyrics(@Query('q') query: string) {
    return this.lyricsService.searchLyrics(query);
  }

  @Post('generate-lrc')
  async generateLRC(
    @Body('lyrics') lyrics: string,
    @Body('timestamps') timestamps: number[],
  ) {
    return this.lyricsService.generateLRC(lyrics, timestamps);
  }

  @Post('map-timestamps')
  async mapWordTimestamps(
    @Body('lyrics') lyrics: string,
    @Body('timestamps') timestamps: number[],
  ) {
    return this.lyricsService.mapWordTimestamps(lyrics, timestamps);
  }
} 