import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, HttpStatus, HttpCode } from '@nestjs/common';
import { SongsService } from './songs.service';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('songs')
@Controller('songs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new song' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Song created successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Artist or lyrics not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - requires admin role' })
  async create(@Body() createSongDto: CreateSongDto) {
    return this.songsService.create(createSongDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all songs' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Songs retrieved successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  findAll() {
    return this.songsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a song by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Song retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Song not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.songsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a song' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Song updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Song, artist, or lyrics not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - requires admin role' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSongDto: UpdateSongDto,
  ) {
    return this.songsService.update(id, updateSongDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a song' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Song deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Song not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - requires admin role' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.songsService.remove(id);
  }

  @Get('artist/:artistId')
  @ApiOperation({ summary: 'Get all songs by artist ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Songs retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Artist not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  findByArtist(@Param('artistId', ParseIntPipe) artistId: number) {
    return this.songsService.findByArtist(artistId);
  }
} 