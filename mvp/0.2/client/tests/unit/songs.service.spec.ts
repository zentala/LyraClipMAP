import { Test } from '@nestjs/testing';
import { SongsService } from '../../../server/src/songs/songs.service';
import { PrismaService } from '../../../server/src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

// Mock PrismaService for unit tests
class MockPrismaService {
  song = {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };
  
  songLike = {
    create: jest.fn(),
    delete: jest.fn(),
    findUnique: jest.fn(),
  };
  
  textContent = {
    findMany: jest.fn(),
  };
  
  audioSource = {
    findMany: jest.fn(),
  };
}

describe('SongsService', () => {
  let service: SongsService;
  let prismaService: MockPrismaService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SongsService,
        { provide: PrismaService, useClass: MockPrismaService },
      ],
    }).compile();

    service = moduleRef.get<SongsService>(SongsService);
    prismaService = moduleRef.get(PrismaService);
  });

  describe('findAll', () => {
    it('should return paginated list of songs', async () => {
      const mockSongs = [
        { id: '1', title: 'Test Song 1', artistId: '1' },
        { id: '2', title: 'Test Song 2', artistId: '2' },
      ];
      
      prismaService.song.findMany.mockResolvedValue(mockSongs);
      prismaService.song.count.mockResolvedValue(2);

      const params = { page: 1, limit: 10 };
      const result = await service.findAll(params);

      expect(result.data).toEqual(mockSongs);
      expect(result.meta).toEqual({
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });
      expect(prismaService.song.findMany).toHaveBeenCalledWith(expect.objectContaining({
        skip: 0,
        take: 10,
      }));
    });

    it('should apply search filter when provided', async () => {
      prismaService.song.findMany.mockResolvedValue([]);
      prismaService.song.count.mockResolvedValue(0);

      const params = { page: 1, limit: 10, search: 'test' };
      await service.findAll(params);

      expect(prismaService.song.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { title: { contains: 'test', mode: 'insensitive' } },
            ]),
          }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return a song by ID', async () => {
      const mockSong = { 
        id: '1', 
        title: 'Test Song', 
        artistId: '1',
        artist: { id: '1', name: 'Test Artist' }
      };
      
      prismaService.song.findUnique.mockResolvedValue(mockSong);
      prismaService.textContent.findMany.mockResolvedValue([]);
      prismaService.audioSource.findMany.mockResolvedValue([]);

      const result = await service.findById('1');

      expect(result).toEqual(expect.objectContaining({
        id: '1',
        title: 'Test Song',
      }));
      expect(prismaService.song.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: expect.any(Object),
      });
    });

    it('should return null if song not found', async () => {
      prismaService.song.findUnique.mockResolvedValue(null);

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new song', async () => {
      const createSongDto = {
        title: 'New Song',
        artistId: '1',
        description: 'Test description',
        audioSources: [
          { url: 'https://youtube.com/watch?v=123456', sourceType: 'YOUTUBE', isMain: true }
        ]
      };
      
      const mockCreatedSong = {
        id: 'new-id',
        title: 'New Song',
        artistId: '1',
        description: 'Test description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      prismaService.song.create.mockResolvedValue(mockCreatedSong);

      const result = await service.create(createSongDto, 'user-id');

      expect(result).toEqual(mockCreatedSong);
      expect(prismaService.song.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'New Song',
          artistId: '1',
          description: 'Test description',
          createdById: 'user-id',
          audioSources: expect.any(Object),
        }),
      });
    });
  });

  describe('update', () => {
    it('should update an existing song', async () => {
      const updateSongDto = {
        title: 'Updated Song Title',
      };
      
      const mockUpdatedSong = {
        id: '1',
        title: 'Updated Song Title',
        artistId: '1',
        updatedAt: new Date(),
      };
      
      prismaService.song.update.mockResolvedValue(mockUpdatedSong);

      const result = await service.update('1', updateSongDto);

      expect(result).toEqual(mockUpdatedSong);
      expect(prismaService.song.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: expect.objectContaining({
          title: 'Updated Song Title',
        }),
      });
    });
  });

  describe('remove', () => {
    it('should delete a song', async () => {
      prismaService.song.delete.mockResolvedValue({ id: '1' });

      await service.remove('1');

      expect(prismaService.song.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('likeSong', () => {
    it('should like a song', async () => {
      prismaService.songLike.findUnique.mockResolvedValue(null);
      prismaService.songLike.create.mockResolvedValue({
        songId: '1',
        userId: 'user-id',
        createdAt: new Date(),
      });

      await service.likeSong('1', 'user-id');

      expect(prismaService.songLike.create).toHaveBeenCalledWith({
        data: {
          songId: '1',
          userId: 'user-id',
        },
      });
    });

    it('should throw error if song already liked', async () => {
      prismaService.songLike.findUnique.mockResolvedValue({
        songId: '1',
        userId: 'user-id',
      });

      await expect(service.likeSong('1', 'user-id')).rejects.toThrow();
    });
  });

  describe('unlikeSong', () => {
    it('should unlike a song', async () => {
      prismaService.songLike.findUnique.mockResolvedValue({
        songId: '1',
        userId: 'user-id',
      });
      
      prismaService.songLike.delete.mockResolvedValue({
        songId: '1',
        userId: 'user-id',
      });

      await service.unlikeSong('1', 'user-id');

      expect(prismaService.songLike.delete).toHaveBeenCalledWith({
        where: {
          songId_userId: {
            songId: '1',
            userId: 'user-id',
          },
        },
      });
    });

    it('should throw error if song not liked', async () => {
      prismaService.songLike.findUnique.mockResolvedValue(null);

      await expect(service.unlikeSong('1', 'user-id')).rejects.toThrow(NotFoundException);
    });
  });
});