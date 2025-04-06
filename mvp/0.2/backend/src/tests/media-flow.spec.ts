import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Prisma, Song, Lyrics, Artist } from '@prisma/client';
import { SongsService } from '../songs/songs.service';
import { INestApplication } from '@nestjs/common';

describe('Media Flow', () => {
  let prismaService: PrismaService;
  let app: INestApplication;
  let mockPrismaService: any;

  const baseMockLyrics: Lyrics = {
    id: 1,
    text: 'Test lyrics content',
    language: 'en',
    timestamps: { '00:00': 'Test lyrics' } as any,
    sourceUrl: 'https://example.com/lyrics.txt',
    createdAt: new Date(),
    updatedAt: new Date()
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

    mockPrismaService = {
      song: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      lyrics: {
        create: jest.fn().mockResolvedValue(baseMockLyrics),
        update: jest.fn().mockResolvedValue(baseMockLyrics),
        findUnique: jest.fn().mockResolvedValue(baseMockLyrics),
        delete: jest.fn().mockResolvedValue(baseMockLyrics),
        findMany: jest.fn().mockResolvedValue([baseMockLyrics])
      },
      artist: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Media Upload Flow', () => {
    it('should handle song upload with metadata', async () => {
      const songData: Prisma.SongCreateInput = {
        title: 'Test Song',
        duration: 180,
        audioUrl: 'https://example.com/song.mp3',
        genre: 'pop',
        releaseYear: 2024,
        artist: {
          connect: { id: 1 },
        },
        lyrics: {
          create: {
            text: 'Test lyrics content',
            language: 'en',
            sourceUrl: 'https://example.com/lyrics',
            timestamps: []
          }
        }
      };

      const mockSong: Song = {
        id: 1,
        title: songData.title,
        duration: songData.duration,
        audioUrl: songData.audioUrl,
        artistId: 1,
        lyricsId: 1,
        genre: songData.genre,
        releaseYear: songData.releaseYear,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrismaService.song.create as jest.Mock).mockResolvedValue(mockSong);

      const song = await prismaService.song.create({
        data: songData,
        include: {
          artist: true,
          lyrics: true,
        },
      });

      expect(song).toBeDefined();
      expect(song.audioUrl).toBe(songData.audioUrl);
      expect(mockPrismaService.song.create).toHaveBeenCalledWith({
        data: songData,
        include: {
          artist: true,
          lyrics: true,
        },
      });
    });

    it('should handle lyrics upload with timestamps', async () => {
      const lyricsCreateInput: Prisma.LyricsCreateInput = {
        text: 'Test lyrics content',
        language: 'en',
        timestamps: { '00:00': 'Test lyrics' },
        sourceUrl: 'https://example.com/lyrics.txt'
      };

      await expect(prismaService.lyrics.create({
        data: lyricsCreateInput
      })).resolves.toEqual(baseMockLyrics);

      expect(mockPrismaService.lyrics.create).toHaveBeenCalledWith({
        data: expect.objectContaining(lyricsCreateInput)
      });
    });
  });

  describe('Media Update Flow', () => {
    it('should update song metadata', async () => {
      const songId = 1;
      const updateData: Prisma.SongUpdateInput = {
        title: 'Updated Song Title',
        duration: 200,
      };

      const mockSong: Song = {
        id: songId,
        title: updateData.title as string,
        duration: updateData.duration as number,
        audioUrl: 'https://example.com/song.mp3',
        artistId: 1,
        lyricsId: null,
        genre: 'pop',
        releaseYear: 2024,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrismaService.song.findUnique as jest.Mock).mockResolvedValue(mockSong);
      (mockPrismaService.song.update as jest.Mock).mockResolvedValue(mockSong);

      const updatedSong = await prismaService.song.update({
        where: { id: songId },
        data: updateData,
      });

      expect(updatedSong.title).toBe(updateData.title);
      expect(updatedSong.duration).toBe(updateData.duration);
      expect(mockPrismaService.song.update).toHaveBeenCalledWith({
        where: { id: songId },
        data: updateData,
      });
    });

    it('should update lyrics content and timestamps', async () => {
      const lyricsId = 1;
      const lyricsUpdateInput: Prisma.LyricsUpdateInput = {
        text: 'Updated lyrics content',
        language: 'en',
        timestamps: { '00:00': 'Updated lyrics' },
        sourceUrl: 'https://example.com/lyrics-updated.txt'
      };

      const updatedMockLyrics: Lyrics = {
        ...baseMockLyrics,
        text: lyricsUpdateInput.text as string,
        language: lyricsUpdateInput.language as string,
        timestamps: lyricsUpdateInput.timestamps as any,
        sourceUrl: lyricsUpdateInput.sourceUrl as string
      };

      mockPrismaService.lyrics.findUnique.mockResolvedValue(updatedMockLyrics);
      mockPrismaService.lyrics.update.mockResolvedValue(updatedMockLyrics);

      const updatedLyrics = await prismaService.lyrics.update({
        where: { id: lyricsId },
        data: lyricsUpdateInput
      });

      expect(updatedLyrics.text).toBe(lyricsUpdateInput.text);
      expect(updatedLyrics.timestamps).toEqual(lyricsUpdateInput.timestamps);
      expect(mockPrismaService.lyrics.update).toHaveBeenCalledWith({
        where: { id: lyricsId },
        data: expect.objectContaining(lyricsUpdateInput)
      });
    });
  });

  describe('Media Delete Flow', () => {
    let songsService: SongsService;

    beforeEach(() => {
      songsService = new SongsService(prismaService);
    });

    it('should delete song and cascade delete lyrics', async () => {
      const songId = 1;
      const mockSong: Song = {
        id: songId,
        title: 'Test Song',
        duration: 180,
        audioUrl: 'https://example.com/song.mp3',
        artistId: 1,
        lyricsId: null,
        genre: 'pop',
        releaseYear: 2024,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrismaService.song.findUnique as jest.Mock).mockResolvedValue(mockSong);
      (mockPrismaService.song.delete as jest.Mock).mockResolvedValue(mockSong);

      await songsService.remove(songId);

      expect(mockPrismaService.song.delete).toHaveBeenCalledWith({
        where: { id: songId },
        include: {
          artist: true,
          lyrics: true,
        },
      });
    });

    it('should handle non-existent song deletion', async () => {
      const songId = 999;

      (mockPrismaService.song.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(songsService.remove(songId)).rejects.toThrow(
        new NotFoundException(`Song with ID ${songId} not found`)
      );

      expect(mockPrismaService.song.findUnique).toHaveBeenCalledWith({
        where: { id: songId },
        include: {
          artist: true,
          lyrics: true,
        },
      });
      expect(mockPrismaService.song.delete).not.toHaveBeenCalled();
    });
  });
}); 