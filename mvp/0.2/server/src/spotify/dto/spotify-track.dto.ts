import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsArray, IsObject } from 'class-validator';

export class SpotifyArtistDto {
  @ApiProperty({ description: 'Spotify artist ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Artist name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Artist image URL' })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}

export class SpotifyTrackDto {
  @ApiProperty({ description: 'Spotify track ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Track name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Artists' })
  @IsArray()
  artists: SpotifyArtistDto[];

  @ApiPropertyOptional({ description: 'Album name' })
  @IsString()
  @IsOptional()
  album?: string;

  @ApiPropertyOptional({ description: 'Album image URL' })
  @IsString()
  @IsOptional()
  albumImageUrl?: string;

  @ApiPropertyOptional({ description: 'Duration in milliseconds' })
  @IsNumber()
  @IsOptional()
  durationMs?: number;

  @ApiPropertyOptional({ description: 'Preview URL' })
  @IsString()
  @IsOptional()
  previewUrl?: string;

  @ApiPropertyOptional({ description: 'Explicit content' })
  @IsBoolean()
  @IsOptional()
  explicit?: boolean;

  @ApiPropertyOptional({ description: 'Popularity (0-100)' })
  @IsNumber()
  @IsOptional()
  popularity?: number;

  @ApiPropertyOptional({ description: 'Audio features' })
  @IsObject()
  @IsOptional()
  audioFeatures?: {
    danceability?: number;
    energy?: number;
    key?: number;
    loudness?: number;
    mode?: number;
    speechiness?: number;
    acousticness?: number;
    instrumentalness?: number;
    liveness?: number;
    valence?: number;
    tempo?: number;
  };
}