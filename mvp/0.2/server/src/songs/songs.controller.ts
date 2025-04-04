import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
  ForbiddenException
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery, 
  ApiBearerAuth 
} from '@nestjs/swagger';
import { SongsService } from './songs.service';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/decorators/user.decorator';

@ApiTags('songs')
@Controller('songs')
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Get()
  @ApiOperation({ summary: 'Get songs' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ 
    name: 'sortBy', 
    required: false, 
    enum: ['title', 'artist', 'createdAt', 'updatedAt'], 
    description: 'Sort by field' 
  })
  @ApiQuery({ 
    name: 'sortOrder', 
    required: false, 
    enum: ['asc', 'desc'], 
    description: 'Sort order' 
  })
  @ApiQuery({ name: 'artistId', required: false, type: String, description: 'Filter by artist ID' })
  @ApiQuery({ name: 'withLyrics', required: false, type: Boolean, description: 'Filter songs with lyrics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Songs retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              // Other song properties...
            }
          }
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
            hasNextPage: { type: 'boolean' },
            hasPrevPage: { type: 'boolean' }
          }
        }
      }
    }
  })
  async getSongs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: 'title' | 'artist' | 'createdAt' | 'updatedAt',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('artistId') artistId?: string,
    @Query('withLyrics') withLyrics?: boolean,
  ) {
    return this.songsService.findAll({
      page: page ?? 1,
      limit: limit ?? 10,
      search,
      sortBy,
      sortOrder,
      artistId,
      withLyrics
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get song by ID' })
  @ApiParam({ name: 'id', description: 'Song ID' })
  @ApiResponse({ status: 200, description: 'Song retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Song not found' })
  async getSongById(@Param('id') id: string) {
    const song = await this.songsService.findById(id);
    if (!song) {
      throw new NotFoundException(`Song with ID "${id}" not found`);
    }
    return song;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create song' })
  @ApiResponse({ status: 201, description: 'Song created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createSong(
    @Body() createSongDto: CreateSongDto,
    @User('id') userId: string
  ) {
    return this.songsService.create(createSongDto, userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update song' })
  @ApiParam({ name: 'id', description: 'Song ID' })
  @ApiResponse({ status: 200, description: 'Song updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Song not found' })
  async updateSong(
    @Param('id') id: string,
    @Body() updateSongDto: UpdateSongDto,
    @User('id') userId: string
  ) {
    // In a real implementation, you would check if the user has permission to update this song
    const song = await this.songsService.findById(id);
    if (!song) {
      throw new NotFoundException(`Song with ID "${id}" not found`);
    }
    
    return this.songsService.update(id, updateSongDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete song' })
  @ApiParam({ name: 'id', description: 'Song ID' })
  @ApiResponse({ status: 204, description: 'Song deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Song not found' })
  async deleteSong(
    @Param('id') id: string,
    @User('id') userId: string
  ) {
    // In a real implementation, you would check if the user has permission to delete this song
    const song = await this.songsService.findById(id);
    if (!song) {
      throw new NotFoundException(`Song with ID "${id}" not found`);
    }
    
    await this.songsService.remove(id);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Like song' })
  @ApiParam({ name: 'id', description: 'Song ID' })
  @ApiResponse({ status: 201, description: 'Song liked successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Song not found' })
  @ApiResponse({ status: 409, description: 'Song already liked' })
  async likeSong(
    @Param('id') id: string,
    @User('id') userId: string
  ) {
    const song = await this.songsService.findById(id);
    if (!song) {
      throw new NotFoundException(`Song with ID "${id}" not found`);
    }
    
    return this.songsService.likeSong(id, userId);
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unlike song' })
  @ApiParam({ name: 'id', description: 'Song ID' })
  @ApiResponse({ status: 204, description: 'Song unliked successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Song not found or not liked' })
  async unlikeSong(
    @Param('id') id: string,
    @User('id') userId: string
  ) {
    const song = await this.songsService.findById(id);
    if (!song) {
      throw new NotFoundException(`Song with ID "${id}" not found`);
    }
    
    await this.songsService.unlikeSong(id, userId);
  }
}