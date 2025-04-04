import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class ImportSpotifyTrackDto {
  @ApiProperty({ 
    description: 'Spotify track ID',
    example: '4cOdK2wGLETKBW3PvgPWqT'
  })
  @IsString()
  @IsNotEmpty()
  trackId: string;

  @ApiPropertyOptional({ 
    description: 'Artist ID in our system (optional, will create new if not provided)',
    example: 'cjk2a3b4c5d6e7f8g9h0i1j2k'
  })
  @IsString()
  @IsOptional()
  artistId?: string;

  @ApiPropertyOptional({ 
    description: 'Whether to fetch lyrics automatically',
    default: true
  })
  @IsBoolean()
  @IsOptional()
  fetchLyrics?: boolean;

  @ApiPropertyOptional({ 
    description: 'Whether to fetch audio features from Spotify',
    default: true
  })
  @IsBoolean()
  @IsOptional()
  fetchAudioFeatures?: boolean;
}