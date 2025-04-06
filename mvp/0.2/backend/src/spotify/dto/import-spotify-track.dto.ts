import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ImportSpotifyTrackDto {
  @ApiProperty({ 
    description: 'Spotify track ID to import',
    example: '1234567890abcdef'
  })
  @IsString()
  trackId: string;

  @ApiProperty({ 
    description: 'Optional artist ID to associate with',
    example: '1',
    required: false
  })
  @IsString()
  @IsOptional()
  artistId?: string;

  @ApiProperty({ 
    description: 'Whether to fetch audio features from Spotify API',
    example: true,
    default: true,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  fetchAudioFeatures?: boolean;
} 