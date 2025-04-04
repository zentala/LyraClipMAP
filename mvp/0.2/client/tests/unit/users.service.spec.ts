import { Test } from '@nestjs/testing';
import { UsersService } from '../../../server/src/users/users.service';
import { PrismaService } from '../../../server/src/prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { MockPrismaService } from '../mocks/prisma.mock';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useClass: MockPrismaService },
      ],
    }).compile();

    service = moduleRef.get<UsersService>(UsersService);
    prisma = moduleRef.get(PrismaService);
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      // Arrange
      const mockUser = {
        id: 'user-id-1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      prisma.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await service.findById('user-id-1');

      // Assert
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
      });
    });

    it('should return null if user not found', async () => {
      // Arrange
      prisma.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.findById('nonexistent-id');

      // Assert
      expect(result).toBeNull();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'nonexistent-id' },
      });
    });
  });

  describe('findByEmail', () => {
    it('should return a user if found', async () => {
      // Arrange
      const mockUser = {
        id: 'user-id-1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      prisma.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await service.findByEmail('test@example.com');

      // Assert
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null if user not found', async () => {
      // Arrange
      prisma.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.findByEmail('nonexistent@example.com');

      // Assert
      expect(result).toBeNull();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      // Arrange
      const createUserDto = {
        email: 'new@example.com',
        password: 'hashed-password',
        name: 'New User',
      };
      
      const mockCreatedUser = {
        id: 'new-user-id',
        email: createUserDto.email,
        password: createUserDto.password,
        name: createUserDto.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      prisma.user.create.mockResolvedValue(mockCreatedUser);

      // Act
      const result = await service.create(createUserDto);

      // Assert
      expect(result).toEqual(mockCreatedUser);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: createUserDto,
      });
    });

    it('should handle database errors', async () => {
      // Arrange
      const createUserDto = {
        email: 'new@example.com',
        password: 'hashed-password',
        name: 'New User',
      };
      
      // Simulate a database error (e.g., unique constraint violation)
      prisma.user.create.mockRejectedValue(new Error('Unique constraint failed on the fields: (`email`)'));

      // Act & Assert
      await expect(service.create(createUserDto)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update an existing user', async () => {
      // Arrange
      const updateUserDto = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };
      
      const mockUpdatedUser = {
        id: 'user-id-1',
        email: updateUserDto.email,
        name: updateUserDto.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      prisma.user.update.mockResolvedValue(mockUpdatedUser);
      prisma.user.findUnique.mockResolvedValue({ id: 'user-id-1' }); // User exists check

      // Act
      const result = await service.update('user-id-1', updateUserDto);

      // Assert
      expect(result).toEqual(mockUpdatedUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
        data: updateUserDto,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      const updateUserDto = {
        name: 'Updated Name',
      };
      
      prisma.user.findUnique.mockResolvedValue(null); // User doesn't exist

      // Act & Assert
      await expect(service.update('nonexistent-id', updateUserDto)).rejects.toThrow(NotFoundException);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'nonexistent-id' },
      });
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should handle email uniqueness conflicts', async () => {
      // Arrange
      const updateUserDto = {
        email: 'existing@example.com', // Email that already exists for another user
      };
      
      prisma.user.findUnique.mockResolvedValueOnce({ id: 'user-id-1' }); // User exists check
      prisma.user.findUnique.mockResolvedValueOnce({ id: 'another-user-id' }); // Email exists check
      
      // Act & Assert
      await expect(service.update('user-id-1', updateUserDto)).rejects.toThrow(ConflictException);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'existing@example.com' },
      });
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('getUserPreferences', () => {
    it('should return user preferences', async () => {
      // Arrange
      const mockPreferences = {
        id: 'pref-id-1',
        userId: 'user-id-1',
        theme: 'dark',
        language: 'en',
        notificationsEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      prisma.userPreferences.findUnique.mockResolvedValue(mockPreferences);

      // Act
      const result = await service.getUserPreferences('user-id-1');

      // Assert
      expect(result).toEqual(mockPreferences);
      expect(prisma.userPreferences.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-id-1' },
      });
    });

    it('should return null if preferences not found', async () => {
      // Arrange
      prisma.userPreferences.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.getUserPreferences('user-id-1');

      // Assert
      expect(result).toBeNull();
      expect(prisma.userPreferences.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-id-1' },
      });
    });
  });

  describe('updateUserPreferences', () => {
    it('should update existing preferences', async () => {
      // Arrange
      const updatePrefsDto = {
        theme: 'light',
        language: 'fr',
        notificationsEnabled: false,
      };
      
      const mockExistingPrefs = {
        id: 'pref-id-1',
        userId: 'user-id-1',
        theme: 'dark',
        language: 'en',
        notificationsEnabled: true,
      };
      
      const mockUpdatedPrefs = {
        id: 'pref-id-1',
        userId: 'user-id-1',
        theme: 'light',
        language: 'fr',
        notificationsEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      prisma.userPreferences.findUnique.mockResolvedValue(mockExistingPrefs);
      prisma.userPreferences.update.mockResolvedValue(mockUpdatedPrefs);

      // Act
      const result = await service.updateUserPreferences('user-id-1', updatePrefsDto);

      // Assert
      expect(result).toEqual(mockUpdatedPrefs);
      expect(prisma.userPreferences.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-id-1' },
      });
      expect(prisma.userPreferences.update).toHaveBeenCalledWith({
        where: { userId: 'user-id-1' },
        data: updatePrefsDto,
      });
    });

    it('should create preferences if they do not exist', async () => {
      // Arrange
      const updatePrefsDto = {
        theme: 'light',
        language: 'fr',
        notificationsEnabled: false,
      };
      
      const mockCreatedPrefs = {
        id: 'new-pref-id',
        userId: 'user-id-1',
        theme: 'light',
        language: 'fr',
        notificationsEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      prisma.userPreferences.findUnique.mockResolvedValue(null); // No existing preferences
      prisma.userPreferences.create.mockResolvedValue(mockCreatedPrefs);

      // Act
      const result = await service.updateUserPreferences('user-id-1', updatePrefsDto);

      // Assert
      expect(result).toEqual(mockCreatedPrefs);
      expect(prisma.userPreferences.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-id-1' },
      });
      expect(prisma.userPreferences.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-id-1',
          ...updatePrefsDto,
        },
      });
    });
  });

  describe('getLikedSongs', () => {
    it('should return a paginated list of liked songs', async () => {
      // Arrange
      const mockLikedSongs = [
        {
          songId: 'song-id-1',
          createdAt: new Date(),
          song: {
            id: 'song-id-1',
            title: 'Liked Song 1',
            artistId: 'artist-id-1',
            artist: {
              id: 'artist-id-1',
              name: 'Artist 1',
            },
          },
        },
        {
          songId: 'song-id-2',
          createdAt: new Date(),
          song: {
            id: 'song-id-2',
            title: 'Liked Song 2',
            artistId: 'artist-id-2',
            artist: {
              id: 'artist-id-2',
              name: 'Artist 2',
            },
          },
        },
      ];
      
      prisma.songLike.findMany.mockResolvedValue(mockLikedSongs);
      prisma.songLike.count.mockResolvedValue(2);

      // Act
      const result = await service.getLikedSongs('user-id-1', { page: 1, limit: 10 });

      // Assert
      expect(result.data).toEqual(mockLikedSongs.map(like => like.song));
      expect(result.meta).toEqual({
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });
      expect(prisma.songLike.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-id-1' },
        include: { song: { include: { artist: true } } },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(prisma.songLike.count).toHaveBeenCalledWith({
        where: { userId: 'user-id-1' },
      });
    });

    it('should return empty array when no liked songs', async () => {
      // Arrange
      prisma.songLike.findMany.mockResolvedValue([]);
      prisma.songLike.count.mockResolvedValue(0);

      // Act
      const result = await service.getLikedSongs('user-id-1', { page: 1, limit: 10 });

      // Assert
      expect(result.data).toEqual([]);
      expect(result.meta).toEqual({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      });
    });
  });

  describe('getLikedArtists', () => {
    it('should return a paginated list of liked artists', async () => {
      // Arrange
      const mockLikedArtists = [
        {
          artistId: 'artist-id-1',
          createdAt: new Date(),
          artist: {
            id: 'artist-id-1',
            name: 'Liked Artist 1',
          },
        },
        {
          artistId: 'artist-id-2',
          createdAt: new Date(),
          artist: {
            id: 'artist-id-2',
            name: 'Liked Artist 2',
          },
        },
      ];
      
      prisma.artistLike.findMany.mockResolvedValue(mockLikedArtists);
      prisma.artistLike.count.mockResolvedValue(2);

      // Act
      const result = await service.getLikedArtists('user-id-1', { page: 1, limit: 10 });

      // Assert
      expect(result.data).toEqual(mockLikedArtists.map(like => like.artist));
      expect(result.meta).toEqual({
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });
      expect(prisma.artistLike.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-id-1' },
        include: { artist: true },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(prisma.artistLike.count).toHaveBeenCalledWith({
        where: { userId: 'user-id-1' },
      });
    });
  });

  describe('getUserPlaylists', () => {
    it('should return a list of user playlists', async () => {
      // Arrange
      const mockPlaylists = [
        {
          id: 'playlist-id-1',
          name: 'My Playlist 1',
          userId: 'user-id-1',
          isPublic: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { songs: 5 },
        },
        {
          id: 'playlist-id-2',
          name: 'My Playlist 2',
          userId: 'user-id-1',
          isPublic: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { songs: 3 },
        },
      ];
      
      prisma.playlist.findMany.mockResolvedValue(mockPlaylists);
      prisma.playlist.count.mockResolvedValue(2);

      // Act
      const result = await service.getUserPlaylists('user-id-1', { page: 1, limit: 10 });

      // Assert
      expect(result.data).toEqual(mockPlaylists);
      expect(result.meta).toEqual({
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });
      expect(prisma.playlist.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-id-1' },
        skip: 0,
        take: 10,
        orderBy: { updatedAt: 'desc' },
        include: expect.any(Object),
      });
    });
  });
});