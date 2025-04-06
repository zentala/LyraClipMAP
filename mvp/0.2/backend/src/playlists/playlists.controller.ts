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
  HttpCode,
  HttpStatus,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Prisma } from '@prisma/client';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { AddSongsDto } from './dto/add-songs.dto';
import { SharePlaylistDto } from './dto/share-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PlaylistPermission } from '@prisma/client';

@ApiTags('playlists')
@Controller('playlists')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new playlist' })
  @ApiResponse({ status: 201, description: 'The playlist has been successfully created.' })
  create(@Req() req: any, @Body() createPlaylistDto: CreatePlaylistDto) {
    return this.playlistsService.create(req.user.id, createPlaylistDto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get all playlists for the current user' })
  @ApiResponse({ status: 200, description: 'Return all playlists for the current user.' })
  async findMyPlaylists(@Request() req) {
    return this.playlistsService.findAllByUserId(req.user.id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get public playlists for a specific user' })
  @ApiResponse({ status: 200, description: 'Return public playlists for the specified user.' })
  async findUserPlaylists(@Param('userId') userId: string) {
    return this.playlistsService.findPublicByUserId(parseInt(userId));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a playlist by ID' })
  @ApiResponse({ status: 200, description: 'Return the playlist.' })
  @ApiResponse({ status: 404, description: 'Playlist not found.' })
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.playlistsService.findOne(+id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a playlist' })
  @ApiResponse({ status: 200, description: 'The playlist has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Playlist not found.' })
  update(@Param('id') id: string, @Req() req: any, @Body() updatePlaylistDto: UpdatePlaylistDto) {
    return this.playlistsService.update(+id, req.user.id, {
      name: updatePlaylistDto.name,
      description: updatePlaylistDto.description,
      isPublic: updatePlaylistDto.isPublic,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.playlistsService.remove(+id, req.user.id);
  }

  @Post(':id/songs')
  @ApiOperation({ summary: 'Add songs to a playlist' })
  @ApiResponse({ status: 200, description: 'The songs have been successfully added to the playlist.' })
  async addSongs(
    @Request() req,
    @Param('id') id: string,
    @Body() addSongsDto: AddSongsDto,
  ) {
    return this.playlistsService.addSongs(parseInt(id), req.user.id, addSongsDto.songIds);
  }

  @Delete(':id/songs/:songId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a song from a playlist' })
  @ApiResponse({ status: 204, description: 'The song has been successfully removed from the playlist.' })
  async removeSong(
    @Request() req,
    @Param('id') id: string,
    @Param('songId') songId: string,
  ) {
    await this.playlistsService.removeSong(parseInt(id), req.user.id, parseInt(songId));
  }

  @Post(':id/share')
  @ApiOperation({ summary: 'Share a playlist with another user' })
  @ApiResponse({ status: 200, description: 'The playlist has been successfully shared.' })
  @ApiResponse({ status: 404, description: 'Playlist or user not found.' })
  share(
    @Param('id') id: string,
    @Req() req: any,
    @Body() sharePlaylistDto: SharePlaylistDto,
  ) {
    return this.playlistsService.share(
      +id,
      req.user.id,
      sharePlaylistDto.targetUserId,
      sharePlaylistDto.permission,
    );
  }
} 