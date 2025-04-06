import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsArray, IsObject } from 'class-validator';

export class SpotifyArtistDto {
  @ApiProperty({ description: 'Spotify artist ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Artist name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Artist images' })
  @IsArray()
  @IsOptional()
  images?: { url: string; height: number; width: number }[];
}

export class SpotifyTrackDto {
  @ApiProperty({ description: 'Spotify track ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Track name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Track artists' })
  @IsArray()
  artists: SpotifyArtistDto[];

  @ApiPropertyOptional({ description: 'Album name' })
  @IsObject()
  @IsOptional()
  album?: {
    name: string;
    images?: { url: string; height: number; width: number }[];
    release_date?: string;
  };

  @ApiProperty({ description: 'Track duration in milliseconds' })
  @IsNumber()
  durationMs: number;

  @ApiPropertyOptional({ description: 'Preview URL' })
  @IsString()
  @IsOptional()
  previewUrl?: string;

  @ApiPropertyOptional({ description: 'Whether the track is explicit' })
  @IsBoolean()
  @IsOptional()
  explicit?: boolean;

  @ApiPropertyOptional({ description: 'Track popularity' })
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