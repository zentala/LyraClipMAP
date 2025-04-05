import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LyricsDto {
  @ApiProperty({ description: 'Lyrics ID' })
  id: number;

  @ApiProperty({ description: 'Lyrics text content' })
  text: string;

  @ApiPropertyOptional({ description: 'Language code' })
  language?: string;

  @ApiPropertyOptional({ description: 'Source URL' })
  sourceUrl?: string;

  @ApiPropertyOptional({ description: 'LRC format timestamps' })
  timestamps?: Record<string, number>;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
} 