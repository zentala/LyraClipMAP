import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PlaylistService } from './playlists.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Prisma } from '@prisma/client';

@Controller('playlists')
@UseGuards(JwtAuthGuard)
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Post()
  create(@Request() req, @Body() createPlaylistDto: Prisma.PlaylistCreateInput) {
    return this.playlistService.create(req.user.id, createPlaylistDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.playlistService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.playlistService.findOne(+id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updatePlaylistDto: Prisma.PlaylistUpdateInput,
  ) {
    return this.playlistService.update(+id, req.user.id, updatePlaylistDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.playlistService.remove(+id, req.user.id);
  }

  @Post(':id/songs/:songId')
  addSong(
    @Param('id') id: string,
    @Param('songId') songId: string,
    @Request() req,
    @Body('order') order: number,
  ) {
    return this.playlistService.addSong(+id, req.user.id, +songId, order);
  }

  @Delete(':id/songs/:songId')
  removeSong(
    @Param('id') id: string,
    @Param('songId') songId: string,
    @Request() req,
  ) {
    return this.playlistService.removeSong(+id, req.user.id, +songId);
  }
} 