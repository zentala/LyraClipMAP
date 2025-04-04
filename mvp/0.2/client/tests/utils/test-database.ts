import { PrismaService } from '../../../server/src/prisma/prisma.service';

/**
 * Sets up a test database with sample data for testing
 * @param prisma PrismaService instance
 */
export async function setupTestDatabase(prisma: PrismaService) {
  // Clean existing data
  await cleanupTestDatabase(prisma);
  
  // Create test user
  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // Password: 'password123'
      name: 'Test User',
    },
  });
  
  // Create test artists
  const artist1 = await prisma.artist.create({
    data: {
      name: 'Artist One',
      imageUrl: 'https://example.com/artist1.jpg',
      createdById: testUser.id,
    },
  });
  
  const artist2 = await prisma.artist.create({
    data: {
      name: 'Artist Two',
      imageUrl: 'https://example.com/artist2.jpg',
      createdById: testUser.id,
    },
  });
  
  // Create test songs
  const song1 = await prisma.song.create({
    data: {
      title: 'Song One',
      artistId: artist1.id,
      description: 'This is the first test song',
      thumbnailUrl: 'https://example.com/song1.jpg',
      createdById: testUser.id,
      audioSources: {
        create: {
          url: 'https://youtube.com/watch?v=abc123',
          sourceType: 'YOUTUBE',
          isMain: true,
        },
      },
      textContents: {
        create: {
          contentType: 'LYRICS',
          content: 'These are the lyrics for song one\nSecond line of lyrics',
          language: 'EN',
        },
      },
    },
  });
  
  const song2 = await prisma.song.create({
    data: {
      title: 'Song Two',
      artistId: artist2.id,
      description: 'This is the second test song',
      thumbnailUrl: 'https://example.com/song2.jpg',
      createdById: testUser.id,
      audioSources: {
        create: {
          url: 'https://youtube.com/watch?v=def456',
          sourceType: 'YOUTUBE',
          isMain: true,
        },
      },
    },
  });
  
  // Create tags
  const tag1 = await prisma.tag.create({
    data: {
      name: 'rock',
      category: 'GENRE',
    },
  });
  
  const tag2 = await prisma.tag.create({
    data: {
      name: 'pop',
      category: 'GENRE',
    },
  });
  
  // Add tags to songs
  await prisma.songTag.create({
    data: {
      songId: song1.id,
      tagId: tag1.id,
    },
  });
  
  await prisma.songTag.create({
    data: {
      songId: song2.id,
      tagId: tag2.id,
    },
  });
  
  // Create a playlist
  const playlist = await prisma.playlist.create({
    data: {
      name: 'Test Playlist',
      description: 'A test playlist',
      isPublic: true,
      userId: testUser.id,
      songs: {
        create: [
          { songId: song1.id },
          { songId: song2.id },
        ],
      },
    },
  });
  
  return {
    user: testUser,
    artists: { artist1, artist2 },
    songs: { song1, song2 },
    tags: { tag1, tag2 },
    playlist,
  };
}

/**
 * Cleans up the test database by removing all test data
 * @param prisma PrismaService instance
 */
export async function cleanupTestDatabase(prisma: PrismaService) {
  // Delete data in reverse order of dependencies
  await prisma.songLike.deleteMany();
  await prisma.playlistSong.deleteMany();
  await prisma.playlist.deleteMany();
  await prisma.songTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.wordTimestamp.deleteMany();
  await prisma.textContent.deleteMany();
  await prisma.audioSource.deleteMany();
  await prisma.song.deleteMany();
  await prisma.artist.deleteMany();
  await prisma.user.deleteMany();
}

/**
 * Gets an authentication token for testing
 * @param app NestJS application instance
 * @param email User email (default: test@example.com)
 * @param password User password (default: password123)
 */
export async function getAuthToken(app: any, email = 'test@example.com', password = 'password123') {
  const response = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: {
      email,
      password,
    },
  });
  
  const body = JSON.parse(response.body);
  return body.accessToken;
}

/**
 * Creates a mock for external services like Spotify API
 */
export function createExternalServiceMocks() {
  // Example mock for Spotify API service
  const spotifyServiceMock = {
    searchTracks: jest.fn().mockResolvedValue({
      tracks: [
        {
          id: 'spotify-track-id',
          name: 'Test Track',
          artists: [{ id: 'spotify-artist-id', name: 'Test Artist' }],
          album: { name: 'Test Album', images: [{ url: 'https://example.com/album.jpg' }] },
          duration_ms: 180000,
        },
      ],
    }),
    getTrack: jest.fn().mockResolvedValue({
      id: 'spotify-track-id',
      name: 'Test Track',
      artists: [{ id: 'spotify-artist-id', name: 'Test Artist' }],
      album: { name: 'Test Album', images: [{ url: 'https://example.com/album.jpg' }] },
      duration_ms: 180000,
    }),
    getAudioFeatures: jest.fn().mockResolvedValue({
      id: 'spotify-track-id',
      energy: 0.8,
      tempo: 120,
      valence: 0.6,
    }),
  };

  // Example mock for lyrics service
  const lyricsServiceMock = {
    searchLyrics: jest.fn().mockResolvedValue([
      {
        source: 'test-source',
        url: 'https://example.com/lyrics',
        artist: 'Test Artist',
        title: 'Test Track',
        content: 'Test lyrics content\nSecond line',
        confidence: 0.95,
      },
    ]),
    generateLrc: jest.fn().mockResolvedValue({
      lrcContent: '[00:01.00]Test lyrics content\n[00:05.00]Second line',
      wordTimestamps: [
        { word: 'Test', timestamp: 1.0 },
        { word: 'lyrics', timestamp: 1.5 },
        { word: 'content', timestamp: 2.0 },
        { word: 'Second', timestamp: 5.0 },
        { word: 'line', timestamp: 5.5 },
      ],
    }),
  };

  return {
    spotifyServiceMock,
    lyricsServiceMock,
  };
}