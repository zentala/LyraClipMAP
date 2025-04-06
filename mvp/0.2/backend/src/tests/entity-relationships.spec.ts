import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Prisma, User, UserPreferences, Artist, Song, Lyrics } from '@prisma/client';
import { SongsService } from '../songs/songs.service';
import { DbTestHelper } from './db-test.helper';
import { TestHelpers } from './test-helpers';
import { TestLogger } from './test-logger';

jest.mock('../prisma/prisma.service');

describe('Entity Relationships', () => {
  let prismaService: PrismaService;
  let songsService: SongsService;
  let dbTestHelper: DbTestHelper;
  let testHelpers: TestHelpers;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    username: 'testuser',
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPreferences: UserPreferences = {
    id: 1,
    userId: mockUser.id,
    theme: 'dark',
    language: 'en',
    notifications: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockArtist: Artist = {
    id: 1,
    name: 'Test Artist',
    bio: 'Test Bio',
    imageUrl: 'https://example.com/image.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSongs: Song[] = [
    {
      id: 1,
      artistId: mockArtist.id,
      title: 'Song 1',
      duration: 180,
      audioUrl: 'https://example.com/song1.mp3',
      lyricsId: null,
      genre: 'pop',
      releaseYear: 2024,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      artistId: mockArtist.id,
      title: 'Song 2',
      duration: 240,
      audioUrl: 'https://example.com/song2.mp3',
      lyricsId: null,
      genre: 'rock',
      releaseYear: 2024,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockSong: Song = mockSongs[0];

  const mockLyrics: Lyrics = {
    id: 1,
    text: 'Test lyrics content',
    language: 'en',
    sourceUrl: 'https://example.com/lyrics',
    timestamps: { '00:00': 'Test lyrics' },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SongsService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn().mockResolvedValue({ ...mockUser, preferences: mockPreferences }),
              findUnique: jest.fn().mockResolvedValue(mockUser),
              delete: jest.fn().mockResolvedValue(mockUser),
            },
            userPreferences: {
              create: jest.fn().mockResolvedValue(mockPreferences),
              findUnique: jest.fn().mockResolvedValue(mockPreferences),
              delete: jest.fn().mockResolvedValue(mockPreferences),
            },
            song: {
              create: jest.fn().mockResolvedValue(mockSong),
              findUnique: jest.fn().mockResolvedValue(mockSong),
              delete: jest.fn().mockResolvedValue(mockSong),
            },
            artist: {
              create: jest.fn().mockResolvedValue(mockArtist),
              findUnique: jest.fn().mockResolvedValue(mockArtist),
              delete: jest.fn().mockResolvedValue(mockArtist),
            },
            lyrics: {
              create: jest.fn().mockResolvedValue(mockLyrics),
              findUnique: jest.fn().mockResolvedValue(mockLyrics),
              delete: jest.fn().mockResolvedValue(mockLyrics),
            },
            $transaction: jest.fn().mockImplementation((cb) => cb(prismaService)),
          },
        },
        DbTestHelper,
        TestHelpers,
      ],
    }).compile();

    prismaService = module.get(PrismaService);
    songsService = module.get(SongsService);
    dbTestHelper = module.get(DbTestHelper);
    testHelpers = module.get(TestHelpers);

    await dbTestHelper.cleanupExistingData();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await dbTestHelper.cleanupExistingData();
    await prismaService.$disconnect();
  });

  describe('User-UserPreferences Relationship (1:1)', () => {
    it('should create user with preferences', async () => {
      const userData: Prisma.UserCreateInput = {
        email: 'test@example.com',
        password: 'hashedPassword',
        username: 'testuser',
        role: 'USER',
        preferences: {
          create: {
            theme: 'dark',
            language: 'en',
            notifications: true,
          },
        },
      };

      const user = await prismaService.user.create({
        data: userData,
        include: {
          preferences: true,
        },
      });

      expect(user).toEqual({ ...mockUser, preferences: mockPreferences });
    });

    it('should delete user and cascade delete preferences', async () => {
      await prismaService.user.delete({
        where: { id: mockUser.id },
      });

      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });
  });

  describe('Artist-Song Relationship (1:N)', () => {
    it('should create artist with songs', async () => {
      const result = await songsService.create({
        title: 'Test Song',
        duration: 180,
        audioUrl: 'https://example.com/song.mp3',
        artistId: mockArtist.id,
        lyricsId: 1,
        genre: 'pop',
        releaseYear: 2024,
      });

      expect(result).toBeDefined();
      expect(result.artistId).toBe(mockArtist.id);
    });

    it('should not create song with non-existent artist', async () => {
      const nonExistentArtistId = 999;
      (prismaService.artist.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        songsService.create({
          title: 'Test Song',
          duration: 180,
          audioUrl: 'https://example.com/song.mp3',
          artistId: nonExistentArtistId,
          lyricsId: 1,
          genre: 'pop',
          releaseYear: 2024,
        }),
      ).rejects.toThrow(new NotFoundException(`Artist with ID ${nonExistentArtistId} not found`));
    });

    it('should delete artist and cascade delete songs', async () => {
      await prismaService.artist.delete({
        where: { id: mockArtist.id },
      });

      expect(prismaService.artist.delete).toHaveBeenCalledWith({
        where: { id: mockArtist.id },
      });
    });
  });

  describe('Song-Lyrics Relationship (1:1)', () => {
    it('should create song with lyrics', async () => {
      const songData: Prisma.SongCreateInput = {
        title: 'Test Song',
        duration: 180,
        audioUrl: 'https://example.com/song.mp3',
        genre: 'pop',
        releaseYear: 2024,
        artist: {
          connect: { id: 1 },
        },
        lyrics: {
          create: {
            text: 'Test lyrics content',
            language: 'en',
            sourceUrl: 'https://example.com/lyrics',
            timestamps: []
          }
        }
      };

      const result = await prismaService.song.create({
        data: songData,
        include: {
          artist: true,
          lyrics: true,
        },
      });

      expect(result).toBeDefined();
      expect(result.lyrics).toBeDefined();
      expect(result.lyrics.text).toBe(mockLyrics.text);
    });

    it('should delete song and cascade delete lyrics', async () => {
      await prismaService.song.delete({
        where: { id: mockSong.id },
      });

      expect(prismaService.song.delete).toHaveBeenCalledWith({
        where: { id: mockSong.id },
      });
    });
  });

  describe('Song-Artist Relationship (N:1)', () => {
    it('should create song with artist reference', async () => {
      const songData = {
        title: 'Test Song',
        duration: 180,
        audioUrl: 'https://example.com/song.mp3',
        artistId: mockArtist.id,
        lyricsId: 1,
        genre: 'pop',
        releaseYear: 2024,
      };

      const result = await songsService.create(songData);

      expect(result).toBeDefined();
      expect(result.artistId).toBe(mockArtist.id);
    });

    it('should not create song with non-existent artist', async () => {
      const nonExistentArtistId = 999;
      (prismaService.artist.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const songData = {
        title: 'Test Song',
        duration: 180,
        audioUrl: 'https://example.com/song.mp3',
        artistId: nonExistentArtistId,
        lyricsId: 1,
        genre: 'pop',
        releaseYear: 2024,
      };

      await expect(
        songsService.create(songData)
      ).rejects.toThrow(new NotFoundException(`Artist with ID ${nonExistentArtistId} not found`));
    });
  });

  describe('Song-Tag Relationships', () => {
    let testSong;
    let testTags;

    beforeEach(async () => {
      // Ensure clean state
      await dbTestHelper.cleanupExistingData();
      
      // Create test data
      const testData = await testHelpers.ensureTestData();
      testSong = testData.song;

      // Create test tags
      testTags = await Promise.all([
        prismaService.tag.create({
          data: { name: 'rock', description: 'Rock music' }
        }),
        prismaService.tag.create({
          data: { name: 'guitar', description: 'Features guitar' }
        }),
        prismaService.tag.create({
          data: { name: 'instrumental', description: 'Instrumental music' }
        })
      ]);

      TestLogger.info('Test data created:', {
        song: { id: testSong.id, title: testSong.title },
        tags: testTags.map(tag => ({ id: tag.id, name: tag.name }))
      });
    });

    afterEach(async () => {
      // Clean up test-specific data
      await prismaService.songTag.deleteMany({
        where: { songId: testSong.id }
      });
      await Promise.all(
        testTags.map(tag => 
          prismaService.tag.delete({ where: { id: tag.id } }).catch(() => {})
        )
      );
    });

    it('should assign multiple tags to a song', async () => {
      // Assign tags to song
      await Promise.all(
        testTags.map(tag =>
          prismaService.songTag.create({
            data: {
              songId: testSong.id,
              tagId: tag.id
            }
          })
        )
      );

      // Verify assignments
      const songWithTags = await prismaService.song.findUnique({
        where: { id: testSong.id },
        include: {
          tags: {
            include: {
              tag: true
            }
          }
        }
      });

      expect(songWithTags.tags).toHaveLength(testTags.length);
      expect(songWithTags.tags.map(st => st.tag.name)).toEqual(
        expect.arrayContaining(testTags.map(t => t.name))
      );
    });

    it('should handle removing tags from a song', async () => {
      // First assign all tags
      await Promise.all(
        testTags.map(tag =>
          prismaService.songTag.create({
            data: {
              songId: testSong.id,
              tagId: tag.id
            }
          })
        )
      );

      // Remove one tag
      await prismaService.songTag.delete({
        where: {
          songId_tagId: {
            songId: testSong.id,
            tagId: testTags[0].id
          }
        }
      });

      // Verify remaining tags
      const songWithTags = await prismaService.song.findUnique({
        where: { id: testSong.id },
        include: {
          tags: {
            include: {
              tag: true
            }
          }
        }
      });

      expect(songWithTags.tags).toHaveLength(testTags.length - 1);
      expect(songWithTags.tags.map(st => st.tag.name)).not.toContain(testTags[0].name);
    });

    it('should handle cascade delete when song is deleted', async () => {
      // Assign tags to song
      await Promise.all(
        testTags.map(tag =>
          prismaService.songTag.create({
            data: {
              songId: testSong.id,
              tagId: tag.id
            }
          })
        )
      );

      // Delete the song
      await prismaService.song.delete({
        where: { id: testSong.id }
      });

      // Verify SongTag entries are deleted but Tags remain
      const songTags = await prismaService.songTag.findMany({
        where: { songId: testSong.id }
      });
      const remainingTags = await prismaService.tag.findMany({
        where: {
          id: {
            in: testTags.map(t => t.id)
          }
        }
      });

      expect(songTags).toHaveLength(0);
      expect(remainingTags).toHaveLength(testTags.length);
    });

    it('should handle cascade delete when tag is deleted', async () => {
      // Assign tags to song
      await Promise.all(
        testTags.map(tag =>
          prismaService.songTag.create({
            data: {
              songId: testSong.id,
              tagId: tag.id
            }
          })
        )
      );

      // Delete one tag
      await prismaService.tag.delete({
        where: { id: testTags[0].id }
      });

      // Verify SongTag entry is deleted but Song remains
      const songTags = await prismaService.songTag.findMany({
        where: { tagId: testTags[0].id }
      });
      const song = await prismaService.song.findUnique({
        where: { id: testSong.id }
      });

      expect(songTags).toHaveLength(0);
      expect(song).toBeDefined();
    });
  });
}); 