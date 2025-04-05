import { ApiProperty } from '@nestjs/swagger';
import { SongDto } from '../../songs/dto/song.dto';

export class SearchResultDto {
  @ApiProperty({ description: 'List of found items', type: [SongDto] })
  items: SongDto[];

  @ApiProperty({ description: 'Total number of items' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;

  @ApiProperty({ description: 'Whether there is a next page' })
  hasNextPage: boolean;

  @ApiProperty({ description: 'Whether there is a previous page' })
  hasPreviousPage: boolean;
} 