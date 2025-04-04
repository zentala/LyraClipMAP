import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PlaylistService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: number,
    createPlaylistDto: Prisma.PlaylistCreateInput,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.prisma.playlist.create({
      data: {
        ...createPlaylistDto,
        userId,
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.playlist.findMany({
      where: { userId },
      include: { songs: true },
    });
  }

  async findOne(id: number, userId: number) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id, userId },
      include: { songs: true },
    });

    if (!playlist) {
      throw new NotFoundException(`Playlist with ID ${id} not found`);
    }

    return playlist;
  }

  async update(
    id: number,
    userId: number,
    updatePlaylistDto: Prisma.PlaylistUpdateInput,
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
      where: { id: playlistId, userId },
    });

    if (!playlist) {
      throw new NotFoundException(`Playlist with ID ${playlistId} not found`);
    }

    const playlistSong = await this.prisma.playlistSong.findMany({
      where: {
        playlistId,
        songId,
      },
    });

    if (playlistSong.length === 0) {
      throw new NotFoundException(
        `Song with ID ${songId} not found in playlist ${playlistId}`,
      );
    }

    return this.prisma.playlistSong.delete({
      where: {
        playlistId_songId: {
          playlistId,
          songId,
        },
      },
    });
  }
} 