import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { Prisma } from '@prisma/client';

interface FindAllParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: 'title' | 'artist' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  artistId?: string;
  withLyrics?: boolean;
}

@Injectable()
export class SongsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll({
    page,
    limit,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    artistId,
    withLyrics,
  }: FindAllParams) {
    const skip = (page - 1) * limit;
    const take = limit;

    // Build where clause
    const where: Prisma.SongWhereInput = {};

    // Search by title or artist name
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { artist: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Filter by artist
    if (artistId) {
      where.artistId = artistId;
    }

    // Filter songs with lyrics
    if (withLyrics) {
      where.textContents = {
        some: {
          contentType: 'LYRICS',
        },
      };
    }

    // Build orderBy clause
    let orderBy: Prisma.SongOrderByWithRelationInput = {};
    
    if (sortBy === 'artist') {
      orderBy = {
        artist: {
          name: sortOrder,
        },
      };
    } else if (sortBy === 'title') {
      orderBy = {
        title: sortOrder,
      };
    } else if (sortBy === 'updatedAt') {
      orderBy = {
        updatedAt: sortOrder,
      };
    } else {
      orderBy = {
        createdAt: sortOrder,
      };
    }

    // Get songs with count
    const [data, total] = await Promise.all([
      this.prisma.song.findMany({
        skip,
        take,
        where,
        orderBy,
        include: {
          artist: true,
          audioSources: true,
          textContents: {
            select: {
              id: true,
              contentType: true,
              language: true,
            },
          },
          _count: {
            select: {
              likedBy: true,
            },
          },
        },
      }),
      this.prisma.song.count({ where }),
    ]);

    // Transform to DTOs
    const songs = data.map((song) => ({
      ...song,
      likeCount: song._count.likedBy,
      _count: undefined,
    }));

    // Return paginated response
    return {
      data: songs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: skip + take < total,
        hasPrevPage: page > 1,
      },
    };
  }

  async findById(id: string) {
    const song = await this.prisma.song.findUnique({
      where: { id },
      include: {
        artist: true,
        audioSources: true,
        textContents: {
          include: {
            wordTimestamps: true,
          },
        },
        _count: {
          select: {
            likedBy: true,
          },
        },
      },
    });

    if (!song) {
      return null;
    }

    // Transform to DTO
    return {
      ...song,
      likeCount: song._count.likedBy,
      _count: undefined,
    };
  }

  async create(createSongDto: CreateSongDto, userId: string) {
    // Extract audioSources to create them separately
    const { audioSources, ...songData } = createSongDto;

    // Create song with related audio sources
    const song = await this.prisma.song.create({
      data: {
        ...songData,
        audioSources: {
          create: audioSources,
        },
      },
      include: {
        artist: true,
        audioSources: true,
      },
    });

    return song;
  }

  async update(id: string, updateSongDto: UpdateSongDto) {
    const { audioSources, ...songData } = updateSongDto;

    // Update song
    const song = await this.prisma.song.update({
      where: { id },
      data: songData,
      include: {
        artist: true,
        audioSources: true,
        textContents: true,
      },
    });

    // Handle audio sources separately if needed
    if (audioSources && audioSources.length > 0) {
      // Implementation would depend on requirements:
      // - Replace all existing sources?
      // - Add new sources?
      // - Update existing sources?
    }

    return song;
  }

  async remove(id: string) {
    await this.prisma.song.delete({
      where: { id },
    });
  }

  async likeSong(songId: string, userId: string) {
    try {
      await this.prisma.songLike.create({
        data: {
          songId,
          userId,
        },
      });
    } catch (error) {
      // Handle unique constraint violation
      if (error.code === 'P2002') {
        throw new ConflictException('Song already liked');
      }
      throw error;
    }
  }

  async unlikeSong(songId: string, userId: string) {
    await this.prisma.songLike.deleteMany({
      where: {
        songId,
        userId,
      },
    });
  }
}