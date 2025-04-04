import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Param, 
  Query, 
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  Body,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiConsumes, 
  ApiBody,
  ApiBearerAuth 
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/decorators/user.decorator';

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get uploads' })
  @ApiResponse({ status: 200, description: 'Uploads retrieved successfully' })
  async getUploads(
    @User('id') userId: string,
    @Query('purpose') purpose?: string,
    @Query('songId') songId?: string
  ) {
    return this.uploadsService.findAll(userId, purpose, songId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        purpose: {
          type: 'string',
          enum: ['AUDIO', 'IMAGE', 'REFERENCE_IMAGE', 'LYRICS', 'OTHER'],
        },
        songId: {
          type: 'string',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB max
          new FileTypeValidator({ fileType: /(audio|image|text)\/.+/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto,
    @User('id') userId: string
  ) {
    return this.uploadsService.upload(file, uploadFileDto, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get upload by ID' })
  @ApiParam({ name: 'id', description: 'Upload ID' })
  @ApiResponse({ status: 200, description: 'Upload retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Upload not found' })
  async getUploadById(@Param('id') id: string) {
    const upload = await this.uploadsService.findById(id);
    if (!upload) {
      throw new NotFoundException(`Upload with ID "${id}" not found`);
    }
    return upload;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete upload' })
  @ApiParam({ name: 'id', description: 'Upload ID' })
  @ApiResponse({ status: 204, description: 'Upload deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Upload not found' })
  async deleteUpload(
    @Param('id') id: string,
    @User('id') userId: string
  ) {
    const upload = await this.uploadsService.findById(id);
    if (!upload) {
      throw new NotFoundException(`Upload with ID "${id}" not found`);
    }
    
    if (upload.uploaderId && upload.uploaderId !== userId) {
      throw new NotFoundException(`Upload with ID "${id}" not found`);
    }
    
    await this.uploadsService.remove(id);
  }
}