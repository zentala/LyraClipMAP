import { Test } from '@nestjs/testing';
import { SongsController } from '../../../server/src/songs/songs.controller';
import { SongsService } from '../../../server/src/songs/songs.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateSongDto } from '../../../server/src/songs/dto/create-song.dto';
import { UpdateSongDto } from '../../../server/src/songs/dto/update-song.dto';

// Mock SongsService
const mockSongsService = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  likeSong: jest.fn(),
  unlikeSong: jest.fn(),
};

describe('SongsController', () => {
  let controller: SongsController;
  let service: any;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [SongsController],
      providers: [
        { provide: SongsService, useValue: mockSongsService },
      ],
    }).compile();

    controller = moduleRef.get<SongsController>(SongsController);
    service = moduleRef.get<SongsService>(SongsService);
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('getSongs', () => {
    it('should return paginated songs', async () => {
      const expectedResult = {
        data: [{ id: '1', title: 'Test Song' }],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
      
      service.findAll.mockResolvedValue(expectedResult);

      const result = await controller.getSongs(1, 10);

      expect(result).toBe(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: undefined,
        sortBy: undefined,
        sortOrder: undefined,
        artistId: undefined,
        withLyrics: undefined,
      });
    });

    it('should apply all query parameters', async () => {
      service.findAll.mockResolvedValue({ data: [], meta: {} });

      await controller.getSongs(
        2, 20, 'test', 'title', 'asc', 'artist-id', true
      );

      expect(service.findAll).toHaveBeenCalledWith({
        page: 2,
        limit: 20,
        search: 'test',
        sortBy: 'title',
        sortOrder: 'asc',
        artistId: 'artist-id',
        withLyrics: true,
      });
    });
  });

  describe('getSongById', () => {
    it('should return a song by ID', async () => {
      const mockSong = { id: '1', title: 'Test Song' };
      service.findById.mockResolvedValue(mockSong);

      const result = await controller.getSongById('1');

      expect(result).toBe(mockSong);
      expect(service.findById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when song not found', async () => {
      service.findById.mockResolvedValue(null);

      await expect(controller.getSongById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createSong', () => {
    it('should create a new song', async () => {
      const createDto: CreateSongDto = {
        title: 'New Song',
        artistId: '1',
        audioSources: [
          { url: 'https://youtube.com/watch?v=123456', sourceType: 'YOUTUBE', isMain: true }
        ]
      };
      
      const mockCreatedSong = {
        id: 'new-id',
        title: 'New Song',
      };
      
      service.create.mockResolvedValue(mockCreatedSong);

      const result = await controller.createSong(createDto, 'user-id');

      expect(result).toBe(mockCreatedSong);
      expect(service.create).toHaveBeenCalledWith(createDto, 'user-id');
    });
  });

  describe('updateSong', () => {
    it('should update an existing song', async () => {
      const updateDto: UpdateSongDto = {
        title: 'Updated Song',
      };
      
      const mockSong = { id: '1', title: 'Original Song' };
      const mockUpdatedSong = { id: '1', title: 'Updated Song' };
      
      service.findById.mockResolvedValue(mockSong);
      service.update.mockResolvedValue(mockUpdatedSong);

      const result = await controller.updateSong('1', updateDto, 'user-id');

      expect(result).toBe(mockUpdatedSong);
      expect(service.findById).toHaveBeenCalledWith('1');
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });

    it('should throw NotFoundException when song not found', async () => {
      const updateDto: UpdateSongDto = { title: 'Updated Song' };
      
      service.findById.mockResolvedValue(null);

      await expect(controller.updateSong('nonexistent', updateDto, 'user-id')).rejects.toThrow(NotFoundException);
      expect(service.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteSong', () => {
    it('should delete a song', async () => {
      const mockSong = { id: '1', title: 'Test Song' };
      
      service.findById.mockResolvedValue(mockSong);
      service.remove.mockResolvedValue(undefined);

      await controller.deleteSong('1', 'user-id');

      expect(service.findById).toHaveBeenCalledWith('1');
      expect(service.remove).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when song not found', async () => {
      service.findById.mockResolvedValue(null);

      await expect(controller.deleteSong('nonexistent', 'user-id')).rejects.toThrow(NotFoundException);
      expect(service.remove).not.toHaveBeenCalled();
    });
  });

  describe('likeSong', () => {
    it('should like a song', async () => {
      const mockSong = { id: '1', title: 'Test Song' };
      const mockLike = { songId: '1', userId: 'user-id' };
      
      service.findById.mockResolvedValue(mockSong);
      service.likeSong.mockResolvedValue(mockLike);

      const result = await controller.likeSong('1', 'user-id');

      expect(result).toBe(mockLike);
      expect(service.findById).toHaveBeenCalledWith('1');
      expect(service.likeSong).toHaveBeenCalledWith('1', 'user-id');
    });

    it('should throw NotFoundException when song not found', async () => {
      service.findById.mockResolvedValue(null);

      await expect(controller.likeSong('nonexistent', 'user-id')).rejects.toThrow(NotFoundException);
      expect(service.likeSong).not.toHaveBeenCalled();
    });
  });

  describe('unlikeSong', () => {
    it('should unlike a song', async () => {
      const mockSong = { id: '1', title: 'Test Song' };
      
      service.findById.mockResolvedValue(mockSong);
      service.unlikeSong.mockResolvedValue(undefined);

      await controller.unlikeSong('1', 'user-id');

      expect(service.findById).toHaveBeenCalledWith('1');
      expect(service.unlikeSong).toHaveBeenCalledWith('1', 'user-id');
    });

    it('should throw NotFoundException when song not found', async () => {
      service.findById.mockResolvedValue(null);

      await expect(controller.unlikeSong('nonexistent', 'user-id')).rejects.toThrow(NotFoundException);
      expect(service.unlikeSong).not.toHaveBeenCalled();
    });
  });
});