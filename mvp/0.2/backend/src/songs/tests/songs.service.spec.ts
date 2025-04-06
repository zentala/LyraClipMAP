import { Test, TestingModule } from '@nestjs/testing';
import { SongsService } from '../songs.service';
import { PrismaService } from '../../prisma/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { CreateSongDto } from '../dto/create-song.dto';
import { NotFoundException } from '@nestjs/common';
import { Artist, Lyrics, Song, Prisma } from '@prisma/client';

describe('SongsService', () => {
  let service: SongsService;
  let prismaService: DeepMockProxy<PrismaService>;

  const mockArtist: Artist = {
    id: 1,
    name: 'Test Artist',
    bio: 'Test bio',
    imageUrl: 'https://example.com/artist.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLyrics: Lyrics = {
    id: 1,
    text: 'Test lyrics',
    language: 'en',
    sourceUrl: 'https://example.com/lyrics',
    timestamps: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSongWithRelations: Prisma.SongGetPayload<{
    include: { artist: true; lyrics: true };
  }> = {
    id: 1,
    title: 'Test Song',
    artistId: 1,
    duration: 180,
    audioUrl: 'https://example.com/song.mp3',
    lyricsId: 1,
    genre: 'pop',
    releaseYear: 2024,
    createdAt: new Date(),
    updatedAt: new Date(),
    artist: mockArtist,
    lyrics: mockLyrics,
  };

  beforeEach(async () => {
    prismaService = mockDeep<PrismaService>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SongsService,
        {
          provide: PrismaService,
          useValue: prismaService,
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
        genre: 'pop',
        releaseYear: 2024,
      };

      prismaService.artist.findUnique.mockResolvedValue(mockArtist);
      prismaService.lyrics.findUnique.mockResolvedValue(mockLyrics);
      prismaService.song.create.mockResolvedValue(mockSongWithRelations);

      const result = await service.create(createSongDto);
      expect(result).toEqual(mockSongWithRelations);
      expect(prismaService.artist.findUnique).toHaveBeenCalledWith({
        where: { id: createSongDto.artistId },
      });
      expect(prismaService.song.create).toHaveBeenCalledWith({
        data: createSongDto,
        include: {
          artist: true,
          lyrics: true,
        },
      });
    });

    it('should throw NotFoundException when artist does not exist', async () => {
      const createSongDto: CreateSongDto = {
        title: 'Test Song',
        artistId: 1,
        duration: 180,
        audioUrl: 'https://example.com/song.mp3',
        lyricsId: 1,
        genre: 'pop',
        releaseYear: 2024,
      };

      prismaService.artist.findUnique.mockResolvedValue(null);

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
        genre: 'pop',
        releaseYear: 2024,
      };

      prismaService.artist.findUnique.mockResolvedValue(mockArtist);
      prismaService.lyrics.findUnique.mockResolvedValue(null);

      await expect(service.create(createSongDto)).rejects.toThrow(
        new NotFoundException(`Lyrics with ID ${createSongDto.lyricsId} not found`),
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of songs', async () => {
      prismaService.song.findMany.mockResolvedValue([mockSongWithRelations]);

      const result = await service.findAll();
      expect(result).toEqual([mockSongWithRelations]);
      expect(prismaService.song.findMany).toHaveBeenCalledWith({
        include: {
          artist: true,
          lyrics: true,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a song by id', async () => {
      prismaService.song.findUnique.mockResolvedValue(mockSongWithRelations);

      const result = await service.findOne(1);
      expect(result).toEqual(mockSongWithRelations);
      expect(prismaService.song.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          artist: true,
          lyrics: true,
        },
      });
    });

    it('should throw NotFoundException when song does not exist', async () => {
      prismaService.song.findUnique.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(
        new NotFoundException('Song with ID 1 not found'),
      );
    });
  });

  describe('update', () => {
    const updateSongDto = {
      title: 'Updated Song',
      genre: 'rock',
      releaseYear: 2024,
    };

    it('should update a song when it exists', async () => {
      prismaService.song.findUnique.mockResolvedValue(mockSongWithRelations);
      prismaService.song.update.mockResolvedValue({
        ...mockSongWithRelations,
        ...updateSongDto,
      });

      const result = await service.update(1, updateSongDto);
      expect(result).toEqual({
        ...mockSongWithRelations,
        ...updateSongDto,
      });
      expect(prismaService.song.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateSongDto,
        include: {
          artist: true,
          lyrics: true,
        },
      });
    });

    it('should throw NotFoundException when song does not exist', async () => {
      prismaService.song.findUnique.mockResolvedValue(null);

      await expect(service.update(1, updateSongDto)).rejects.toThrow(
        new NotFoundException('Song with ID 1 not found'),
      );
    });
  });

  describe('remove', () => {
    it('should remove a song when it exists', async () => {
      prismaService.song.findUnique.mockResolvedValue(mockSongWithRelations);
      prismaService.song.delete.mockResolvedValue(mockSongWithRelations);

      const result = await service.remove(1);
      expect(result).toEqual(mockSongWithRelations);
      expect(prismaService.song.delete).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          artist: true,
          lyrics: true,
        },
      });
    });

    it('should throw NotFoundException when song does not exist', async () => {
      prismaService.song.findUnique.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(
        new NotFoundException('Song with ID 1 not found'),
      );
    });
  });

  describe('findByArtist', () => {
    it('should return songs when artist exists', async () => {
      const mockSongs = [
        {
          id: 1,
          title: 'Song 1',
          artistId: 1,
          duration: 180,
          audioUrl: 'https://example.com/song1.mp3',
          lyricsId: 1,
          genre: 'pop',
          releaseYear: 2024,
          createdAt: new Date(),
          updatedAt: new Date(),
          artist: mockArtist,
          lyrics: mockLyrics,
        },
        {
          id: 2,
          title: 'Song 2',
          artistId: 1,
          duration: 240,
          audioUrl: 'https://example.com/song2.mp3',
          lyricsId: 2,
          genre: 'rock',
          releaseYear: 2024,
          createdAt: new Date(),
          updatedAt: new Date(),
          artist: mockArtist,
          lyrics: mockLyrics,
        },
      ];

      prismaService.artist.findUnique.mockResolvedValue(mockArtist);
      prismaService.song.findMany.mockResolvedValue(mockSongs);

      const result = await service.findByArtist(1);

      expect(result).toEqual(mockSongs);
      expect(prismaService.artist.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prismaService.song.findMany).toHaveBeenCalledWith({
        where: { artistId: 1 },
        include: {
          artist: true,
          lyrics: true,
        },
      });
    });

    it('should throw NotFoundException when artist does not exist', async () => {
      prismaService.artist.findUnique.mockResolvedValue(null);

      await expect(service.findByArtist(1)).rejects.toThrow(
        new NotFoundException('Artist with ID 1 not found'),
      );
    });
  });
}); 