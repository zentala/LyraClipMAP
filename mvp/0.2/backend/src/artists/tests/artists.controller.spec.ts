import { Test, TestingModule } from '@nestjs/testing';
import { ArtistsController } from '../artists.controller';
import { ArtistsService } from '../artists.service';
import { CreateArtistDto } from '../dto/create-artist.dto';
import { UpdateArtistDto } from '../dto/update-artist.dto';
import { NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';

describe('ArtistsController', () => {
  let controller: ArtistsController;
  let service: ArtistsService;

  const mockArtistsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockJwtService = {
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  const mockRolesGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  const mockArtist = {
    id: 1,
    name: 'Test Artist',
    bio: 'Test Bio',
    imageUrl: 'https://example.com/image.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArtistsController],
      providers: [
        {
          provide: ArtistsService,
          useValue: mockArtistsService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: AuthGuard,
          useValue: mockAuthGuard,
        },
        {
          provide: RolesGuard,
          useValue: mockRolesGuard,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<ArtistsController>(ArtistsController);
    service = module.get<ArtistsService>(ArtistsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new artist', async () => {
      const createArtistDto: CreateArtistDto = {
        name: 'Test Artist',
        bio: 'Test Bio',
        imageUrl: 'https://example.com/image.jpg',
      };

      mockArtistsService.create.mockResolvedValue(mockArtist);

      const result = await controller.create(createArtistDto);

      expect(result).toEqual(mockArtist);
      expect(mockArtistsService.create).toHaveBeenCalledWith(createArtistDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of artists', async () => {
      const mockArtists = [mockArtist, { ...mockArtist, id: 2 }];
      mockArtistsService.findAll.mockResolvedValue(mockArtists);

      const result = await controller.findAll();

      expect(result).toEqual(mockArtists);
      expect(mockArtistsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single artist', async () => {
      mockArtistsService.findOne.mockResolvedValue(mockArtist);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockArtist);
      expect(mockArtistsService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when artist not found', async () => {
      mockArtistsService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
      expect(mockArtistsService.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('update', () => {
    it('should update an artist', async () => {
      const updateArtistDto: UpdateArtistDto = {
        name: 'Updated Artist',
        bio: 'Updated Bio',
      };

      const updatedArtist = { ...mockArtist, ...updateArtistDto };
      mockArtistsService.update.mockResolvedValue(updatedArtist);

      const result = await controller.update(1, updateArtistDto);

      expect(result).toEqual(updatedArtist);
      expect(mockArtistsService.update).toHaveBeenCalledWith(1, updateArtistDto);
    });

    it('should throw NotFoundException when artist not found', async () => {
      const updateArtistDto: UpdateArtistDto = {
        name: 'Updated Artist',
      };

      mockArtistsService.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update(999, updateArtistDto)).rejects.toThrow(NotFoundException);
      expect(mockArtistsService.update).toHaveBeenCalledWith(999, updateArtistDto);
    });
  });

  describe('remove', () => {
    it('should remove an artist', async () => {
      mockArtistsService.remove.mockResolvedValue(mockArtist);

      const result = await controller.remove(1);

      expect(result).toEqual(mockArtist);
      expect(mockArtistsService.remove).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when artist not found', async () => {
      mockArtistsService.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
      expect(mockArtistsService.remove).toHaveBeenCalledWith(999);
    });
  });
}); 