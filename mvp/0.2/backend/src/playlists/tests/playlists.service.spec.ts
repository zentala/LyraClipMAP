import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistsService } from '../playlists.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { PlaylistPermission } from '@prisma/client';

describe('PlaylistsService', () => {
  let service: PlaylistsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    playlist: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    playlistSong: {
      create: jest.fn(),
      createMany: jest.fn(),
      deleteMany: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    song: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    playlistShare: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlaylistsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PlaylistsService>(PlaylistsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a playlist', async () => {
      const userId = 1;
      const createPlaylistDto = {
        name: 'Test Playlist',
        description: 'Test Description',
        isPublic: true,
      };

      const mockUser = {
        id: userId,
        email: 'test@example.com',
        username: 'testuser',
      };

      const mockPlaylist = {
        id: 1,
        ...createPlaylistDto,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.playlist.create.mockResolvedValue(mockPlaylist);

      const result = await service.create(userId, createPlaylistDto);

      expect(result).toEqual(mockPlaylist);
      expect(mockPrismaService.playlist.create).toHaveBeenCalledWith({
        data: {
          ...createPlaylistDto,
          userId,
        },
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const userId = 999;
      const createPlaylistDto = {
        name: 'Test Playlist',
        description: 'Test Description',
        isPublic: true,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.create(userId, createPlaylistDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockPrismaService.playlist.create).not.toHaveBeenCalled();
    });
  });

  describe('findAllByUserId', () => {
    it('should return all playlists for a user', async () => {
      const userId = 1;
      const mockPlaylists = [
        {
          id: 1,
          name: 'Test Playlist 1',
          description: 'Test Description 1',
          isPublic: true,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Test Playlist 2',
          description: 'Test Description 2',
          isPublic: false,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.playlist.findMany.mockResolvedValue(mockPlaylists);

      const result = await service.findAllByUserId(userId);

      expect(result).toEqual(mockPlaylists);
      expect(mockPrismaService.playlist.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: {
          songs: {
            include: {
              song: true,
            },
          },
          shares: true,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a playlist by id', async () => {
      const playlistId = 1;
      const userId = 1;
      const mockPlaylist = { id: playlistId, name: 'Test Playlist', userId };

      mockPrismaService.playlist.findUnique.mockResolvedValue(mockPlaylist);

      const result = await service.findOne(playlistId, userId);

      expect(result).toEqual(mockPlaylist);
      expect(mockPrismaService.playlist.findUnique).toHaveBeenCalledWith({
        where: { id: playlistId, userId },
        include: { 
          songs: true,
          shares: true 
        },
      });
    });

    it('should throw NotFoundException if playlist does not exist', async () => {
      const playlistId = 999;
      const userId = 1;

      mockPrismaService.playlist.findUnique.mockResolvedValue(null);

      await expect(service.findOne(playlistId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a playlist', async () => {
      const playlistId = 1;
      const userId = 1;
      const updatePlaylistDto = {
        name: 'Updated Playlist',
        description: 'Updated Description',
        isPublic: false,
      };

      const mockPlaylist = {
        id: playlistId,
        name: 'Test Playlist',
        description: 'Test Description',
        isPublic: true,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedPlaylist = {
        ...mockPlaylist,
        ...updatePlaylistDto,
      };

      mockPrismaService.playlist.findUnique.mockResolvedValue(mockPlaylist);
      mockPrismaService.playlist.update.mockResolvedValue(updatedPlaylist);

      const result = await service.update(playlistId, userId, updatePlaylistDto);

      expect(result).toEqual(updatedPlaylist);
      expect(mockPrismaService.playlist.update).toHaveBeenCalledWith({
        where: { id: playlistId, userId },
        data: updatePlaylistDto,
      });
    });

    it('should throw NotFoundException if playlist does not exist', async () => {
      const playlistId = 999;
      const userId = 1;
      const updatePlaylistDto = {
        name: 'Updated Playlist',
      };

      mockPrismaService.playlist.findUnique.mockResolvedValue(null);

      await expect(
        service.update(playlistId, userId, updatePlaylistDto),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrismaService.playlist.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a playlist', async () => {
      const playlistId = 1;
      const userId = 1;
      const mockPlaylist = {
        id: playlistId,
        name: 'Test Playlist',
        description: 'Test Description',
        isPublic: true,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.playlist.findUnique.mockResolvedValue(mockPlaylist);
      mockPrismaService.playlist.delete.mockResolvedValue(mockPlaylist);

      await service.remove(playlistId, userId);

      expect(mockPrismaService.playlist.delete).toHaveBeenCalledWith({
        where: { id: playlistId, userId },
      });
    });

    it('should throw NotFoundException if playlist does not exist', async () => {
      const playlistId = 999;
      const userId = 1;

      mockPrismaService.playlist.findUnique.mockResolvedValue(null);

      await expect(service.remove(playlistId, userId)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockPrismaService.playlist.delete).not.toHaveBeenCalled();
    });
  });

  describe('addSong', () => {
    it('should add a song to a playlist', async () => {
      const playlistId = 1;
      const userId = 1;
      const songId = 1;
      const order = 1;

      const mockPlaylist = {
        id: playlistId,
        name: 'Test Playlist',
        description: 'Test Description',
        isPublic: true,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockSong = {
        id: songId,
        title: 'Test Song',
        artistId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPlaylistSong = {
        id: 1,
        playlistId,
        songId,
        order,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.playlist.findUnique.mockResolvedValue(mockPlaylist);
      mockPrismaService.song.findUnique.mockResolvedValue(mockSong);
      mockPrismaService.playlistSong.create.mockResolvedValue(mockPlaylistSong);

      const result = await service.addSong(playlistId, userId, songId, order);

      expect(result).toEqual(mockPlaylistSong);
      expect(mockPrismaService.playlistSong.create).toHaveBeenCalledWith({
        data: {
          playlistId,
          songId,
          order,
        },
      });
    });

    it('should throw NotFoundException if playlist does not exist', async () => {
      const playlistId = 999;
      const userId = 1;
      const songId = 1;
      const order = 1;

      mockPrismaService.playlist.findUnique.mockResolvedValue(null);

      await expect(
        service.addSong(playlistId, userId, songId, order),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrismaService.playlistSong.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if song does not exist', async () => {
      const playlistId = 1;
      const userId = 1;
      const songId = 999;
      const order = 1;

      const mockPlaylist = {
        id: playlistId,
        name: 'Test Playlist',
        description: 'Test Description',
        isPublic: true,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.playlist.findUnique.mockResolvedValue(mockPlaylist);
      mockPrismaService.song.findUnique.mockResolvedValue(null);

      await expect(
        service.addSong(playlistId, userId, songId, order),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrismaService.playlistSong.create).not.toHaveBeenCalled();
    });
  });

  describe('removeSong', () => {
    it('should remove a song from a playlist', async () => {
      const playlistId = 1;
      const userId = 1;
      const songId = 1;

      const mockPlaylist = {
        id: playlistId,
        name: 'Test Playlist',
        description: 'Test Description',
        isPublic: true,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPlaylistSong = {
        id: 1,
        playlistId,
        songId,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.playlist.findUnique.mockResolvedValue(mockPlaylist);
      mockPrismaService.playlistSong.findMany.mockResolvedValue([mockPlaylistSong]);
      mockPrismaService.playlistSong.delete.mockResolvedValue(mockPlaylistSong);

      await service.removeSong(playlistId, userId, songId);

      expect(mockPrismaService.playlistSong.delete).toHaveBeenCalledWith({
        where: {
          playlistId_songId: {
            playlistId,
            songId,
          },
        },
      });
    });

    it('should throw NotFoundException if playlist does not exist', async () => {
      const playlistId = 999;
      const userId = 1;
      const songId = 1;

      mockPrismaService.playlist.findUnique.mockResolvedValue(null);

      await expect(service.removeSong(playlistId, userId, songId)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockPrismaService.playlistSong.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if song is not in playlist', async () => {
      const playlistId = 1;
      const userId = 1;
      const songId = 999;

      const mockPlaylist = {
        id: playlistId,
        name: 'Test Playlist',
        description: 'Test Description',
        isPublic: true,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.playlist.findUnique.mockResolvedValue(mockPlaylist);
      mockPrismaService.playlistSong.findMany.mockResolvedValue([]);

      await expect(service.removeSong(playlistId, userId, songId)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockPrismaService.playlistSong.delete).not.toHaveBeenCalled();
    });
  });
}); 