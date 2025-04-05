import { Test, TestingModule } from '@nestjs/testing';
import { SpotifyService } from '../spotify.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { NotFoundException } from '@nestjs/common';

// Mocks
const mockHttpService = {
  get: jest.fn(),
  post: jest.fn(() => of({
    data: {
      access_token: 'mock-access-token',
      expires_in: 3600
    },
    status: 200
  }))
};

const mockPrismaService = {
  song: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn()
  },
  artist: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn()
  },
  tag: {
    findFirst: jest.fn(),
    create: jest.fn()
  },
  songTag: {
    create: jest.fn()
  }
};

const mockConfigService = {
  get: jest.fn((key) => {
    if (key === 'SPOTIFY_CLIENT_ID') return 'mock-client-id';
    if (key === 'SPOTIFY_CLIENT_SECRET') return 'mock-client-secret';
    return null;
  })
};

// Test data
const mockSpotifyTrack = {
  id: '4cOdK2wGLETKBW3PvgPWqT',
  name: 'Love Story',
  artists: [
    {
      id: '06HL4z0CvFAxyc27GXpf02',
      name: 'Taylor Swift'
    }
  ],
  album: {
    name: 'Fearless (Taylor\'s Version)',
    images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273a5a7eb5bfbaf20973e023f0e' }]
  },
  duration_ms: 235733,
  preview_url: 'https://p.scdn.co/mp3-preview/f83df3f6ab8ee277d6acb28ac4822562c7aa6e2e'
};

const mockSpotifyAudioFeatures = {
  id: '4cOdK2wGLETKBW3PvgPWqT',
  danceability: 0.67,
  energy: 0.8,
  key: 7,
  loudness: -5.34,
  mode: 1,
  speechiness: 0.03,
  acousticness: 0.17,
  instrumentalness: 0,
  liveness: 0.13,
  valence: 0.73,
  tempo: 119.05
};

describe('SpotifyService', () => {
  let service: SpotifyService;
  let prismaService: PrismaService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpotifyService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: HttpService, useValue: mockHttpService }
      ],
    }).compile();

    service = module.get<SpotifyService>(SpotifyService);
    prismaService = module.get<PrismaService>(PrismaService);
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTrackDetails', () => {
    it('should return track details when track exists', async () => {
      // Arrange
      mockHttpService.get.mockReturnValueOnce(of({ 
        data: mockSpotifyTrack,
        status: 200 
      }));

      // Act
      const result = await service.getTrackDetails('4cOdK2wGLETKBW3PvgPWqT');

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe('4cOdK2wGLETKBW3PvgPWqT');
      expect(result.name).toBe('Love Story');
      expect(result.artists[0].name).toBe('Taylor Swift');
      expect(httpService.get).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when track does not exist', async () => {
      // Arrange
      mockHttpService.get.mockReturnValueOnce(of({ 
        data: { error: { status: 404, message: 'Track not found' } },
        status: 404 
      }));

      // Act & Assert
      await expect(service.getTrackDetails('invalid-id')).rejects.toThrow(NotFoundException);
      expect(httpService.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAudioFeatures', () => {
    it('should return audio features when track exists', async () => {
      // Arrange
      mockHttpService.get.mockReturnValueOnce(of({ 
        data: mockSpotifyAudioFeatures,
        status: 200 
      }));

      // Act
      const result = await service.getAudioFeatures('4cOdK2wGLETKBW3PvgPWqT');

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe('4cOdK2wGLETKBW3PvgPWqT');
      expect(result.danceability).toBe(0.67);
      expect(result.energy).toBe(0.8);
      expect(httpService.get).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when audio features do not exist', async () => {
      // Arrange
      mockHttpService.get.mockReturnValueOnce(of({ 
        data: { error: { status: 404, message: 'Audio features not found' } },
        status: 404 
      }));

      // Act & Assert
      await expect(service.getAudioFeatures('invalid-id')).rejects.toThrow(NotFoundException);
      expect(httpService.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('importTrack', () => {
    it('should import a track and create song with artist', async () => {
      // Arrange
      const userId = 'user123';
      const importDto = {
        trackId: '4cOdK2wGLETKBW3PvgPWqT',
        fetchAudioFeatures: true,
        fetchLyrics: true
      };

      // Mock getting track details
      mockHttpService.get.mockReturnValueOnce(of({ 
        data: mockSpotifyTrack,
        status: 200 
      }));

      // Mock getting audio features
      mockHttpService.get.mockReturnValueOnce(of({ 
        data: mockSpotifyAudioFeatures,
        status: 200 
      }));

      // Mock artist find and create
      mockPrismaService.artist.findFirst.mockResolvedValueOnce(null);
      mockPrismaService.artist.create.mockResolvedValueOnce({ 
        id: 'artist123', 
        name: 'Taylor Swift',
        bio: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Mock song creation
      mockPrismaService.song.create.mockResolvedValueOnce({ 
        id: 'song123', 
        title: 'Love Story',
        artistId: 'artist123',
        duration: 235,
        audioUrl: 'https://p.scdn.co/mp3-preview/f83df3f6ab8ee277d6acb28ac4822562c7aa6e2e',
        spotifyId: '4cOdK2wGLETKBW3PvgPWqT',
        lyricsId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Act
      const result = await service.importTrack(importDto, userId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe('song123');
      expect(result.title).toBe('Love Story');
      expect(result.artistId).toBe('artist123');
      expect(result.spotifyId).toBe('4cOdK2wGLETKBW3PvgPWqT');
      expect(httpService.get).toHaveBeenCalledTimes(2); // Track details + audio features
      expect(prismaService.artist.findFirst).toHaveBeenCalledTimes(1);
      expect(prismaService.artist.create).toHaveBeenCalledTimes(1);
      expect(prismaService.song.create).toHaveBeenCalledTimes(1);
    });

    it('should use existing artist if available', async () => {
      // Arrange
      const userId = 'user123';
      const importDto = {
        trackId: '4cOdK2wGLETKBW3PvgPWqT',
        artistId: 'existing-artist-id', // Provide existing artistId
        fetchAudioFeatures: false,
        fetchLyrics: false
      };

      // Mock getting track details
      mockHttpService.get.mockReturnValueOnce(of({ 
        data: mockSpotifyTrack,
        status: 200 
      }));

      // Mock artist find (should not be called since artistId is provided)
      mockPrismaService.artist.findUnique.mockResolvedValueOnce({ 
        id: 'existing-artist-id', 
        name: 'Taylor Swift (Existing)',
        bio: 'Existing artist',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Mock song creation
      mockPrismaService.song.create.mockResolvedValueOnce({ 
        id: 'song123', 
        title: 'Love Story',
        artistId: 'existing-artist-id',
        duration: 235,
        audioUrl: 'https://p.scdn.co/mp3-preview/f83df3f6ab8ee277d6acb28ac4822562c7aa6e2e',
        spotifyId: '4cOdK2wGLETKBW3PvgPWqT',
        lyricsId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Act
      const result = await service.importTrack(importDto, userId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe('song123');
      expect(result.artistId).toBe('existing-artist-id');
      expect(httpService.get).toHaveBeenCalledTimes(1); // Only track details
      expect(prismaService.artist.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaService.artist.create).not.toHaveBeenCalled();
      expect(prismaService.song.create).toHaveBeenCalledTimes(1);
    });

    it('should throw error if track does not exist on Spotify', async () => {
      // Arrange
      const userId = 'user123';
      const importDto = {
        trackId: 'invalid-id',
        fetchAudioFeatures: true,
        fetchLyrics: true
      };

      // Mock getting track details (error)
      mockHttpService.get.mockReturnValueOnce(of({ 
        data: { error: { status: 404, message: 'Track not found' } },
        status: 404 
      }));

      // Act & Assert
      await expect(service.importTrack(importDto, userId)).rejects.toThrow(NotFoundException);
      expect(httpService.get).toHaveBeenCalledTimes(1);
      expect(prismaService.artist.findFirst).not.toHaveBeenCalled();
      expect(prismaService.song.create).not.toHaveBeenCalled();
    });
  });
}); 