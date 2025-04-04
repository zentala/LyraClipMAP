import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { NotFoundException } from '@nestjs/common';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

// Mock AuthGuard
const mockAuthGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  UseGuards: () => () => {},
}));

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getUserPreferences: jest.fn(),
    updateUserPreferences: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of users for admin', async () => {
      const mockUsers = [
        {
          id: 1,
          email: 'user1@example.com',
          username: 'user1',
          role: 'ADMIN',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          email: 'user2@example.com',
          username: 'user2',
          role: 'USER',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockUsersService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(result).toEqual(mockUsers);
      expect(mockUsersService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const mockUser = {
        id: 1,
        email: 'user1@example.com',
        username: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUsersService.findById.mockRejectedValue(new NotFoundException('User with ID 999 not found'));

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
      expect(mockUsersService.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('create', () => {
    it('should create a new user for admin', async () => {
      const createUserDto: CreateUserDto = {
        email: 'new@example.com',
        password: 'password123',
        username: 'newuser',
      };

      const mockCreatedUser = {
        id: 1,
        email: createUserDto.email,
        username: createUserDto.username,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.create.mockResolvedValue(mockCreatedUser);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(mockCreatedUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'updated@example.com',
        username: 'updateduser',
      };

      const mockUpdatedUser = {
        id: 1,
        email: updateUserDto.email,
        username: updateUserDto.username,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.update.mockResolvedValue(mockUpdatedUser);

      const result = await controller.update(1, updateUserDto);

      expect(result).toEqual(mockUpdatedUser);
      expect(mockUsersService.update).toHaveBeenCalledWith(1, updateUserDto);
    });

    it('should throw NotFoundException if user not found', async () => {
      const updateUserDto: UpdateUserDto = {
        username: 'updateduser',
      };

      mockUsersService.update.mockRejectedValue(new NotFoundException('User with ID 999 not found'));

      await expect(controller.update(999, updateUserDto)).rejects.toThrow(NotFoundException);
      expect(mockUsersService.update).toHaveBeenCalledWith(999, updateUserDto);
    });
  });

  describe('remove', () => {
    it('should delete a user for admin', async () => {
      const mockDeletedUser = {
        id: 1,
        email: 'user1@example.com',
        username: 'user1',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.delete.mockResolvedValue(mockDeletedUser);

      const result = await controller.remove(1);

      expect(result).toEqual(mockDeletedUser);
      expect(mockUsersService.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUsersService.delete.mockRejectedValue(new NotFoundException('User with ID 999 not found'));

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
      expect(mockUsersService.delete).toHaveBeenCalledWith(999);
    });
  });

  describe('getUserPreferences', () => {
    it('should return user preferences', async () => {
      const mockPreferences = {
        id: 1,
        userId: 1,
        theme: 'dark',
        language: 'pl',
        notifications: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.getUserPreferences.mockResolvedValue(mockPreferences);

      const result = await controller.getUserPreferences(1);

      expect(result).toEqual(mockPreferences);
      expect(mockUsersService.getUserPreferences).toHaveBeenCalledWith(1);
    });
  });

  describe('updateUserPreferences', () => {
    it('should update user preferences', async () => {
      const updatePreferencesDto = {
        theme: 'dark',
        language: 'pl',
        notifications: false,
      };

      const mockUpdatedPreferences = {
        id: 1,
        userId: 1,
        ...updatePreferencesDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.updateUserPreferences.mockResolvedValue(mockUpdatedPreferences);

      const result = await controller.updateUserPreferences(1, updatePreferencesDto);

      expect(result).toEqual(mockUpdatedPreferences);
      expect(mockUsersService.updateUserPreferences).toHaveBeenCalledWith(1, updatePreferencesDto);
    });
  });
}); 