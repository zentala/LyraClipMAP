import { Module } from '@nestjs/common';
import { PlaylistService } from './playlists.service';
import { PlaylistController } from './playlists.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PlaylistController],
  providers: [PlaylistService],
  exports: [PlaylistService],
})
export class PlaylistsModule {} 