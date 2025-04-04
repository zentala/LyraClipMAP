import { IsString, IsNumber, IsOptional, IsUrl, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSongDto {
  @ApiProperty({ description: 'Song title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Artist ID' })
  @IsNumber()
  artistId: number;

  @ApiPropertyOptional({ description: 'Duration in seconds' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;

  @ApiPropertyOptional({ description: 'Audio URL' })
  @IsOptional()
  @IsUrl()
  audioUrl?: string;

  @ApiPropertyOptional({ description: 'Lyrics ID' })
  @IsOptional()
  @IsNumber()
  lyricsId?: number;
} 