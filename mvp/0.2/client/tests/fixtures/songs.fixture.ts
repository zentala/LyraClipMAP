/**
 * Fixtures for song-related tests
 */
export const songFixtures = {
  /**
   * Valid create song DTO
   */
  validCreateSongDto: {
    title: 'Test Song',
    artistId: 'artist-id', // Will be replaced with actual ID in tests
    description: 'A test song for unit tests',
    thumbnailUrl: 'https://example.com/thumbnail.jpg',
    audioSources: [
      {
        url: 'https://youtube.com/watch?v=test123',
        sourceType: 'YOUTUBE',
        isMain: true
      }
    ]
  },

  /**
   * Valid update song DTO
   */
  validUpdateSongDto: {
    title: 'Updated Song Title',
    description: 'Updated description for tests',
    thumbnailUrl: 'https://example.com/updated-thumbnail.jpg'
  },

  /**
   * Sample song data for mock responses
   */
  sampleSong: {
    id: 'song-id-1',
    title: 'Sample Song',
    artistId: 'artist-id-1',
    description: 'Sample song description',
    thumbnailUrl: 'https://example.com/sample.jpg',
    duration: 180,
    createdAt: new Date('2023-01-01T12:00:00Z'),
    updatedAt: new Date('2023-01-01T12:00:00Z'),
    createdById: 'user-id-1',
    artist: {
      id: 'artist-id-1',
      name: 'Sample Artist',
      imageUrl: 'https://example.com/artist.jpg'
    },
    audioSources: [
      {
        id: 'audio-source-id-1',
        songId: 'song-id-1',
        url: 'https://youtube.com/watch?v=sample123',
        sourceType: 'YOUTUBE',
        isMain: true,
        createdAt: new Date('2023-01-01T12:00:00Z'),
        updatedAt: new Date('2023-01-01T12:00:00Z')
      }
    ],
    textContents: [
      {
        id: 'text-content-id-1',
        songId: 'song-id-1',
        contentType: 'LYRICS',
        content: 'Sample lyrics content\nSecond line',
        language: 'EN',
        createdAt: new Date('2023-01-01T12:00:00Z'),
        updatedAt: new Date('2023-01-01T12:00:00Z')
      }
    ]
  },

  /**
   * Sample audio sources for tests
   */
  audioSources: [
    {
      url: 'https://youtube.com/watch?v=youtube123',
      sourceType: 'YOUTUBE',
      isMain: true
    },
    {
      url: 'spotify:track:spotifyId123',
      sourceType: 'SPOTIFY',
      isMain: false
    },
    {
      url: 'https://soundcloud.com/track/soundcloud123',
      sourceType: 'SOUNDCLOUD',
      isMain: false
    }
  ],

  /**
   * Sample text contents for tests
   */
  textContents: [
    {
      contentType: 'LYRICS',
      content: 'These are the lyrics\nSecond line\nThird line',
      language: 'EN'
    },
    {
      contentType: 'LYRICS_TRANSLATION',
      content: 'Voici les paroles\nDeuxième ligne\nTroisième ligne',
      language: 'FR'
    }
  ],

  /**
   * Sample word timestamps for tests
   */
  wordTimestamps: [
    { word: 'These', timestamp: 1.0 },
    { word: 'are', timestamp: 1.2 },
    { word: 'the', timestamp: 1.4 },
    { word: 'lyrics', timestamp: 1.8 },
    { word: 'Second', timestamp: 5.0 },
    { word: 'line', timestamp: 5.5 },
    { word: 'Third', timestamp: 10.0 },
    { word: 'line', timestamp: 10.5 }
  ],

  /**
   * Sample paginated response
   */
  paginatedSongs: {
    data: [
      {
        id: 'song-id-1',
        title: 'Sample Song 1',
        artistId: 'artist-id-1',
        artist: {
          id: 'artist-id-1',
          name: 'Sample Artist'
        }
      },
      {
        id: 'song-id-2',
        title: 'Sample Song 2',
        artistId: 'artist-id-2',
        artist: {
          id: 'artist-id-2',
          name: 'Another Artist'
        }
      }
    ],
    meta: {
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false
    }
  }
};