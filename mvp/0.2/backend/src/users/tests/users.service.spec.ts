import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    userPreferences: {
      findUnique: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
    },
    $queryRaw: jest.fn(),
    $executeRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should return a user if found by email', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
    });
  });

  describe('findById', () => {
    it('should return a user if found by id', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById(1);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });
  });

  describe('findAll', () => {
    it('should return all users without passwords', async () => {
      const mockUsers = [
        {
          id: 1,
          email: 'user1@example.com',
          username: 'user1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          email: 'user2@example.com',
          username: 'user2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const userData = {
        email: 'new@example.com',
        password: 'password123',
        username: 'newuser',
      };

      const mockCreatedUser = {
        id: 1,
        email: userData.email,
        username: userData.username,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser);

      const result = await service.create(userData);

      expect(result).toEqual(mockCreatedUser);
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...userData,
          password: 'hashedPassword',
        },
        select: {
          id: true,
          email: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });
  });

  describe('update', () => {
    it('should update a user without changing password', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateData = {
        email: 'updated@example.com',
        username: 'updateduser',
      };

      const mockUpdatedUser = {
        id: 1,
        email: updateData.email,
        username: updateData.username,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await service.update(1, updateData);

      expect(result).toEqual(mockUpdatedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
        select: {
          id: true,
          email: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('should update a user with new password', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateData = {
        password: 'newpassword',
      };

      const mockUpdatedUser = {
        id: 1,
        email: mockUser.email,
        username: mockUser.username,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await service.update(1, updateData);

      expect(result).toEqual(mockUpdatedUser);
      expect(bcrypt.hash).toHaveBeenCalledWith(updateData.password, 10);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { password: 'hashedPassword' },
        select: {
          id: true,
          email: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { username: 'newuser' })).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a user if found', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await service.delete(1);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.user.delete).not.toHaveBeenCalled();
    });
  });

  describe('getUserPreferences', () => {
    it('should return existing user preferences', async () => {
      const userId = 1;
      const mockPreferences = { id: 1, userId: 1, theme: 'dark', language: 'en', notifications: true };
      
      mockPrismaService.user.findUnique.mockResolvedValue({ id: userId });
      mockPrismaService.$queryRaw.mockResolvedValue([mockPreferences]);

      const result = await service.getUserPreferences(userId);

      expect(result).toEqual(mockPreferences);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockPrismaService.$queryRaw).toHaveBeenCalled();
    });

    it('should create default preferences if none exist', async () => {
      const userId = 1;
      
      mockPrismaService.user.findUnique.mockResolvedValue({ id: userId });
      mockPrismaService.$queryRaw.mockResolvedValue([]);

      const result = await service.getUserPreferences(userId);

      expect(result).toBeNull();
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockPrismaService.$queryRaw).toHaveBeenCalled();
    });
  });

  describe('updateUserPreferences', () => {
    it('should update existing user preferences', async () => {
      const userId = 1;
      const updateData = { theme: 'light', language: 'pl', notifications: false };
      const mockPreferences = { id: 1, userId: 1, theme: 'dark', language: 'en', notifications: true };
      
      mockPrismaService.user.findUnique.mockResolvedValue({ id: userId });
      mockPrismaService.$queryRaw.mockResolvedValue([mockPreferences]);
      mockPrismaService.$executeRaw.mockResolvedValue({ count: 1 });

      const result = await service.updateUserPreferences(userId, updateData);

      expect(result).toBeDefined();
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockPrismaService.$queryRaw).toHaveBeenCalled();
      expect(mockPrismaService.$executeRaw).toHaveBeenCalled();
    });

    it('should create preferences if they do not exist', async () => {
      const userId = 1;
      const updateData = { theme: 'light', language: 'pl', notifications: false };
      
      mockPrismaService.user.findUnique.mockResolvedValue({ id: userId });
      mockPrismaService.$queryRaw.mockResolvedValue([]);
      mockPrismaService.$executeRaw.mockResolvedValue({ count: 1 });

      const result = await service.updateUserPreferences(userId, updateData);

      expect(result).toBeDefined();
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockPrismaService.$queryRaw).toHaveBeenCalled();
      expect(mockPrismaService.$executeRaw).toHaveBeenCalled();
    });
  });
}); 