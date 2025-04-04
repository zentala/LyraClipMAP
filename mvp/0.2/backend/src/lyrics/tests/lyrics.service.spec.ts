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
        { id: 1, content: 'test lyrics', createdAt: new Date(), updatedAt: new Date() },
      ];
      mockPrismaService.lyrics.findMany.mockResolvedValue(expectedResult);

      const result = await service.searchLyrics(query);
      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.lyrics.findMany).toHaveBeenCalledWith({
        where: {
          content: {
            contains: query,
          },
        },
      });
    });
  });

  describe('generateLRC', () => {
    it('should create lyrics with LRC content', async () => {
      const lyrics = 'test lyrics\nsecond line';
      const timestamps = [1000, 2000];
      const expectedResult = {
        id: 1,
        content: lyrics,
        lrc: '[00:01.00]test lyrics\n[00:02.00]second line',
        timestamps,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.lyrics.create.mockResolvedValue(expectedResult);

      const result = await service.generateLRC(lyrics, timestamps);
      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.lyrics.create).toHaveBeenCalledWith({
        data: {
          content: lyrics,
          lrc: '[00:01.00]test lyrics\n[00:02.00]second line',
          timestamps,
        },
      });
    });

    it('should handle empty lyrics', async () => {
      const lyrics = '';
      const timestamps = [];
      const expectedResult = {
        id: 1,
        content: lyrics,
        lrc: '',
        timestamps,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.lyrics.create.mockResolvedValue(expectedResult);

      const result = await service.generateLRC(lyrics, timestamps);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('mapWordTimestamps', () => {
    it('should create lyrics with mapped timestamps', async () => {
      const lyrics = 'test lyrics';
      const timestamps = [1000, 2000];
      const expectedResult = {
        id: 1,
        content: lyrics,
        timestamps: [
          { word: 'test', timestamp: 1000 },
          { word: 'lyrics', timestamp: 2000 },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.lyrics.create.mockResolvedValue(expectedResult);

      const result = await service.mapWordTimestamps(lyrics, timestamps);
      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.lyrics.create).toHaveBeenCalledWith({
        data: {
          content: lyrics,
          timestamps: [
            { word: 'test', timestamp: 1000 },
            { word: 'lyrics', timestamp: 2000 },
          ],
        },
      });
    });

    it('should handle empty lyrics', async () => {
      const lyrics = '';
      const timestamps = [];
      const expectedResult = {
        id: 1,
        content: lyrics,
        timestamps: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.lyrics.create.mockResolvedValue(expectedResult);

      const result = await service.mapWordTimestamps(lyrics, timestamps);
      expect(result).toEqual(expectedResult);
    });
  });
}); 