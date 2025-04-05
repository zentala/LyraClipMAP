import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchResultDto } from './dto/search-result.dto';
import { SearchQueryDto } from './dto/search-query.dto';
import { SongDto } from '../songs/dto/song.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('songs')
  @ApiOperation({ summary: 'Search songs with filtering and pagination' })
  @ApiQuery({ name: 'q', required: false, description: 'Search query' })
  @ApiQuery({ name: 'artist', required: false, description: 'Filter by artist name' })
  @ApiQuery({ name: 'genre', required: false, description: 'Filter by genre' })
  @ApiQuery({ name: 'yearFrom', required: false, description: 'Filter by release year from' })
  @ApiQuery({ name: 'yearTo', required: false, description: 'Filter by release year to' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'Returns paginated search results', type: SearchResultDto })
  async searchSongs(@Query() query: SearchQueryDto): Promise<SearchResultDto | SongDto[]> {
    const result = await this.searchService.searchSongs(query);

    // If only filtering parameters are present (artist, genre, yearFrom, yearTo), return array
    if (query.artist || query.genre || query.yearFrom || query.yearTo) {
      return result.items;
    }

    // Otherwise return paginated result with metadata
    return result;
  }
} 