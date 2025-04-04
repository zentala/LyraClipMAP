# LyraClipMAP Test Architecture

This document outlines the test architecture for the LyraClipMAP backend API.

## Test Structure

The test suite is organized into the following categories:

```
/test
├── jest-e2e.json                 # E2E test configuration
├── jest-config.json              # Unit test configuration
├── fixtures/                     # Test fixtures and mock data
│   ├── songs.fixture.ts
│   ├── users.fixture.ts
│   └── ...
├── mocks/                        # Mock implementations
│   ├── spotify.service.mock.ts
│   ├── lyrics.service.mock.ts
│   └── ...
├── utils/                        # Test utilities
│   ├── test-database.ts          # Test database setup
│   ├── auth-helper.ts            # Authentication helper
│   └── ...
├── unit/                         # Unit tests
│   ├── songs/
│   │   ├── songs.service.spec.ts
│   │   ├── songs.controller.spec.ts
│   │   └── ...
│   ├── auth/
│   │   ├── auth.service.spec.ts
│   │   └── ...
│   └── ...
└── e2e/                          # E2E tests
    ├── songs.e2e-spec.ts
    ├── auth.e2e-spec.ts
    └── ...
```

## Test Types

### Unit Tests
- Tests individual components in isolation
- Mocks external dependencies
- Focus on business logic and edge cases

### Integration Tests
- Tests interactions between components
- Uses in-memory test database
- Verifies correct data flow

### E2E Tests
- Tests complete API endpoints
- Uses test database
- Simulates actual client-server interaction

## Key Testing Patterns

### Service Tests
- Test business logic
- Verify calculations and transformations
- Test error handling

### Controller Tests
- Test input validation
- Verify authorization checks
- Test response formats and status codes

### Repository Tests
- Test database interactions
- Verify correct query execution
- Test transactions and rollbacks

## Testing External Integrations

### Spotify API
- Mock external Spotify API responses
- Test error handling for API failures
- Verify correct parsing of responses

### Lyrics Services
- Mock web scraping responses
- Test fallback mechanisms
- Verify correct extraction of content

## Setup and Teardown

### Database
- Use an in-memory SQLite database for tests
- Reset database between test suites
- Seed test data for consistent tests

### Authentication
- Create test users with predefined roles
- Generate test JWT tokens for authenticated routes
- Test permission checks

## Coverage Targets

- 80%+ code coverage for unit tests
- 70%+ code coverage for integration tests
- Key API endpoints covered by E2E tests

## Running Tests

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e

# Watch mode for development
npm run test:watch
```

## Test Examples

### Unit Test Example (Service)

```typescript
describe('SongsService', () => {
  let service: SongsService;
  let prismaService: MockPrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SongsService,
        { provide: PrismaService, useClass: MockPrismaService },
      ],
    }).compile();

    service = module.get(SongsService);
    prismaService = module.get(PrismaService);
  });

  describe('findAll', () => {
    it('should return paginated songs', async () => {
      const params = { page: 1, limit: 10 };
      const mockSongs = [{ id: '1', title: 'Test Song' }];
      prismaService.song.findMany.mockResolvedValue(mockSongs);
      prismaService.song.count.mockResolvedValue(1);

      const result = await service.findAll(params);

      expect(result.data).toEqual(mockSongs);
      expect(result.meta.total).toEqual(1);
    });
  });
});
```

### E2E Test Example

```typescript
describe('Songs API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    
    prisma = app.get(PrismaService);
    
    // Setup test data and auth token
    await setupTestDatabase(prisma);
    authToken = await getAuthToken(app);
  });

  afterAll(async () => {
    await cleanupTestDatabase(prisma);
    await app.close();
  });

  it('/api/songs (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/songs')
      .expect(200)
      .expect(res => {
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.meta).toBeDefined();
      });
  });

  it('/api/songs (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/songs')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'New Test Song',
        artistId: 'existing-artist-id'
      })
      .expect(201)
      .expect(res => {
        expect(res.body.id).toBeDefined();
        expect(res.body.title).toEqual('New Test Song');
      });
  });
});
```

## Mock Strategy

1. External APIs: Use Jest mock functions for external services
2. Database: Use testing transaction for isolation
3. File System: Use in-memory virtual file system
4. Time-dependent functions: Use Jest's timer mocks

## Test Environment Variables

Create a `.env.test` file for test-specific configuration:

```
DATABASE_URL="file:./test.db"
JWT_SECRET="test-secret-key"
SPOTIFY_API_KEY="test-spotify-key"
```