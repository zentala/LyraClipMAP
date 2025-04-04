import { Test, TestingModule } from '@nestjs/testing';
import { ArtistsService } from '../artists.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ArtistsService', () => {
  let service: ArtistsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    artist: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArtistsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ArtistsService>(ArtistsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new artist', async () => {
      const createArtistDto = {
        name: 'Test Artist',
        bio: 'Test Bio',
        imageUrl: 'https://example.com/image.jpg',
      };

      const mockCreatedArtist = {
        id: 1,
        ...createArtistDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.artist.create.mockResolvedValue(mockCreatedArtist);

      const result = await service.create(createArtistDto);

      expect(result).toEqual(mockCreatedArtist);
      expect(mockPrismaService.artist.create).toHaveBeenCalledWith({
        data: createArtistDto,
      });
    });
  });

  describe('findAll', () => {
    it('should return all artists', async () => {
      const mockArtists = [
        {
          id: 1,
          name: 'Artist 1',
          bio: 'Bio 1',
          imageUrl: 'https://example.com/image1.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Artist 2',
          bio: 'Bio 2',
          imageUrl: 'https://example.com/image2.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.artist.findMany.mockResolvedValue(mockArtists);

      const result = await service.findAll();

      expect(result).toEqual(mockArtists);
      expect(mockPrismaService.artist.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an artist if found by id', async () => {
      const mockArtist = {
        id: 1,
        name: 'Test Artist',
        bio: 'Test Bio',
        imageUrl: 'https://example.com/image.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.artist.findUnique.mockResolvedValue(mockArtist);

      const result = await service.findOne(1);

      expect(result).toEqual(mockArtist);
      expect(mockPrismaService.artist.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException if artist not found', async () => {
      mockPrismaService.artist.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.artist.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });
  });

  describe('update', () => {
    it('should update an artist', async () => {
      const mockArtist = {
        id: 1,
        name: 'Test Artist',
        bio: 'Test Bio',
        imageUrl: 'https://example.com/image.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateArtistDto = {
        name: 'Updated Artist',
        bio: 'Updated Bio',
      };

      const mockUpdatedArtist = {
        ...mockArtist,
        ...updateArtistDto,
      };

      mockPrismaService.artist.findUnique.mockResolvedValue(mockArtist);
      mockPrismaService.artist.update.mockResolvedValue(mockUpdatedArtist);

      const result = await service.update(1, updateArtistDto);

      expect(result).toEqual(mockUpdatedArtist);
      expect(mockPrismaService.artist.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateArtistDto,
      });
    });

    it('should throw NotFoundException if artist not found', async () => {
      mockPrismaService.artist.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { name: 'Updated Artist' })).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.artist.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete an artist', async () => {
      const mockArtist = {
        id: 1,
        name: 'Test Artist',
        bio: 'Test Bio',
        imageUrl: 'https://example.com/image.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.artist.findUnique.mockResolvedValue(mockArtist);
      mockPrismaService.artist.delete.mockResolvedValue(mockArtist);

      const result = await service.remove(1);

      expect(result).toEqual(mockArtist);
      expect(mockPrismaService.artist.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException if artist not found', async () => {
      mockPrismaService.artist.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.artist.delete).not.toHaveBeenCalled();
    });
  });
}); 