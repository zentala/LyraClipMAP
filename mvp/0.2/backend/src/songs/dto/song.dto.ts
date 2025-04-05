import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArtistDto } from '../../artists/dto/artist.dto';
import { LyricsDto } from '../../lyrics/dto/lyrics.dto';

export class SongDto {
  @ApiProperty({ description: 'Song ID' })
  id: number;

  @ApiProperty({ description: 'Song title' })
  title: string;

  @ApiProperty({ description: 'Artist information' })
  artist: ArtistDto;

  @ApiProperty({ description: 'Duration in seconds' })
  duration: number;

  @ApiPropertyOptional({ description: 'Audio URL' })
  audioUrl?: string;

  @ApiPropertyOptional({ description: 'Lyrics information' })
  lyrics?: LyricsDto;

  @ApiPropertyOptional({ description: 'Genre' })
  genre?: string;

  @ApiPropertyOptional({ description: 'Release year' })
  releaseYear?: number;

  @ApiPropertyOptional({ description: 'Relevance score for search results' })
  relevanceScore?: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
} 