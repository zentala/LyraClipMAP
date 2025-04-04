import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery, 
  ApiBearerAuth 
} from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { AddTagToSongDto } from './dto/add-tag-to-song.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/decorators/user.decorator';

@ApiTags('tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @ApiOperation({ summary: 'Get tags' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiResponse({ status: 200, description: 'Tags retrieved successfully' })
  async getTags(@Query('category') category?: string) {
    return this.tagsService.findAll(category);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create tag' })
  @ApiResponse({ status: 201, description: 'Tag created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createTag(
    @Body() createTagDto: CreateTagDto,
    @User('id') userId: string
  ) {
    return this.tagsService.create(createTagDto);
  }

  @Post('/songs/:songId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add tag to song' })
  @ApiParam({ name: 'songId', description: 'Song ID' })
  @ApiResponse({ status: 201, description: 'Tag added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Song not found' })
  async addTagToSong(
    @Param('songId') songId: string,
    @Body() addTagToSongDto: AddTagToSongDto,
    @User('id') userId: string
  ) {
    return this.tagsService.addTagToSong(songId, addTagToSongDto, userId);
  }

  @Delete('/songs/:songId/:tagId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove tag from song' })
  @ApiParam({ name: 'songId', description: 'Song ID' })
  @ApiParam({ name: 'tagId', description: 'Tag ID' })
  @ApiResponse({ status: 204, description: 'Tag removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Song or tag not found' })
  async removeTagFromSong(
    @Param('songId') songId: string,
    @Param('tagId') tagId: string,
    @User('id') userId: string
  ) {
    await this.tagsService.removeTagFromSong(songId, tagId, userId);
  }

  @Get('/songs/:songId')
  @ApiOperation({ summary: 'Get song tags' })
  @ApiParam({ name: 'songId', description: 'Song ID' })
  @ApiResponse({ status: 200, description: 'Song tags retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Song not found' })
  async getSongTags(@Param('songId') songId: string) {
    return this.tagsService.findBysSongId(songId);
  }

  @Get('/analysis/songs/:songId')
  @ApiOperation({ summary: 'Analyze song sentiment and energy' })
  @ApiParam({ name: 'songId', description: 'Song ID' })
  @ApiResponse({ status: 200, description: 'Song analysis results' })
  @ApiResponse({ status: 404, description: 'Song not found' })
  async analyzeSong(@Param('songId') songId: string) {
    return this.tagsService.analyzeSong(songId);
  }
}