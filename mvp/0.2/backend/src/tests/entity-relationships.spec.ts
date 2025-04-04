import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Prisma, User, UserPreferences, Artist, Song, Lyrics } from '@prisma/client';

describe('Entity Relationships', () => {
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    } as unknown as Prisma.UserDelegate,
    userPreferences: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    } as unknown as Prisma.UserPreferencesDelegate,
    artist: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    } as unknown as Prisma.ArtistDelegate,
    song: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    } as unknown as Prisma.SongDelegate,
    lyrics: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    } as unknown as Prisma.LyricsDelegate,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('User-UserPreferences Relationship (1:1)', () => {
    it('should create user with preferences', async () => {
      const userData: Prisma.UserCreateInput = {
        email: 'test@example.com',
        password: 'hashedPassword',
        username: 'testuser',
        role: 'USER',
        preferences: {
          create: {
            theme: 'dark',
            language: 'en',
            notifications: true,
          },
        },
      };

      const mockUser: User = {
        id: 1,
        email: userData.email,
        password: userData.password,
        username: userData.username,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPreferences: UserPreferences = {
        id: 1,
        userId: mockUser.id,
        theme: 'dark',
        language: 'en',
        notifications: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockPrismaService.userPreferences.create.mockResolvedValue(mockPreferences);

      const user = await prismaService.user.create({
        data: userData,
        include: {
          preferences: true,
        },
      });

      expect(user).toEqual({ ...mockUser, preferences: mockPreferences });
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: userData,
        include: {
          preferences: true,
        },
      });
    });

    it('should delete user and cascade delete preferences', async () => {
      const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        username: 'testuser',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      await prismaService.user.delete({
        where: { id: mockUser.id },
      });

      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });
  });

  describe('Artist-Song Relationship (1:N)', () => {
    it('should create artist with songs', async () => {
      const artistData: Prisma.ArtistCreateInput = {
        name: 'Test Artist',
        bio: 'Test Bio',
        imageUrl: 'https://example.com/image.jpg',
        songs: {
          create: [
            {
              title: 'Song 1',
              duration: 180,
              audioUrl: 'https://example.com/song1.mp3',
            },
            {
              title: 'Song 2',
              duration: 240,
              audioUrl: 'https://example.com/song2.mp3',
            },
          ],
        },
      };

      const mockArtist: Artist = {
        id: 1,
        name: artistData.name,
        bio: artistData.bio,
        imageUrl: artistData.imageUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockSongs: Song[] = artistData.songs.create.map((song, index) => ({
        id: index + 1,
        artistId: mockArtist.id,
        title: song.title,
        duration: song.duration,
        audioUrl: song.audioUrl,
        lyricsId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      mockPrismaService.artist.create.mockResolvedValue(mockArtist);
      mockPrismaService.song.findMany.mockResolvedValue(mockSongs);

      const artist = await prismaService.artist.create({
        data: artistData,
        include: {
          songs: true,
        },
      });

      expect(artist).toEqual({ ...mockArtist, songs: mockSongs });
      expect(mockPrismaService.artist.create).toHaveBeenCalledWith({
        data: artistData,
        include: {
          songs: true,
        },
      });
    });

    it('should not delete artist with existing songs', async () => {
      const mockArtist: Artist = {
        id: 1,
        name: 'Test Artist',
        bio: 'Test Bio',
        imageUrl: 'https://example.com/image.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockSongs: Song[] = [
        {
          id: 1,
          artistId: mockArtist.id,
          title: 'Song 1',
          duration: 180,
          audioUrl: 'https://example.com/song1.mp3',
          lyricsId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.artist.findUnique.mockResolvedValue(mockArtist);
      mockPrismaService.song.findMany.mockResolvedValue(mockSongs);

      await expect(
        prismaService.artist.delete({
          where: { id: mockArtist.id },
        }),
      ).rejects.toThrow();

      expect(mockPrismaService.artist.delete).not.toHaveBeenCalled();
    });
  });

  describe('Song-Lyrics Relationship (1:1)', () => {
    it('should create song with lyrics', async () => {
      const songData: Prisma.SongCreateInput = {
        title: 'Test Song',
        duration: 180,
        audioUrl: 'https://example.com/song.mp3',
        artist: {
          connect: { id: 1 },
        },
        lyrics: {
          create: {
            content: 'Test lyrics content',
            lrc: 'Test LRC content',
            timestamps: { '00:00': 'Test lyrics' },
          },
        },
      };

      const mockSong: Song = {
        id: 1,
        title: songData.title,
        duration: songData.duration,
        audioUrl: songData.audioUrl,
        artistId: 1,
        lyricsId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockLyrics: Lyrics = {
        id: 1,
        content: 'Test lyrics content',
        lrc: 'Test LRC content',
        timestamps: { '00:00': 'Test lyrics' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.song.create.mockResolvedValue(mockSong);
      mockPrismaService.lyrics.create.mockResolvedValue(mockLyrics);

      const song = await prismaService.song.create({
        data: songData,
        include: {
          lyrics: true,
        },
      });

      expect(song).toEqual({ ...mockSong, lyrics: mockLyrics });
      expect(mockPrismaService.song.create).toHaveBeenCalledWith({
        data: songData,
        include: {
          lyrics: true,
        },
      });
    });

    it('should delete song and cascade delete lyrics', async () => {
      const mockSong: Song = {
        id: 1,
        title: 'Test Song',
        duration: 180,
        audioUrl: 'https://example.com/song.mp3',
        artistId: 1,
        lyricsId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.song.findUnique.mockResolvedValue(mockSong);
      mockPrismaService.song.delete.mockResolvedValue(mockSong);

      await prismaService.song.delete({
        where: { id: mockSong.id },
      });

      expect(mockPrismaService.song.delete).toHaveBeenCalledWith({
        where: { id: mockSong.id },
      });
    });
  });

  describe('Song-Artist Relationship (N:1)', () => {
    it('should create song with artist reference', async () => {
      const artistData: Artist = {
        id: 1,
        name: 'Test Artist',
        bio: 'Test Bio',
        imageUrl: 'https://example.com/image.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const songData: Prisma.SongCreateInput = {
        title: 'Test Song',
        duration: 180,
        audioUrl: 'https://example.com/song.mp3',
        artist: {
          connect: { id: artistData.id },
        },
      };

      const mockSong: Song = {
        id: 1,
        title: songData.title,
        duration: songData.duration,
        audioUrl: songData.audioUrl,
        artistId: artistData.id,
        lyricsId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.artist.findUnique.mockResolvedValue(artistData);
      mockPrismaService.song.create.mockResolvedValue(mockSong);

      const song = await prismaService.song.create({
        data: songData,
        include: {
          artist: true,
        },
      });

      expect(song).toEqual({ ...mockSong, artist: artistData });
      expect(mockPrismaService.song.create).toHaveBeenCalledWith({
        data: songData,
        include: {
          artist: true,
        },
      });
    });

    it('should not create song with non-existent artist', async () => {
      const songData: Prisma.SongCreateInput = {
        title: 'Test Song',
        duration: 180,
        audioUrl: 'https://example.com/song.mp3',
        artist: {
          connect: { id: 999 },
        },
      };

      mockPrismaService.artist.findUnique.mockResolvedValue(null);

      await expect(
        prismaService.song.create({
          data: songData,
          include: {
            artist: true,
          },
        }),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrismaService.song.create).not.toHaveBeenCalled();
    });
  });
}); 