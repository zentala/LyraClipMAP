import { IsString, IsNumber, IsOptional, IsUrl, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSongDto {
  @ApiProperty({ description: 'Song title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Artist ID' })
  @IsNumber()
  artistId: number;

  @ApiProperty({ description: 'Duration in seconds' })
  @IsNumber()
  @Min(0)
  duration: number;

  @ApiProperty({ description: 'Lyrics ID' })
  @IsNumber()
  lyricsId: number;

  @ApiProperty({ description: 'Genre' })
  @IsString()
  genre: string;

  @ApiProperty({ description: 'Release year' })
  @IsNumber()
  releaseYear: number;

  @ApiPropertyOptional({ description: 'Audio URL' })
  @IsOptional()
  @IsUrl()
  audioUrl?: string;
} 