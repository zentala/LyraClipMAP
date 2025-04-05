import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ArtistDto {
  @ApiProperty({ description: 'Artist ID' })
  id: number;

  @ApiProperty({ description: 'Artist name' })
  name: string;

  @ApiPropertyOptional({ description: 'Artist biography' })
  bio?: string;

  @ApiPropertyOptional({ description: 'Artist image URL' })
  imageUrl?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
} 