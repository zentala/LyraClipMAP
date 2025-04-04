import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SongsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSongDto: CreateSongDto) {
    // Sprawdź czy artysta istnieje
    const artist = await this.prisma.artist.findUnique({
      where: { id: createSongDto.artistId },
    });

    if (!artist) {
      throw new NotFoundException(`Artist with ID ${createSongDto.artistId} not found`);
    }

    // Sprawdź czy tekst istnieje (jeśli podano lyricsId)
    if (createSongDto.lyricsId) {
      const lyrics = await this.prisma.lyrics.findUnique({
        where: { id: createSongDto.lyricsId },
      });

      if (!lyrics) {
        throw new NotFoundException(`Lyrics with ID ${createSongDto.lyricsId} not found`);
      }
    }

    // Utwórz piosenkę
    return this.prisma.song.create({
      data: createSongDto,
      include: {
        artist: true,
        lyrics: createSongDto.lyricsId ? true : false,
      },
    });
  }

  async findAll() {
    try {
      const songs = await this.prisma.song.findMany({
        include: {
          artist: true,
          lyrics: true,
        },
      });

      return songs;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const song = await this.prisma.song.findUnique({
        where: { id },
        include: {
          artist: true,
          lyrics: true,
        },
      });

      if (!song) {
        throw new NotFoundException(`Song with ID ${id} not found`);
      }

      return song;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Error finding song');
    }
  }

  async update(id: number, updateSongDto: UpdateSongDto) {
    return this.prisma.$transaction(async (prisma) => {
      // Verify that the song exists
      const existingSong = await prisma.song.findUnique({
        where: { id },
      });

      if (!existingSong) {
        throw new NotFoundException(`Song with ID ${id} not found`);
      }

      // If artistId is being updated, verify that the new artist exists
      if (updateSongDto.artistId) {
        const artist = await prisma.artist.findUnique({
          where: { id: updateSongDto.artistId },
        });

        if (!artist) {
          throw new NotFoundException(`Artist with ID ${updateSongDto.artistId} not found`);
        }
      }

      // If lyricsId is being updated, verify that the new lyrics exist
      if (updateSongDto.lyricsId) {
        const lyrics = await prisma.lyrics.findUnique({
          where: { id: updateSongDto.lyricsId },
        });

        if (!lyrics) {
          throw new NotFoundException(`Lyrics with ID ${updateSongDto.lyricsId} not found`);
        }
      }

      try {
        return await prisma.song.update({
          where: { id },
          data: updateSongDto,
          include: {
            artist: true,
            lyrics: true,
          },
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2003') {
            throw new NotFoundException('Related resource not found');
          }
        }
        throw error;
      }
    });
  }

  async remove(id: number) {
    // Sprawdź czy utwór istnieje
    const song = await this.prisma.song.findUnique({
      where: { id },
      include: {
        artist: true,
        lyrics: true,
      },
    });

    if (!song) {
      throw new NotFoundException(`Song with ID ${id} not found`);
    }

    // Usuń utwór
    try {
      return await this.prisma.song.delete({
        where: { id },
        include: {
          artist: true,
          lyrics: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Song with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  async findByArtist(artistId: number) {
    try {
      // Verify that the artist exists
      const artist = await this.prisma.artist.findUnique({
        where: { id: artistId },
      });

      if (!artist) {
        throw new NotFoundException(`Artist with ID ${artistId} not found`);
      }

      return await this.prisma.song.findMany({
        where: { artistId },
        include: {
          artist: true,
          lyrics: true,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Error finding songs by artist');
    }
  }
} 