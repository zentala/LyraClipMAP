import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { SpotifyTrackDto } from './dto/spotify-track.dto';
import { ImportSpotifyTrackDto } from './dto/import-spotify-track.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SpotifyService {
  private baseUrl = 'https://api.spotify.com/v1';
  private accessToken: string | null = null;
  private tokenExpiration: Date | null = null;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  /**
   * Gets an access token from Spotify API
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiration && this.tokenExpiration > new Date()) {
      return this.accessToken;
    }

    const clientId = this.configService.get<string>('SPOTIFY_CLIENT_ID');
    const clientSecret = this.configService.get<string>('SPOTIFY_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new BadRequestException('Spotify credentials not configured');
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://accounts.spotify.com/api/token',
          'grant_type=client_credentials',
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
            },
          },
        ),
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiration = new Date(Date.now() + response.data.expires_in * 1000);
      return this.accessToken;
    } catch (error) {
      throw new BadRequestException('Failed to get Spotify access token');
    }
  }

  /**
   * Search for tracks on Spotify
   */
  async searchTracks(query: string, limit = 10): Promise<SpotifyTrackDto[]> {
    const token = await this.getAccessToken();
    
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/search`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { q: query, type: 'track', limit },
        }),
      );

      if (!response.data.tracks || !response.data.tracks.items) {
        return [];
      }

      return response.data.tracks.items.map((track: any) => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map((artist: any) => ({
          id: artist.id,
          name: artist.name,
        })),
        album: track.album?.name,
        albumImageUrl: track.album?.images[0]?.url,
        durationMs: track.duration_ms,
        previewUrl: track.preview_url,
        explicit: track.explicit,
        popularity: track.popularity,
      }));
    } catch (error) {
      throw new BadRequestException('Failed to search Spotify tracks');
    }
  }

  /**
   * Get track details from Spotify
   */
  async getTrackDetails(trackId: string): Promise<SpotifyTrackDto> {
    const token = await this.getAccessToken();
    
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/tracks/${trackId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );

      if (response.status === 404 || (response.data.error && response.data.error.status === 404)) {
        throw new NotFoundException(`Spotify track with ID "${trackId}" not found`);
      }

      const track = response.data;
      return {
        id: track.id,
        name: track.name,
        artists: track.artists.map((artist: any) => ({
          id: artist.id,
          name: artist.name,
        })),
        album: track.album?.name,
        albumImageUrl: track.album?.images[0]?.url,
        durationMs: track.duration_ms,
        previewUrl: track.preview_url,
        explicit: track.explicit,
        popularity: track.popularity,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to get Spotify track details');
    }
  }

  /**
   * Get audio features for a track from Spotify
   */
  async getAudioFeatures(trackId: string): Promise<any> {
    const token = await this.getAccessToken();
    
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/audio-features/${trackId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );

      if (response.status === 404 || (response.data.error && response.data.error.status === 404)) {
        throw new NotFoundException(`Audio features for Spotify track with ID "${trackId}" not found`);
      }

      return response.data;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to get Spotify audio features');
    }
  }

  /**
   * Get recommendations based on seed tracks
   */
  async getRecommendations(trackIds: string[], limit = 10): Promise<SpotifyTrackDto[]> {
    const token = await this.getAccessToken();
    
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/recommendations`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { 
            seed_tracks: trackIds.slice(0, 5).join(','), // Spotify allows max 5 seed tracks
            limit 
          },
        }),
      );

      if (!response.data.tracks) {
        return [];
      }

      return response.data.tracks.map((track: any) => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map((artist: any) => ({
          id: artist.id,
          name: artist.name,
        })),
        album: track.album?.name,
        albumImageUrl: track.album?.images[0]?.url,
        durationMs: track.duration_ms,
        previewUrl: track.preview_url,
      }));
    } catch (error) {
      throw new BadRequestException('Failed to get Spotify recommendations');
    }
  }

  /**
   * Import a track from Spotify into our database
   */
  async importTrack(importDto: ImportSpotifyTrackDto, userId: string): Promise<any> {
    const { trackId, artistId, fetchLyrics = true, fetchAudioFeatures = true } = importDto;

    // Get track details from Spotify
    const trackDetails = await this.getTrackDetails(trackId);

    // Get or create artist
    let artist;
    if (artistId) {
      // Use provided artist ID
      artist = await this.prismaService.artist.findUnique({
        where: { id: artistId },
      });
      
      if (!artist) {
        throw new NotFoundException(`Artist with ID "${artistId}" not found`);
      }
    } else {
      // Try to find artist by name
      const artistName = trackDetails.artists[0].name;
      artist = await this.prismaService.artist.findFirst({
        where: { name: artistName },
      });

      // Create artist if not found
      if (!artist) {
        artist = await this.prismaService.artist.create({
          data: {
            name: artistName,
            bio: null,
          },
        });
      }
    }

    // Create song
    const song = await this.prismaService.song.create({
      data: {
        title: trackDetails.name,
        artistId: artist.id,
        duration: Math.floor(trackDetails.durationMs / 1000), // Convert ms to seconds
        audioUrl: trackDetails.previewUrl,
        spotifyId: trackDetails.id,
      },
      include: {
        artist: true,
      },
    });

    // Get audio features and create tags if needed
    if (fetchAudioFeatures) {
      try {
        const audioFeatures = await this.getAudioFeatures(trackId);
        
        // Create energy tag
        if (audioFeatures.energy !== undefined) {
          const energyTag = await this.prismaService.tag.findFirst({
            where: { name: 'energy', category: 'ENERGY' },
          }) || await this.prismaService.tag.create({
            data: { name: 'energy', category: 'ENERGY' },
          });

          await this.prismaService.songTag.create({
            data: {
              songId: song.id,
              tagId: energyTag.id,
              value: audioFeatures.energy,
            },
          });
        }

        // Create danceability tag
        if (audioFeatures.danceability !== undefined) {
          const danceTag = await this.prismaService.tag.findFirst({
            where: { name: 'danceability', category: 'ENERGY' },
          }) || await this.prismaService.tag.create({
            data: { name: 'danceability', category: 'ENERGY' },
          });

          await this.prismaService.songTag.create({
            data: {
              songId: song.id,
              tagId: danceTag.id,
              value: audioFeatures.danceability,
            },
          });
        }
      } catch (error) {
        // Continue even if audio features fail
        console.error('Failed to fetch audio features', error);
      }
    }

    // Fetch lyrics would go here in a real implementation
    // This would integrate with a lyrics API

    return song;
  }
} 