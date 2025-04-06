import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { PlaylistPermission } from '@prisma/client';

@Injectable()
export class PlaylistsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, createPlaylistDto: CreatePlaylistDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.prisma.playlist.create({
      data: {
        ...createPlaylistDto,
        userId,
      }
    });
  }

  async findAllByUserId(userId: number) {
    return this.prisma.playlist.findMany({
      where: { userId },
      include: {
        songs: {
          include: {
            song: true
          }
        },
        shares: true
      }
    });
  }

  async findPublicByUserId(userId: number) {
    return this.prisma.playlist.findMany({
      where: {
        userId,
        isPublic: true,
      },
      include: {
        songs: {
          include: {
            song: true
          }
        }
      }
    });
  }

  async findOne(id: number, userId: number) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id, userId },
      include: { 
        songs: true,
        shares: true
      }
    });

    if (!playlist) {
      throw new NotFoundException(`Playlist with ID ${id} not found`);
    }

    return playlist;
  }

  async update(
    id: number,
    userId: number,
    updatePlaylistDto: {
      name?: string;
      description?: string;
      isPublic?: boolean;
    },
  ) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id, userId },
    });

    if (!playlist) {
      throw new NotFoundException(`Playlist with ID ${id} not found`);
    }

    return this.prisma.playlist.update({
      where: { id, userId },
      data: updatePlaylistDto,
    });
  }

  async remove(id: number, userId: number) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id, userId },
    });

    if (!playlist) {
      throw new NotFoundException(`Playlist with ID ${id} not found`);
    }

    return this.prisma.playlist.delete({
      where: { id, userId },
    });
  }

  async addSong(playlistId: number, userId: number, songId: number, order: number) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId, userId },
    });

    if (!playlist) {
      throw new NotFoundException(`Playlist with ID ${playlistId} not found`);
    }

    const song = await this.prisma.song.findUnique({
      where: { id: songId },
    });

    if (!song) {
      throw new NotFoundException(`Song with ID ${songId} not found`);
    }

    return this.prisma.playlistSong.create({
      data: {
        playlistId,
        songId,
        order,
      },
    });
  }

  async removeSong(playlistId: number, userId: number, songId: number) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
      include: {
        shares: true
      }
    });

    if (!playlist) {
      throw new NotFoundException(`Playlist with ID ${playlistId} not found`);
    }

    if (playlist.userId !== userId) {
      const hasEditAccess = playlist.shares.some(
        share => share.userId === userId && share.permission === PlaylistPermission.EDIT
      );

      if (!hasEditAccess) {
        throw new ForbiddenException('You do not have permission to edit this playlist');
      }
    }

    const songInPlaylist = await this.prisma.playlistSong.findMany({
      where: {
        playlistId,
        songId
      }
    });

    if (!songInPlaylist.length) {
      throw new NotFoundException(`Song with ID ${songId} not found in playlist ${playlistId}`);
    }

    await this.prisma.playlistSong.delete({
      where: {
        playlistId_songId: {
          playlistId,
          songId
        }
      }
    });

    // Reorder remaining songs
    const remainingSongs = await this.prisma.playlistSong.findMany({
      where: { playlistId },
      orderBy: { order: 'asc' }
    });

    for (let i = 0; i < remainingSongs.length; i++) {
      await this.prisma.playlistSong.update({
        where: { id: remainingSongs[i].id },
        data: { order: i + 1 }
      });
    }
  }

  async addSongs(playlistId: number, userId: number, songIds: number[]) {
    const playlist = await this.findOne(playlistId, userId);

    if (playlist.userId !== userId) {
      const hasEditAccess = playlist.shares.some(
        share => share.userId === userId && share.permission === PlaylistPermission.EDIT
      );

      if (!hasEditAccess) {
        throw new ForbiddenException('You do not have permission to edit this playlist');
      }
    }

    const currentOrder = await this.prisma.playlistSong.count({
      where: { playlistId }
    });

    const songsToAdd = songIds.map((songId, index) => ({
      playlistId,
      songId,
      order: currentOrder + index + 1
    }));

    await this.prisma.playlistSong.createMany({
      data: songsToAdd
    });

    return this.findOne(playlistId, userId);
  }

  async share(playlistId: number, ownerId: number, targetUserId: number, permission: PlaylistPermission) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId }
    });

    if (!playlist) {
      throw new NotFoundException(`Playlist with ID ${playlistId} not found`);
    }

    if (playlist.userId !== ownerId) {
      throw new ForbiddenException('You do not have permission to share this playlist');
    }

    // Check if user exists
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId }
    });

    if (!targetUser) {
      throw new NotFoundException(`User with ID ${targetUserId} not found`);
    }

    // Check if share already exists
    const existingShare = await this.prisma.playlistShare.findFirst({
      where: {
        playlistId,
        userId: targetUserId
      }
    });

    if (existingShare) {
      return this.prisma.playlistShare.update({
        where: { id: existingShare.id },
        data: { permission }
      });
    }

    return this.prisma.playlistShare.create({
      data: {
        playlistId,
        userId: targetUserId,
        permission
      }
    });
  }
} 