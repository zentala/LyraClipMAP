import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchResultDto } from './dto/search-result.dto';
import { Prisma, Song, Artist, Lyrics } from '@prisma/client';
import { SongDto } from '../songs/dto/song.dto';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async searchSongs(query: SearchQueryDto): Promise<SearchResultDto> {
    const {
      q,
      artist,
      genre,
      yearFrom,
      yearTo,
      page = 1,
      limit = 10
    } = query;

    // Build where clause based on filters
    const where: Prisma.SongWhereInput = {};

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { artist: { name: { contains: q, mode: 'insensitive' } } }
      ];
    }

    if (artist) {
      where.artist = { name: { contains: artist, mode: 'insensitive' } };
    }

    if (genre) {
      where.genre = { equals: genre, mode: 'insensitive' };
    }

    if (yearFrom || yearTo) {
      where.releaseYear = {};
      if (yearFrom) where.releaseYear.gte = Number(yearFrom);
      if (yearTo) where.releaseYear.lte = Number(yearTo);
    }

    // Get total count
    const total = await this.prisma.song.count({ where });
    const totalPages = Math.ceil(total / limit);

    // Get paginated results
    const items = await this.prisma.song.findMany({
      where,
      include: {
        artist: true,
        lyrics: true
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: [
        { createdAt: 'desc' }
      ]
    });

    // Calculate relevance scores for results if search query is provided
    const itemsWithRelevance = items.map(item => {
      let relevanceScore = 0;
      if (q) {
        // Calculate title match score
        const titleMatch = item.title.toLowerCase().includes(q.toLowerCase());
        const exactTitleMatch = item.title.toLowerCase() === q.toLowerCase();
        
        // Calculate artist name match score
        const artistMatch = item.artist.name.toLowerCase().includes(q.toLowerCase());
        const exactArtistMatch = item.artist.name.toLowerCase() === q.toLowerCase();

        // Weighted scoring - increased weight for exact matches
        relevanceScore = (
          (exactTitleMatch ? 1 : 0) * 0.95 + // Increased from 0.7 to 0.95
          (titleMatch ? 1 : 0) * 0.2 +       // Unchanged
          (exactArtistMatch ? 1 : 0) * 0.2 + // Unchanged
          (artistMatch ? 1 : 0) * 0.1        // Unchanged
        );
      }

      return {
        id: item.id,
        title: item.title,
        artist: {
          id: item.artist.id,
          name: item.artist.name,
          bio: item.artist.bio,
          imageUrl: item.artist.imageUrl,
          createdAt: item.artist.createdAt,
          updatedAt: item.artist.updatedAt
        },
        duration: item.duration,
        audioUrl: item.audioUrl,
        lyrics: item.lyrics ? {
          id: item.lyrics.id,
          text: item.lyrics.text,
          language: item.lyrics.language,
          sourceUrl: item.lyrics.sourceUrl,
          timestamps: item.lyrics.timestamps as Record<string, number>,
          createdAt: item.lyrics.createdAt,
          updatedAt: item.lyrics.updatedAt
        } : undefined,
        genre: item.genre,
        releaseYear: item.releaseYear,
        relevanceScore,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      } as SongDto;
    });

    // Sort by relevance score if search query is provided
    if (q) {
      itemsWithRelevance.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    return {
      items: itemsWithRelevance,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    };
  }
} 