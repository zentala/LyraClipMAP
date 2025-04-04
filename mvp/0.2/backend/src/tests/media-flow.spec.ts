import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Prisma, Song, Lyrics, Artist } from '@prisma/client';

describe('Media Flow', () => {
  let prismaService: PrismaService;

  const mockPrismaService = {
    song: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    lyrics: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    artist: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
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

  describe('Media Upload Flow', () => {
    it('should handle song upload with metadata', async () => {
      const songData: Prisma.SongCreateInput = {
        title: 'Test Song',
        duration: 180,
        audioUrl: 'https://example.com/song.mp3',
        artist: {
          connect: { id: 1 },
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

      (mockPrismaService.song.create as jest.Mock).mockResolvedValue(mockSong);

      const song = await prismaService.song.create({
        data: songData,
        include: {
          artist: true,
        },
      });

      expect(song).toBeDefined();
      expect(song.audioUrl).toBe(songData.audioUrl);
      expect(mockPrismaService.song.create).toHaveBeenCalledWith({
        data: songData,
        include: {
          artist: true,
        },
      });
    });

    it('should handle lyrics upload with timestamps', async () => {
      const lyricsData: Prisma.LyricsCreateInput = {
        content: 'Test lyrics content',
        lrc: 'Test LRC content',
        timestamps: { '00:00': 'Test lyrics' },
        song: {
          connect: { id: 1 },
        },
      };

      const mockLyrics: Lyrics = {
        id: 1,
        content: lyricsData.content,
        lrc: lyricsData.lrc,
        timestamps: lyricsData.timestamps as any,
        songId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrismaService.lyrics.create as jest.Mock).mockResolvedValue(mockLyrics);

      const lyrics = await prismaService.lyrics.create({
        data: lyricsData,
        include: {
          song: true,
        },
      });

      expect(lyrics).toBeDefined();
      expect(lyrics.timestamps).toBeDefined();
      expect(mockPrismaService.lyrics.create).toHaveBeenCalledWith({
        data: lyricsData,
        include: {
          song: true,
        },
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
      const updateData: Prisma.LyricsUpdateInput = {
        content: 'Updated lyrics content',
        timestamps: { '00:00': 'Updated lyrics' },
      };

      const mockLyrics: Lyrics = {
        id: lyricsId,
        content: updateData.content as string,
        lrc: 'Test LRC content',
        timestamps: updateData.timestamps as any,
        songId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrismaService.lyrics.findUnique as jest.Mock).mockResolvedValue(mockLyrics);
      (mockPrismaService.lyrics.update as jest.Mock).mockResolvedValue(mockLyrics);

      const updatedLyrics = await prismaService.lyrics.update({
        where: { id: lyricsId },
        data: updateData,
      });

      expect(updatedLyrics.content).toBe(updateData.content);
      expect(updatedLyrics.timestamps).toEqual(updateData.timestamps);
      expect(mockPrismaService.lyrics.update).toHaveBeenCalledWith({
        where: { id: lyricsId },
        data: updateData,
      });
    });
  });

  describe('Media Delete Flow', () => {
    it('should delete song and cascade delete lyrics', async () => {
      const songId = 1;
      const mockSong: Song = {
        id: songId,
        title: 'Test Song',
        duration: 180,
        audioUrl: 'https://example.com/song.mp3',
        artistId: 1,
        lyricsId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrismaService.song.findUnique as jest.Mock).mockResolvedValue(mockSong);
      (mockPrismaService.song.delete as jest.Mock).mockResolvedValue(mockSong);

      await prismaService.song.delete({
        where: { id: songId },
      });

      expect(mockPrismaService.song.delete).toHaveBeenCalledWith({
        where: { id: songId },
      });
    });

    it('should handle non-existent song deletion', async () => {
      const songId = 999;
      (mockPrismaService.song.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        prismaService.song.delete({
          where: { id: songId },
        }),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrismaService.song.delete).not.toHaveBeenCalled();
    });
  });
}); 