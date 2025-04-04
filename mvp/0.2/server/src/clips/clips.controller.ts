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
import { ClipsService } from './clips.service';
import { CreateClipDto } from './dto/create-clip.dto';
import { UpdateClipDto } from './dto/update-clip.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/decorators/user.decorator';

@ApiTags('clips')
@Controller('clips')
export class ClipsController {
  constructor(private readonly clipsService: ClipsService) {}

  @Get()
  @ApiOperation({ summary: 'Get clips' })
  @ApiQuery({ name: 'songId', required: false, type: String, description: 'Filter by song ID' })
  @ApiResponse({ status: 200, description: 'Clips retrieved successfully' })
  async getClips(@Query('songId') songId?: string) {
    return this.clipsService.findAll(songId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get clip by ID' })
  @ApiParam({ name: 'id', description: 'Clip ID' })
  @ApiResponse({ status: 200, description: 'Clip retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Clip not found' })
  async getClipById(@Param('id') id: string) {
    const clip = await this.clipsService.findById(id);
    if (!clip) {
      throw new NotFoundException(`Clip with ID "${id}" not found`);
    }
    return clip;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create clip' })
  @ApiResponse({ status: 201, description: 'Clip created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createClip(
    @Body() createClipDto: CreateClipDto,
    @User('id') userId: string
  ) {
    return this.clipsService.create(createClipDto, userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update clip' })
  @ApiParam({ name: 'id', description: 'Clip ID' })
  @ApiResponse({ status: 200, description: 'Clip updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Clip not found' })
  async updateClip(
    @Param('id') id: string,
    @Body() updateClipDto: UpdateClipDto,
    @User('id') userId: string
  ) {
    const clip = await this.clipsService.findById(id);
    if (!clip) {
      throw new NotFoundException(`Clip with ID "${id}" not found`);
    }
    
    return this.clipsService.update(id, updateClipDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete clip' })
  @ApiParam({ name: 'id', description: 'Clip ID' })
  @ApiResponse({ status: 204, description: 'Clip deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Clip not found' })
  async deleteClip(
    @Param('id') id: string,
    @User('id') userId: string
  ) {
    const clip = await this.clipsService.findById(id);
    if (!clip) {
      throw new NotFoundException(`Clip with ID "${id}" not found`);
    }
    
    await this.clipsService.remove(id);
  }
}