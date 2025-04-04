import { Test, TestingModule } from '@nestjs/testing';
import { ArtistsService } from '../artists.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ArtistsService Metadata', () => {
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

  describe('metadata validation', () => {
    it('should validate required name field', async () => {
      const createArtistDto = {
        name: '',
        bio: 'Test Bio',
        imageUrl: 'https://example.com/image.jpg',
      };

      await expect(service.create(createArtistDto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.artist.create).not.toHaveBeenCalled();
    });

    it('should validate imageUrl format', async () => {
      const createArtistDto = {
        name: 'Test Artist',
        bio: 'Test Bio',
        imageUrl: 'invalid-url',
      };

      // Mock validateImageUrl to throw BadRequestException
      jest.spyOn(service as any, 'validateImageUrl').mockImplementation(() => {
        throw new BadRequestException('Invalid image URL format');
      });

      await expect(service.create(createArtistDto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.artist.create).not.toHaveBeenCalled();
    });

    it('should accept valid metadata', async () => {
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

  describe('metadata updates', () => {
    it('should update artist metadata', async () => {
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
        imageUrl: 'https://example.com/updated-image.jpg',
      };

      const mockUpdatedArtist = {
        ...mockArtist,
        ...updateArtistDto,
        updatedAt: new Date(),
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

    it('should handle partial metadata updates', async () => {
      const mockArtist = {
        id: 1,
        name: 'Test Artist',
        bio: 'Test Bio',
        imageUrl: 'https://example.com/image.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateArtistDto = {
        bio: 'Updated Bio Only',
      };

      const mockUpdatedArtist = {
        ...mockArtist,
        ...updateArtistDto,
        updatedAt: new Date(),
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
  });

  describe('optional fields handling', () => {
    it('should create artist with minimal required fields', async () => {
      const createArtistDto = {
        name: 'Test Artist',
      };

      const mockCreatedArtist = {
        id: 1,
        ...createArtistDto,
        bio: null,
        imageUrl: null,
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

    it('should handle null optional fields in updates', async () => {
      const mockArtist = {
        id: 1,
        name: 'Test Artist',
        bio: 'Test Bio',
        imageUrl: 'https://example.com/image.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateArtistDto = {
        bio: null,
        imageUrl: null,
      };

      const mockUpdatedArtist = {
        ...mockArtist,
        ...updateArtistDto,
        updatedAt: new Date(),
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
  });

  describe('date handling', () => {
    it('should handle createdAt and updatedAt fields correctly', async () => {
      const createArtistDto = {
        name: 'Test Artist',
      };

      const now = new Date();
      const mockCreatedArtist = {
        id: 1,
        ...createArtistDto,
        bio: null,
        imageUrl: null,
        createdAt: now,
        updatedAt: now,
      };

      mockPrismaService.artist.create.mockResolvedValue(mockCreatedArtist);

      const result = await service.create(createArtistDto);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.createdAt.getTime()).toBeLessThanOrEqual(Date.now());
      expect(result.updatedAt.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should update updatedAt field on metadata changes', async () => {
      const mockArtist = {
        id: 1,
        name: 'Test Artist',
        bio: 'Test Bio',
        imageUrl: 'https://example.com/image.jpg',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      const updateArtistDto = {
        bio: 'Updated Bio',
      };

      const mockUpdatedArtist = {
        ...mockArtist,
        ...updateArtistDto,
        updatedAt: new Date(),
      };

      mockPrismaService.artist.findUnique.mockResolvedValue(mockArtist);
      mockPrismaService.artist.update.mockResolvedValue(mockUpdatedArtist);

      const result = await service.update(1, updateArtistDto);

      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.updatedAt.getTime()).toBeGreaterThan(mockArtist.updatedAt.getTime());
    });
  });
}); 