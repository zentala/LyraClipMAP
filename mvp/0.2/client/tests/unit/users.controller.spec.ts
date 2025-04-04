import { Test } from '@nestjs/testing';
import { UsersController } from '../../../server/src/users/users.controller';
import { UsersService } from '../../../server/src/users/users.service';
import { JwtAuthGuard } from '../../../server/src/auth/guards/jwt-auth.guard';
import { NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';

// Mock UsersService
const mockUsersService = {
  findById: jest.fn(),
  update: jest.fn(),
  getUserPreferences: jest.fn(),
  updateUserPreferences: jest.fn(),
  getLikedSongs: jest.fn(),
  getLikedArtists: jest.fn(),
  getUserPlaylists: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: any;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get<UsersController>(UsersController);
    service = moduleRef.get<UsersService>(UsersService);
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('getUser', () => {
    it('should return a user if found', async () => {
      // Arrange
      const mockUser = {
        id: 'user-id-1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      service.findById.mockResolvedValue(mockUser);

      // Act
      const result = await controller.getUser('user-id-1');

      // Assert
      expect(result).toBe(mockUser);
      expect(service.findById).toHaveBeenCalledWith('user-id-1');
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      service.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(controller.getUser('nonexistent-id')).rejects.toThrow(NotFoundException);
      expect(service.findById).toHaveBeenCalledWith('nonexistent-id');
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      // Arrange
      const updateUserDto = {
        name: 'Updated Name',
      };
      
      const mockUser = {
        id: 'user-id-1',
        email: 'test@example.com',
        name: 'Updated Name',
      };
      
      service.update.mockResolvedValue(mockUser);

      // Act
      const result = await controller.updateUser('user-id-1', updateUserDto, { id: 'user-id-1' });

      // Assert
      expect(result).toBe(mockUser);
      expect(service.update).toHaveBeenCalledWith('user-id-1', updateUserDto);
    });

    it('should throw ForbiddenException if user tries to update another user', async () => {
      // Arrange
      const updateUserDto = {
        name: 'Updated Name',
      };

      // Act & Assert
      await expect(controller.updateUser('user-id-1', updateUserDto, { id: 'different-user-id' }))
        .rejects.toThrow(ForbiddenException);
      expect(service.update).not.toHaveBeenCalled();
    });

    it('should handle NotFoundException from service', async () => {
      // Arrange
      const updateUserDto = {
        name: 'Updated Name',
      };
      
      service.update.mockRejectedValue(new NotFoundException('User not found'));

      // Act & Assert
      await expect(controller.updateUser('nonexistent-id', updateUserDto, { id: 'nonexistent-id' }))
        .rejects.toThrow(NotFoundException);
      expect(service.update).toHaveBeenCalledWith('nonexistent-id', updateUserDto);
    });
  });

  describe('getUserPreferences', () => {
    it('should return user preferences', async () => {
      // Arrange
      const mockPreferences = {
        theme: 'dark',
        language: 'en',
        notificationsEnabled: true,
      };
      
      service.getUserPreferences.mockResolvedValue(mockPreferences);

      // Act
      const result = await controller.getUserPreferences('user-id-1', { id: 'user-id-1' });

      // Assert
      expect(result).toBe(mockPreferences);
      expect(service.getUserPreferences).toHaveBeenCalledWith('user-id-1');
    });

    it('should throw ForbiddenException if user tries to get another user\'s preferences', async () => {
      // Act & Assert
      await expect(controller.getUserPreferences('user-id-1', { id: 'different-user-id' }))
        .rejects.toThrow(ForbiddenException);
      expect(service.getUserPreferences).not.toHaveBeenCalled();
    });

    it('should handle null preferences', async () => {
      // Arrange
      service.getUserPreferences.mockResolvedValue(null);

      // Act
      const result = await controller.getUserPreferences('user-id-1', { id: 'user-id-1' });

      // Assert
      expect(result).toBeNull();
      expect(service.getUserPreferences).toHaveBeenCalledWith('user-id-1');
    });
  });

  describe('updateUserPreferences', () => {
    it('should update user preferences', async () => {
      // Arrange
      const updatePrefsDto = {
        theme: 'light',
        language: 'fr',
        notificationsEnabled: false,
      };
      
      const mockUpdatedPrefs = {
        theme: 'light',
        language: 'fr',
        notificationsEnabled: false,
      };
      
      service.updateUserPreferences.mockResolvedValue(mockUpdatedPrefs);

      // Act
      const result = await controller.updateUserPreferences('user-id-1', updatePrefsDto, { id: 'user-id-1' });

      // Assert
      expect(result).toBe(mockUpdatedPrefs);
      expect(service.updateUserPreferences).toHaveBeenCalledWith('user-id-1', updatePrefsDto);
    });

    it('should throw ForbiddenException if user tries to update another user\'s preferences', async () => {
      // Arrange
      const updatePrefsDto = {
        theme: 'light',
      };

      // Act & Assert
      await expect(controller.updateUserPreferences('user-id-1', updatePrefsDto, { id: 'different-user-id' }))
        .rejects.toThrow(ForbiddenException);
      expect(service.updateUserPreferences).not.toHaveBeenCalled();
    });
  });

  describe('getLikedSongs', () => {
    it('should return paginated liked songs', async () => {
      // Arrange
      const mockResponse = {
        data: [
          {
            id: 'song-id-1',
            title: 'Liked Song 1',
          },
          {
            id: 'song-id-2',
            title: 'Liked Song 2',
          },
        ],
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
      
      service.getLikedSongs.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.getLikedSongs('user-id-1', 1, 10, { id: 'user-id-1' });

      // Assert
      expect(result).toBe(mockResponse);
      expect(service.getLikedSongs).toHaveBeenCalledWith('user-id-1', { page: 1, limit: 10 });
    });

    it('should throw ForbiddenException if user tries to get another user\'s liked songs', async () => {
      // Act & Assert
      await expect(controller.getLikedSongs('user-id-1', 1, 10, { id: 'different-user-id' }))
        .rejects.toThrow(ForbiddenException);
      expect(service.getLikedSongs).not.toHaveBeenCalled();
    });
  });

  describe('getLikedArtists', () => {
    it('should return paginated liked artists', async () => {
      // Arrange
      const mockResponse = {
        data: [
          {
            id: 'artist-id-1',
            name: 'Liked Artist 1',
          },
          {
            id: 'artist-id-2',
            name: 'Liked Artist 2',
          },
        ],
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
      
      service.getLikedArtists.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.getLikedArtists('user-id-1', 1, 10, { id: 'user-id-1' });

      // Assert
      expect(result).toBe(mockResponse);
      expect(service.getLikedArtists).toHaveBeenCalledWith('user-id-1', { page: 1, limit: 10 });
    });

    it('should throw ForbiddenException if user tries to get another user\'s liked artists', async () => {
      // Act & Assert
      await expect(controller.getLikedArtists('user-id-1', 1, 10, { id: 'different-user-id' }))
        .rejects.toThrow(ForbiddenException);
      expect(service.getLikedArtists).not.toHaveBeenCalled();
    });
  });

  describe('getUserPlaylists', () => {
    it('should return paginated user playlists', async () => {
      // Arrange
      const mockResponse = {
        data: [
          {
            id: 'playlist-id-1',
            name: 'My Playlist 1',
          },
          {
            id: 'playlist-id-2',
            name: 'My Playlist 2',
          },
        ],
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
      
      service.getUserPlaylists.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.getUserPlaylists('user-id-1', 1, 10, { id: 'user-id-1' });

      // Assert
      expect(result).toBe(mockResponse);
      expect(service.getUserPlaylists).toHaveBeenCalledWith('user-id-1', { page: 1, limit: 10 });
    });

    it('should throw ForbiddenException if user tries to get another user\'s playlists', async () => {
      // Act & Assert
      await expect(controller.getUserPlaylists('user-id-1', 1, 10, { id: 'different-user-id' }))
        .rejects.toThrow(ForbiddenException);
      expect(service.getUserPlaylists).not.toHaveBeenCalled();
    });
  });
});