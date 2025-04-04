import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query, 
  UseGuards,
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
import { SpotifyService } from './spotify.service';
import { SpotifySearchDto } from './dto/spotify-search.dto';
import { ImportSpotifyTrackDto } from './dto/import-spotify-track.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/decorators/user.decorator';

@ApiTags('spotify')
@Controller('spotify')
export class SpotifyController {
  constructor(private readonly spotifyService: SpotifyService) {}

  @Get('/search')
  @ApiOperation({ summary: 'Search Spotify' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  async searchSpotify(@Query() spotifySearchDto: SpotifySearchDto) {
    return this.spotifyService.search(spotifySearchDto);
  }

  @Get('/tracks/:id')
  @ApiOperation({ summary: 'Get Spotify track details' })
  @ApiParam({ name: 'id', description: 'Spotify track ID' })
  @ApiResponse({ status: 200, description: 'Track details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Track not found' })
  async getTrackDetails(@Param('id') id: string) {
    const track = await this.spotifyService.getTrackDetails(id);
    if (!track) {
      throw new NotFoundException(`Spotify track with ID "${id}" not found`);
    }
    return track;
  }

  @Post('/import')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Import track from Spotify' })
  @ApiResponse({ status: 201, description: 'Track imported successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async importTrack(
    @Body() importSpotifyTrackDto: ImportSpotifyTrackDto,
    @User('id') userId: string
  ) {
    return this.spotifyService.importTrack(importSpotifyTrackDto, userId);
  }

  @Get('/recommendations')
  @ApiOperation({ summary: 'Get recommendations based on seed tracks' })
  @ApiQuery({ name: 'trackIds', required: true, description: 'Comma-separated Spotify track IDs' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of recommendations' })
  @ApiResponse({ status: 200, description: 'Recommendations retrieved successfully' })
  async getRecommendations(
    @Query('trackIds') trackIds: string,
    @Query('limit') limit?: number
  ) {
    const trackIdArray = trackIds.split(',');
    return this.spotifyService.getRecommendations(trackIdArray, limit);
  }

  @Get('/audio-features/:id')
  @ApiOperation({ summary: 'Get audio features for a track' })
  @ApiParam({ name: 'id', description: 'Spotify track ID' })
  @ApiResponse({ status: 200, description: 'Audio features retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Track not found' })
  async getAudioFeatures(@Param('id') id: string) {
    const features = await this.spotifyService.getAudioFeatures(id);
    if (!features) {
      throw new NotFoundException(`Audio features for Spotify track with ID "${id}" not found`);
    }
    return features;
  }
}