import { Test, TestingModule } from '@nestjs/testing';
import { TagService } from '../tags.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('TagService', () => {
  let service: TagService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    tag: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    song: {
      findUnique: jest.fn(),
    },
    songTag: {
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TagService>(TagService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a tag', async () => {
      const createTagDto = {
        name: 'Test Tag',
        description: 'Test Description',
        category: 'Test Category',
      };

      const mockTag = {
        id: 1,
        ...createTagDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        songs: [],
      };

      mockPrismaService.tag.create.mockResolvedValue(mockTag);

      const result = await service.create(createTagDto);

      expect(result).toEqual(mockTag);
      expect(mockPrismaService.tag.create).toHaveBeenCalledWith({
        data: createTagDto,
        include: {
          songs: true,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all tags', async () => {
      const mockTags = [
        {
          id: 1,
          name: 'Tag 1',
          description: 'Description 1',
          category: 'Category 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          songs: [],
        },
        {
          id: 2,
          name: 'Tag 2',
          description: 'Description 2',
          category: 'Category 2',
          createdAt: new Date(),
          updatedAt: new Date(),
          songs: [],
        },
      ];

      mockPrismaService.tag.findMany.mockResolvedValue(mockTags);

      const result = await service.findAll();

      expect(result).toEqual(mockTags);
      expect(mockPrismaService.tag.findMany).toHaveBeenCalledWith({
        include: {
          songs: true,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a tag by id', async () => {
      const tagId = 1;
      const mockTag = {
        id: tagId,
        name: 'Test Tag',
        description: 'Test Description',
        category: 'Test Category',
        createdAt: new Date(),
        updatedAt: new Date(),
        songs: [],
      };

      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);

      const result = await service.findOne(tagId);

      expect(result).toEqual(mockTag);
      expect(mockPrismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { id: tagId },
        include: {
          songs: true,
        },
      });
    });

    it('should throw NotFoundException if tag not found', async () => {
      const tagId = 999;
      mockPrismaService.tag.findUnique.mockResolvedValue(null);

      await expect(service.findOne(tagId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a tag', async () => {
      const tagId = 1;
      const updateTagDto = {
        name: 'Updated Tag',
        description: 'Updated Description',
        category: 'Updated Category',
      };

      const mockTag = {
        id: tagId,
        name: 'Test Tag',
        description: 'Test Description',
        category: 'Test Category',
        createdAt: new Date(),
        updatedAt: new Date(),
        songs: [],
      };

      const updatedTag = {
        ...mockTag,
        ...updateTagDto,
      };

      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);
      mockPrismaService.tag.update.mockResolvedValue(updatedTag);

      const result = await service.update(tagId, updateTagDto);

      expect(result).toEqual(updatedTag);
      expect(mockPrismaService.tag.update).toHaveBeenCalledWith({
        where: { id: tagId },
        data: updateTagDto,
        include: {
          songs: true,
        },
      });
    });

    it('should throw NotFoundException if tag not found', async () => {
      const tagId = 999;
      mockPrismaService.tag.findUnique.mockResolvedValue(null);

      await expect(service.update(tagId, { name: 'Updated Tag' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a tag', async () => {
      const tagId = 1;
      const mockTag = {
        id: tagId,
        name: 'Test Tag',
        description: 'Test Description',
        category: 'Test Category',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);
      mockPrismaService.tag.delete.mockResolvedValue(mockTag);

      const result = await service.remove(tagId);

      expect(result).toEqual(mockTag);
      expect(mockPrismaService.tag.delete).toHaveBeenCalledWith({
        where: { id: tagId },
      });
    });

    it('should throw NotFoundException if tag not found', async () => {
      const tagId = 999;
      mockPrismaService.tag.findUnique.mockResolvedValue(null);

      await expect(service.remove(tagId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addTagToSong', () => {
    it('should add a tag to a song', async () => {
      const songId = 1;
      const tagId = 1;

      const mockSong = {
        id: songId,
        title: 'Test Song',
        artistId: 1,
        duration: 180,
        audioUrl: 'https://example.com/song.mp3',
        lyricsId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTag = {
        id: tagId,
        name: 'Test Tag',
        description: 'Test Description',
        category: 'Test Category',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockSongTag = {
        id: 1,
        songId,
        tagId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.song.findUnique.mockResolvedValue(mockSong);
      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);
      mockPrismaService.songTag.create.mockResolvedValue(mockSongTag);

      const result = await service.addTagToSong(songId, tagId);

      expect(result).toEqual(mockSongTag);
      expect(mockPrismaService.songTag.create).toHaveBeenCalledWith({
        data: {
          song: {
            connect: { id: songId },
          },
          tag: {
            connect: { id: tagId },
          },
        },
      });
    });

    it('should throw NotFoundException if song not found', async () => {
      const songId = 999;
      const tagId = 1;
      mockPrismaService.song.findUnique.mockResolvedValue(null);

      await expect(service.addTagToSong(songId, tagId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if tag not found', async () => {
      const songId = 1;
      const tagId = 999;
      mockPrismaService.song.findUnique.mockResolvedValue({ id: songId });
      mockPrismaService.tag.findUnique.mockResolvedValue(null);

      await expect(service.addTagToSong(songId, tagId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeTagFromSong', () => {
    it('should remove a tag from a song', async () => {
      const songId = 1;
      const tagId = 1;

      const mockSongTag = {
        id: 1,
        songId,
        tagId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.songTag.findFirst.mockResolvedValue(mockSongTag);
      mockPrismaService.songTag.delete.mockResolvedValue(mockSongTag);

      const result = await service.removeTagFromSong(songId, tagId);

      expect(result).toEqual(mockSongTag);
      expect(mockPrismaService.songTag.delete).toHaveBeenCalledWith({
        where: {
          id: mockSongTag.id,
        },
      });
    });

    it('should throw NotFoundException if tag is not assigned to song', async () => {
      const songId = 1;
      const tagId = 1;
      mockPrismaService.songTag.findFirst.mockResolvedValue(null);

      await expect(service.removeTagFromSong(songId, tagId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
}); 