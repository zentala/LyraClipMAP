import { Test, TestingModule } from '@nestjs/testing';
import { LyricsService } from '../lyrics.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('LyricsService', () => {
  let service: LyricsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    lyrics: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LyricsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<LyricsService>(LyricsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchLyrics', () => {
    it('should return lyrics matching the query', async () => {
      const query = 'test query';
      const expectedResult = [
        { id: 1, text: 'test lyrics', language: 'en', sourceUrl: 'https://example.com/lyrics', timestamps: {}, createdAt: new Date(), updatedAt: new Date() },
      ];
      mockPrismaService.lyrics.findMany.mockResolvedValue(expectedResult);

      const result = await service.searchLyrics(query);
      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.lyrics.findMany).toHaveBeenCalledWith({
        where: {
          text: {
            contains: query,
          },
        },
      });
    });
  });

  describe('createLyricsFromLrc', () => {
    it('should create lyrics with LRC content', async () => {
      const lyrics = 'test lyrics\nsecond line';
      const lrcContent = '[00:01.00]test lyrics\n[00:02.00]second line';
      const expectedResult = {
        id: 1,
        text: lyrics,
        timestamps: [
          { word: 'test lyrics', timestamp: 1000 },
          { word: 'second line', timestamp: 2000 }
        ],
        language: 'en',
        sourceUrl: 'https://example.com/lyrics',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.lyrics.create.mockResolvedValue(expectedResult);

      const result = await service.createLyricsFromLrc(lyrics, lrcContent);
      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.lyrics.create).toHaveBeenCalledWith({
        data: {
          text: lyrics,
          timestamps: [
            { word: 'test lyrics', timestamp: 1000 },
            { word: 'second line', timestamp: 2000 }
          ],
          language: 'en',
          sourceUrl: 'https://example.com/lyrics',
        },
      });
    });

    it('should handle empty lyrics', async () => {
      const lyrics = '';
      const lrcContent = '';
      const expectedResult = {
        id: 1,
        text: lyrics,
        timestamps: [],
        language: 'en',
        sourceUrl: 'https://example.com/lyrics',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.lyrics.create.mockResolvedValue(expectedResult);

      const result = await service.createLyricsFromLrc(lyrics, lrcContent);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('createLyricsWithTimestamps', () => {
    it('should create lyrics with mapped timestamps', async () => {
      const lyrics = 'test lyrics';
      const timestamps = [
        { word: 'test', timestamp: 1000 },
        { word: 'lyrics', timestamp: 2000 }
      ];
      const expectedResult = {
        id: 1,
        text: lyrics,
        timestamps,
        language: 'en',
        sourceUrl: 'https://example.com/lyrics',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.lyrics.create.mockResolvedValue(expectedResult);

      const result = await service.createLyricsWithTimestamps(lyrics, timestamps);
      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.lyrics.create).toHaveBeenCalledWith({
        data: {
          text: lyrics,
          timestamps,
          language: 'en',
          sourceUrl: 'https://example.com/lyrics',
        },
      });
    });

    it('should handle empty lyrics', async () => {
      const lyrics = '';
      const timestamps = [];
      const expectedResult = {
        id: 1,
        text: lyrics,
        timestamps: [],
        language: 'en',
        sourceUrl: 'https://example.com/lyrics',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.lyrics.create.mockResolvedValue(expectedResult);

      const result = await service.createLyricsWithTimestamps(lyrics, timestamps);
      expect(result).toEqual(expectedResult);
    });
  });
}); 