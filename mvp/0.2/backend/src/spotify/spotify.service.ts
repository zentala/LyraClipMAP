import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { SpotifyTrackDto } from './dto/spotify-track.dto';
import { ImportSpotifyTrackDto } from './dto/import-spotify-track.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

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
          images: artist.images,
        })),
        album: {
          name: track.album?.name,
          images: track.album?.images,
          release_date: track.album?.release_date,
        },
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
        album: {
          name: track.album?.name,
          images: track.album?.images,
          release_date: track.album?.release_date,
        },
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
          images: artist.images,
        })),
        album: {
          name: track.album?.name,
          images: track.album?.images,
          release_date: track.album?.release_date,
        },
        durationMs: track.duration_ms,
        previewUrl: track.preview_url,
        explicit: track.explicit,
        popularity: track.popularity,
      }));
    } catch (error) {
      throw new BadRequestException('Failed to get Spotify recommendations');
    }
  }

  /**
   * Import a track from Spotify and create it in our database
   */
  async importTrack(importDto: ImportSpotifyTrackDto, userId: number): Promise<any> {
    const trackDetails = await this.getTrackDetails(importDto.trackId);
    
    // Find or create artist
    let artistId: number;
    if (importDto.artistId) {
      const artist = await this.findArtist(importDto.artistId);
      artistId = artist.id;
    } else {
      // Use the first artist from Spotify track
      const spotifyArtist = trackDetails.artists[0];
      const artist = await this.prismaService.artist.create({
        data: {
          name: spotifyArtist.name,
          imageUrl: spotifyArtist.images?.[0]?.url || null,
        },
      });
      artistId = artist.id;
    }

    // Create song
    const song = await this.createSongFromSpotify(trackDetails, artistId);

    // Fetch and create audio features if requested
    if (importDto.fetchAudioFeatures) {
      const audioFeatures = await this.getAudioFeatures(importDto.trackId);
      await this.createSongTags(song.id, audioFeatures);
    }

    return song;
  }

  /**
   * Create a song in our database from Spotify track details
   */
  private async createSongFromSpotify(trackDetails: SpotifyTrackDto, artistId: number): Promise<any> {
    const songData: Prisma.SongCreateInput = {
      title: trackDetails.name,
      duration: Math.round(trackDetails.durationMs / 1000), // Convert ms to seconds
      audioUrl: trackDetails.previewUrl || '',
      genre: 'unknown', // We could potentially get this from Spotify's audio features
      releaseYear: new Date(trackDetails.album.release_date).getFullYear(),
      artist: {
        connect: { id: artistId }
      }
    };

    return this.prismaService.song.create({
      data: songData,
      include: {
        artist: true,
        lyrics: true
      }
    });
  }

  private async findArtist(artistId: string) {
    const artistIdNumber = parseInt(artistId, 10);
    if (isNaN(artistIdNumber)) {
      throw new BadRequestException('Invalid artist ID format');
    }

    const artist = await this.prismaService.artist.findUnique({
      where: { id: artistIdNumber },
    });

    if (!artist) {
      throw new NotFoundException(`Artist with ID "${artistId}" not found`);
    }

    return artist;
  }

  private async createSongTags(songId: number, audioFeatures: any) {
    // Create tags based on audio features
    const tags = [];

    if (audioFeatures.energy > 0.7) {
      tags.push({ name: 'energetic' });
    }
    if (audioFeatures.danceability > 0.7) {
      tags.push({ name: 'danceable' });
    }
    if (audioFeatures.valence > 0.7) {
      tags.push({ name: 'positive' });
    }
    if (audioFeatures.tempo > 120) {
      tags.push({ name: 'fast' });
    }

    // Create tags in database
    for (const tag of tags) {
      await this.prismaService.tag.create({
        data: {
          name: tag.name,
          songs: {
            create: {
              songId: songId,
            },
          },
        },
      });
    }
  }
} 