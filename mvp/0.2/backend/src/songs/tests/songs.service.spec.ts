import { Test, TestingModule } from '@nestjs/testing';
import { SongsService } from '../songs.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSongDto } from '../dto/create-song.dto';
import { UpdateSongDto } from '../dto/update-song.dto';
import { NotFoundException } from '@nestjs/common';
import { Artist, Lyrics, Song } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

describe('SongsService', () => {
  let service: SongsService;
  let mockPrismaService: DeepMockProxy<PrismaService>;

  const mockSong: Song = {
    id: 1,
    title: 'Test Song',
    artistId: 1,
    duration: 180,
    audioUrl: 'https://example.com/song.mp3',
    lyricsId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockArtist: Artist = {
    id: 1,
    name: 'Test Artist',
    bio: null,
    imageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLyrics: Lyrics = {
    id: 1,
    content: 'Test lyrics',
    lrc: null,
    timestamps: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockPrismaService = mockDeep<PrismaService>();
    mockPrismaService.$transaction.mockImplementation(callback => callback(mockPrismaService));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SongsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SongsService>(SongsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a song when artist and lyrics exist', async () => {
      const createSongDto: CreateSongDto = {
        title: 'Test Song',
        artistId: 1,
        duration: 180,
        audioUrl: 'https://example.com/song.mp3',
        lyricsId: 1,
      };

      mockPrismaService.artist.findUnique.mockResolvedValue(mockArtist);
      mockPrismaService.lyrics.findUnique.mockResolvedValue(mockLyrics);
      mockPrismaService.song.create.mockResolvedValue(mockSong);

      const result = await service.create(createSongDto);
      expect(result).toEqual(mockSong);
      expect(mockPrismaService.artist.findUnique).toHaveBeenCalledWith({
        where: { id: createSongDto.artistId },
      });
      expect(mockPrismaService.song.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when artist does not exist', async () => {
      const createSongDto: CreateSongDto = {
        title: 'Test Song',
        artistId: 1,
        duration: 180,
        audioUrl: 'https://example.com/song.mp3',
      };

      mockPrismaService.artist.findUnique.mockResolvedValue(null);

      await expect(service.create(createSongDto)).rejects.toThrow(
        new NotFoundException(`Artist with ID ${createSongDto.artistId} not found`),
      );
    });

    it('should throw NotFoundException when lyrics does not exist', async () => {
      const createSongDto: CreateSongDto = {
        title: 'Test Song',
        artistId: 1,
        duration: 180,
        audioUrl: 'https://example.com/song.mp3',
        lyricsId: 1,
      };

      mockPrismaService.artist.findUnique.mockResolvedValue(mockArtist);
      mockPrismaService.lyrics.findUnique.mockResolvedValue(null);

      await expect(service.create(createSongDto)).rejects.toThrow(
        new NotFoundException(`Lyrics with ID ${createSongDto.lyricsId} not found`),
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of songs', async () => {
      mockPrismaService.song.findMany.mockResolvedValue([mockSong]);

      const result = await service.findAll();
      expect(result).toEqual([mockSong]);
      expect(mockPrismaService.song.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a song by id', async () => {
      mockPrismaService.song.findUnique.mockResolvedValue(mockSong);

      const result = await service.findOne(1);
      expect(result).toEqual(mockSong);
      expect(mockPrismaService.song.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          artist: true,
          lyrics: true,
        },
      });
    });

    it('should throw NotFoundException when song does not exist', async () => {
      mockPrismaService.song.findUnique.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(
        new NotFoundException('Song with ID 1 not found'),
      );
    });
  });

  describe('update', () => {
    const updateSongDto: UpdateSongDto = {
      title: 'Updated Song',
      artistId: 2,
      lyricsId: 2,
    };

    it('should update a song when it exists', async () => {
      mockPrismaService.song.findUnique.mockResolvedValue(mockSong);
      mockPrismaService.artist.findUnique.mockResolvedValue(mockArtist);
      mockPrismaService.lyrics.findUnique.mockResolvedValue(mockLyrics);
      mockPrismaService.song.update.mockResolvedValue({
        ...mockSong,
        ...updateSongDto,
      });

      const result = await service.update(1, updateSongDto);
      expect(result).toEqual({ ...mockSong, ...updateSongDto });
    });

    it('should throw NotFoundException when song does not exist', async () => {
      mockPrismaService.song.findUnique.mockResolvedValue(null);

      await expect(service.update(1, updateSongDto)).rejects.toThrow(
        new NotFoundException('Song with ID 1 not found'),
      );
    });

    it('should throw NotFoundException when new artist does not exist', async () => {
      mockPrismaService.song.findUnique.mockResolvedValue(mockSong);
      mockPrismaService.artist.findUnique.mockResolvedValue(null);

      await expect(service.update(1, updateSongDto)).rejects.toThrow(
        new NotFoundException(`Artist with ID ${updateSongDto.artistId} not found`),
      );
    });

    it('should throw NotFoundException when new lyrics does not exist', async () => {
      mockPrismaService.song.findUnique.mockResolvedValue(mockSong);
      mockPrismaService.artist.findUnique.mockResolvedValue(mockArtist);
      mockPrismaService.lyrics.findUnique.mockResolvedValue(null);

      await expect(service.update(1, updateSongDto)).rejects.toThrow(
        new NotFoundException(`Lyrics with ID ${updateSongDto.lyricsId} not found`),
      );
    });
  });

  describe('remove', () => {
    it('should remove a song when it exists', async () => {
      mockPrismaService.song.findUnique.mockResolvedValue(mockSong);
      mockPrismaService.song.delete.mockResolvedValue(mockSong);

      const result = await service.remove(1);
      expect(result).toEqual(mockSong);
      expect(mockPrismaService.song.delete).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          artist: true,
          lyrics: true,
        },
      });
    });

    it('should throw NotFoundException when song does not exist', async () => {
      mockPrismaService.song.findUnique.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(
        new NotFoundException('Song with ID 1 not found'),
      );
    });
  });

  describe('findByArtist', () => {
    it('should return songs when artist exists', async () => {
      const songs = [
        {
          id: 1,
          title: 'Song 1',
          artist: { id: 1 },
          lyrics: { id: 1 },
        },
        {
          id: 2,
          title: 'Song 2',
          artist: { id: 1 },
          lyrics: { id: 2 },
        },
      ];

      mockPrismaService.artist.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.song.findMany.mockResolvedValue(songs);

      const result = await service.findByArtist(1);

      expect(result).toEqual(songs);
      expect(mockPrismaService.artist.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrismaService.song.findMany).toHaveBeenCalledWith({
        where: { artistId: 1 },
        include: {
          artist: true,
          lyrics: true,
        },
      });
    });

    it('should throw NotFoundException when artist does not exist', async () => {
      mockPrismaService.artist.findUnique.mockResolvedValue(null);

      await expect(service.findByArtist(1)).rejects.toThrow(
        new NotFoundException('Artist with ID 1 not found'),
      );
    });
  });
}); 