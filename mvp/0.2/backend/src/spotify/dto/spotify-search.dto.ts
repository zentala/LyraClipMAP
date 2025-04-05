import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

enum SpotifySearchType {
  TRACK = 'track',
  ARTIST = 'artist',
  ALBUM = 'album',
  PLAYLIST = 'playlist'
}

export class SpotifySearchDto {
  @ApiProperty({ 
    description: 'Search query',
    example: 'The Beatles Yesterday'
  })
  @IsString()
  @IsNotEmpty()
  query: string;

  @ApiPropertyOptional({ 
    description: 'Search type',
    enum: SpotifySearchType,
    default: SpotifySearchType.TRACK
  })
  @IsEnum(SpotifySearchType)
  @IsOptional()
  type?: SpotifySearchType;

  @ApiPropertyOptional({ 
    description: 'Limit results',
    default: 10
  })
  @IsOptional()
  limit?: number;
} 