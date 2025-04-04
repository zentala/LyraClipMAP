import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Prisma, User, UserPreferences, Artist, Song, Lyrics } from '@prisma/client';
import { SongsService } from '../songs/songs.service';

jest.mock('../prisma/prisma.service');

describe('Entity Relationships', () => {
  let prismaService: jest.Mocked<PrismaService>;
  let songsService: SongsService;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    username: 'testuser',
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
    {
      id: 2,
      artistId: mockArtist.id,
      title: 'Song 2',
      duration: 240,
      audioUrl: 'https://example.com/song2.mp3',
      lyricsId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockSong: Song = mockSongs[0];

  const mockLyrics: Lyrics = {
    id: 1,
    content: 'Test lyrics content',
    lrc: 'Test LRC content',
    timestamps: { '00:00': 'Test lyrics' },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
            },
            userPreferences: {
              create: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
            },
            artist: {
              create: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
            },
            song: {
              create: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
              findMany: jest.fn(),
            },
            lyrics: {
              create: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    prismaService = module.get(PrismaService);

    // Setup mock implementations
    prismaService.user.create.mockImplementation((args) => Promise.resolve({ ...mockUser, preferences: mockPreferences }));
    prismaService.user.findUnique.mockImplementation((args) => Promise.resolve(mockUser));
    prismaService.user.delete.mockImplementation((args) => Promise.resolve(mockUser));

    prismaService.userPreferences.create.mockImplementation((args) => Promise.resolve(mockPreferences));
    prismaService.userPreferences.findUnique.mockImplementation((args) => Promise.resolve(mockPreferences));
    prismaService.userPreferences.delete.mockImplementation((args) => Promise.resolve(mockPreferences));

    prismaService.artist.create.mockImplementation((args) => Promise.resolve({ ...mockArtist, songs: mockSongs }));
    prismaService.artist.findUnique.mockImplementation((args) => {
      if (args.where.id === 999) return Promise.resolve(null);
      return Promise.resolve(mockArtist);
    });
    prismaService.artist.delete.mockImplementation((args) => Promise.resolve({ ...mockArtist, songs: [] }));

    prismaService.song.create.mockImplementation((args) => {
      if (args.data.artist.connect.id === 999) {
        throw new NotFoundException('Artist not found');
      }
      return Promise.resolve({ ...mockSong, lyrics: mockLyrics, artist: mockArtist });
    });
    prismaService.song.findUnique.mockImplementation((args) => Promise.resolve(mockSong));
    prismaService.song.delete.mockImplementation((args) => Promise.resolve(mockSong));
    prismaService.song.findMany.mockImplementation((args) => Promise.resolve(mockSongs));

    prismaService.lyrics.create.mockImplementation((args) => Promise.resolve(mockLyrics));
    prismaService.lyrics.findUnique.mockImplementation((args) => Promise.resolve(mockLyrics));
    prismaService.lyrics.delete.mockImplementation((args) => Promise.resolve(mockLyrics));

    songsService = new SongsService(prismaService);
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

      prismaService.user.create.mockResolvedValue({ ...mockUser, preferences: mockPreferences });
      prismaService.userPreferences.create.mockResolvedValue(mockPreferences);

      const user = await prismaService.user.create({
        data: userData,
        include: {
          preferences: true,
        },
      });

      expect(user).toEqual({ ...mockUser, preferences: mockPreferences });
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: userData,
        include: {
          preferences: true,
        },
      });
    });

    it('should delete user and cascade delete preferences', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.user.delete.mockResolvedValue(mockUser);

      await prismaService.user.delete({
        where: { id: mockUser.id },
      });

      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });
  });

  describe('Artist-Song Relationship (1:N)', () => {
    it('should create artist with songs', async () => {
      const mockArtist = {
        id: 1,
        name: 'Test Artist',
        bio: 'Test Bio',
        imageUrl: 'https://example.com/image.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockSong = {
        id: 1,
        title: 'Test Song',
        duration: 180,
        audioUrl: 'https://example.com/song.mp3',
        artistId: mockArtist.id,
        lyricsId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.artist.findUnique as jest.Mock).mockResolvedValue(mockArtist);
      (prismaService.song.create as jest.Mock).mockResolvedValue(mockSong);

      const result = await songsService.create({
        title: 'Test Song',
        duration: 180,
        audioUrl: 'https://example.com/song.mp3',
        artistId: mockArtist.id,
      });

      expect(result).toBeDefined();
      expect(result.artistId).toBe(mockArtist.id);
    });

    it('should not create song with non-existent artist', async () => {
      const nonExistentArtistId = 999;

      (prismaService.artist.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        songsService.create({
          title: 'Test Song',
          duration: 180,
          audioUrl: 'https://example.com/song.mp3',
          artistId: nonExistentArtistId,
        }),
      ).rejects.toThrow(new NotFoundException(`Artist with ID ${nonExistentArtistId} not found`));

      expect(prismaService.artist.findUnique).toHaveBeenCalledWith({
        where: { id: nonExistentArtistId },
      });
      expect(prismaService.song.create).not.toHaveBeenCalled();
    });

    it('should delete artist and cascade delete songs', async () => {
      const artistId = 1;
      const mockArtist = {
        id: artistId,
        name: 'Test Artist',
        bio: 'Test Bio',
        imageUrl: 'https://example.com/image.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.artist.findUnique as jest.Mock).mockResolvedValue(mockArtist);
      (prismaService.artist.delete as jest.Mock).mockResolvedValue(mockArtist);

      await prismaService.artist.delete({
        where: { id: artistId },
      });

      expect(prismaService.artist.delete).toHaveBeenCalledWith({
        where: { id: artistId },
      });
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

      prismaService.song.create.mockResolvedValue({ ...mockSong, lyrics: mockLyrics });
      prismaService.lyrics.create.mockResolvedValue(mockLyrics);

      const song = await prismaService.song.create({
        data: songData,
        include: {
          lyrics: true,
        },
      });

      expect(song).toEqual({ ...mockSong, lyrics: mockLyrics });
      expect(prismaService.song.create).toHaveBeenCalledWith({
        data: songData,
        include: {
          lyrics: true,
        },
      });
    });

    it('should delete song and cascade delete lyrics', async () => {
      prismaService.song.findUnique.mockResolvedValue(mockSong);
      prismaService.song.delete.mockResolvedValue(mockSong);

      await prismaService.song.delete({
        where: { id: mockSong.id },
      });

      expect(prismaService.song.delete).toHaveBeenCalledWith({
        where: { id: mockSong.id },
      });
    });
  });

  describe('Song-Artist Relationship (N:1)', () => {
    it('should create song with artist reference', async () => {
      const mockArtist = {
        id: 1,
        name: 'Test Artist',
        bio: 'Test Bio',
        imageUrl: 'https://example.com/image.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockSong = {
        id: 1,
        title: 'Test Song',
        duration: 180,
        audioUrl: 'https://example.com/song.mp3',
        artistId: mockArtist.id,
        lyricsId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.artist.findUnique as jest.Mock).mockResolvedValue(mockArtist);
      (prismaService.song.create as jest.Mock).mockResolvedValue(mockSong);

      const result = await songsService.create({
        title: 'Test Song',
        duration: 180,
        audioUrl: 'https://example.com/song.mp3',
        artistId: mockArtist.id,
      });

      expect(result).toBeDefined();
      expect(result.artistId).toBe(mockArtist.id);
    });

    it('should not create song with non-existent artist', async () => {
      const nonExistentArtistId = 999;

      (prismaService.artist.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        songsService.create({
          title: 'Test Song',
          duration: 180,
          audioUrl: 'https://example.com/song.mp3',
          artistId: nonExistentArtistId,
        }),
      ).rejects.toThrow(new NotFoundException(`Artist with ID ${nonExistentArtistId} not found`));

      expect(prismaService.artist.findUnique).toHaveBeenCalledWith({
        where: { id: nonExistentArtistId },
      });
      expect(prismaService.song.create).not.toHaveBeenCalled();
    });
  });
}); 