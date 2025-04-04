/**
 * Setup file for E2E tests - runs before all tests
 */

// Increase timeout for all tests
jest.setTimeout(20000);

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:./test.db';
process.env.JWT_SECRET = 'e2e-test-secret-key';
process.env.JWT_EXPIRATION = '1h';
process.env.JWT_REFRESH_EXPIRATION = '7d';

// Mock external services as needed
jest.mock('../../../server/src/spotify/spotify.service', () => {
  return {
    SpotifyService: jest.fn().mockImplementation(() => ({
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
    })),
  };
});

// Global beforeAll hook
beforeAll(async () => {
  console.log('Starting E2E tests...');
});

// Global afterAll hook
afterAll(async () => {
  console.log('E2E tests completed.');
});