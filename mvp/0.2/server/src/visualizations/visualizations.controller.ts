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
import { VisualizationsService } from './visualizations.service';
import { CreateVisualizationDto } from './dto/create-visualization.dto';
import { UpdateVisualizationDto } from './dto/update-visualization.dto';
import { CreateReferenceImageDto } from './dto/create-reference-image.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/decorators/user.decorator';

@ApiTags('visualizations')
@Controller('visualizations')
export class VisualizationsController {
  constructor(private readonly visualizationsService: VisualizationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get visualizations' })
  @ApiQuery({ name: 'songId', required: false, type: String, description: 'Filter by song ID' })
  @ApiQuery({ name: 'clipId', required: false, type: String, description: 'Filter by clip ID' })
  @ApiResponse({ status: 200, description: 'Visualizations retrieved successfully' })
  async getVisualizations(
    @Query('songId') songId?: string,
    @Query('clipId') clipId?: string
  ) {
    return this.visualizationsService.findAll(songId, clipId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get visualization by ID' })
  @ApiParam({ name: 'id', description: 'Visualization ID' })
  @ApiResponse({ status: 200, description: 'Visualization retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Visualization not found' })
  async getVisualizationById(@Param('id') id: string) {
    const visualization = await this.visualizationsService.findById(id);
    if (!visualization) {
      throw new NotFoundException(`Visualization with ID "${id}" not found`);
    }
    return visualization;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create visualization' })
  @ApiResponse({ status: 201, description: 'Visualization created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createVisualization(
    @Body() createVisualizationDto: CreateVisualizationDto,
    @User('id') userId: string
  ) {
    return this.visualizationsService.create(createVisualizationDto, userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update visualization' })
  @ApiParam({ name: 'id', description: 'Visualization ID' })
  @ApiResponse({ status: 200, description: 'Visualization updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Visualization not found' })
  async updateVisualization(
    @Param('id') id: string,
    @Body() updateVisualizationDto: UpdateVisualizationDto,
    @User('id') userId: string
  ) {
    const visualization = await this.visualizationsService.findById(id);
    if (!visualization) {
      throw new NotFoundException(`Visualization with ID "${id}" not found`);
    }
    
    return this.visualizationsService.update(id, updateVisualizationDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete visualization' })
  @ApiParam({ name: 'id', description: 'Visualization ID' })
  @ApiResponse({ status: 204, description: 'Visualization deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Visualization not found' })
  async deleteVisualization(
    @Param('id') id: string,
    @User('id') userId: string
  ) {
    const visualization = await this.visualizationsService.findById(id);
    if (!visualization) {
      throw new NotFoundException(`Visualization with ID "${id}" not found`);
    }
    
    await this.visualizationsService.remove(id);
  }

  @Post('/reference-images')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create reference image' })
  @ApiResponse({ status: 201, description: 'Reference image created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createReferenceImage(
    @Body() createReferenceImageDto: CreateReferenceImageDto,
    @User('id') userId: string
  ) {
    return this.visualizationsService.createReferenceImage(createReferenceImageDto, userId);
  }

  @Get('/reference-images')
  @ApiOperation({ summary: 'Get reference images' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by tags or description' })
  @ApiResponse({ status: 200, description: 'Reference images retrieved successfully' })
  async getReferenceImages(@Query('search') search?: string) {
    return this.visualizationsService.findAllReferenceImages(search);
  }

  @Post(':id/generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate visualization' })
  @ApiParam({ name: 'id', description: 'Visualization ID' })
  @ApiResponse({ status: 200, description: 'Visualization generation started' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Visualization not found' })
  async generateVisualization(
    @Param('id') id: string,
    @User('id') userId: string
  ) {
    const visualization = await this.visualizationsService.findById(id);
    if (!visualization) {
      throw new NotFoundException(`Visualization with ID "${id}" not found`);
    }
    
    return this.visualizationsService.generateVisualization(id, userId);
  }
}