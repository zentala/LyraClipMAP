import { Module } from '@nestjs/common';
import { LyricsService } from './lyrics.service';
import { LyricsController } from './lyrics.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LyricsController],
  providers: [LyricsService],
  exports: [LyricsService],
})
export class LyricsModule {} 