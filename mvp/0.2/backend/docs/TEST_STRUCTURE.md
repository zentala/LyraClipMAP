# Test Structure Analysis

## Global Test Setup
- Location: `backend/src/tests/`
- Key Files:
  - `jest.setup.ts`: Global test configuration
  - `test-helpers.ts`: Common test utilities
  - `db-test.helper.ts`: Database testing utilities
  - `auth-test.helper.ts`: Authentication testing utilities
  - `test-logger.ts`: Logging configuration for tests
  - `db-cleanup-order.ts`: Database cleanup sequence

## Test Flow Analysis

### 1. Authentication Tests (`/auth/tests/`)
- **auth.service.spec.ts**
  - Flow:
    1. Register user tests
    2. Login tests
    3. Token refresh tests
  - Dependencies: PrismaService, JwtService
  - Data Lifecycle: Creates test users → Validates auth → Cleans up

- **auth.guard.spec.ts**
  - Flow: Tests JwtAuthGuard functionality
  - Dependencies: JwtService
  - Critical for: All protected routes

### 2. User Tests (`/users/tests/`)
- **users.module.spec.ts**
  - Flow: Tests module configuration
  - Dependencies: PrismaService
  - Validates: Service providers and module imports

- **users.controller.spec.ts**
  - Flow:
    1. Create user tests
    2. Query user tests
    3. Update user tests
    4. Delete user tests
  - Dependencies: UsersService, AuthService

### 3. Artist Tests (`/artists/tests/`)
- **artists.integration.spec.ts**
  - Flow:
    1. Create artist
    2. Query artist details
    3. Update artist
    4. Delete artist
  - Dependencies: ArtistsService, PrismaService
  - Note: Requires proper cleanup of created records

### 4. Songs Tests (`/songs/tests/`)
- **songs.integration.spec.ts**
  - Flow:
    1. Create song with artist reference
    2. Add lyrics
    3. Update song metadata
    4. Delete song
  - Dependencies: SongsService, ArtistsService, LyricsService

### 5. Playlist Tests (`/playlists/tests/`)
- **playlists.e2e.spec.ts**
  - Flow:
    1. Create playlist
    2. Add songs to playlist
    3. Remove songs from playlist
    4. Delete playlist
  - Dependencies: PlaylistsService, SongsService, UsersService
  - Authentication: Requires JwtAuthGuard

### 6. Entity Relationships (`/tests/entity-relationships.spec.ts`)
- Tests all entity relationships and cascading operations
- Critical for maintaining data integrity
- Flow:
  1. Create all required entities
  2. Test relationships
  3. Test cascade deletes
  4. Cleanup in correct order

## Common Issues Identified

1. **Data Cleanup Order**
   - Problem: Tests failing due to incorrect cleanup order
   - Solution: Follow `db-cleanup-order.ts` sequence strictly

2. **Authentication Context**
   - Problem: JwtAuthGuard issues in PlaylistsModule
   - Impact: Affects all authenticated endpoint tests
   - Required Fix: Proper JWT module configuration in test environment

3. **Test Data Management**
   - Problem: Attempting to delete non-existent records
   - Solution: Ensure test data creation before deletion tests
   - Implementation: Use `testHelpers` consistently

## Recommendations

1. **Test Data Creation**
   - Always create test data at the beginning of test suites
   - Use `beforeAll` for setup when possible
   - Implement proper cleanup in `afterAll`

2. **Authentication Setup**
   - Configure JWT module in test environment
   - Use mock authentication where appropriate
   - Maintain consistent auth state across tests

3. **Database Operations**
   - Follow strict order in `db-cleanup-order.ts`
   - Implement proper cascade delete handling
   - Verify record existence before deletion

4. **Test Independence**
   - Each test should create its own data
   - Don't rely on data from other tests
   - Clean up all created data

## Next Steps

1. Fix JwtAuthGuard configuration in PlaylistsModule tests
2. Implement proper test data cleanup sequence
3. Add verification steps before deletion operations
4. Update entity relationship tests to handle cascading properly

## Identified Critical Issues

### 1. Database Cleanup Order Mismatch
```typescript
// db-cleanup-order.ts
const CLEANUP_ORDER = [
  'PlaylistSong',
  'PlaylistShare',
  'Playlist',
  'SongTag',
  // ...
];

// db-test.helper.ts
const tables = [
  'SongTag',
  'Tag',
  'PlaylistSong',
  // ...
];
```
Problem: Inconsistent cleanup order between files can cause foreign key constraint violations.

### 2. JwtAuthGuard Configuration
```typescript
// Current configuration in playlists.e2e.spec.ts
JwtModule.register({
  secret: process.env.JWT_SECRET || 'test-secret',
  signOptions: { expiresIn: '1h' },
})
```
Missing proper JWT configuration and test environment setup.

### 3. Test Data Management Issues
```typescript
// Example of problematic test
it('should remove songs from a playlist', async () => {
  // Creates new data without checking existing state
  const playlist = await prisma.playlist.create({...});
  
  // Attempts deletion without verification
  await request(app.getHttpServer())
    .delete(`/playlists/${playlist.id}/songs/${testHelpers.song.id}`)
    .expect(204);
});
```

## Required Fixes

### 1. Standardize Database Cleanup
```typescript
// Proposed update for db-test.helper.ts
async resetDatabase() {
  const tables = CLEANUP_ORDER; // Use single source of truth
  for (const table of tables) {
    try {
      await this.prisma.$executeRawUnsafe(
        `DELETE FROM "public"."${table}" WHERE 1=1`
      );
      await this.verifyTableEmpty(table);
    } catch (error) {
      TestLogger.error(`Failed to clear table ${table}`, error);
      throw error; // Fail fast on cleanup errors
    }
  }
}
```

### 2. Improve JWT Test Configuration
```typescript
// Proposed test module configuration
const moduleFixture: TestingModule = await Test.createTestingModule({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => ({
        jwt: {
          secret: 'test-secret',
          expiresIn: '1h'
        }
      })]
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: { 
          expiresIn: configService.get('jwt.expiresIn')
        }
      }),
      inject: [ConfigService]
    })
  ]
}).compile();
```

### 3. Robust Test Data Management
```typescript
// Proposed test helper methods
async ensureTestData() {
  await this.cleanupExistingData();
  const testData = await this.createRequiredTestData();
  await this.verifyTestDataCreated(testData);
  return testData;
}

async cleanupExistingData() {
  // Verify and clean existing data
  await this.verifyDatabaseState();
  await this.resetDatabase();
  await this.verifyDatabaseState();
}

async verifyTestDataCreated(data: TestData) {
  // Verify all required test data exists
  for (const [key, value] of Object.entries(data)) {
    if (!value) {
      throw new Error(`Failed to create test data: ${key}`);
    }
  }
}
```

## Test Flow Guidelines

1. **Before Each Test Suite**
   ```typescript
   beforeAll(async () => {
     await testHelpers.cleanupExistingData();
     testData = await testHelpers.ensureTestData();
   });
   ```

2. **After Each Test Suite**
   ```typescript
   afterAll(async () => {
     await testHelpers.verifyDatabaseState();
     await testHelpers.resetDatabase();
     await app.close();
   });
   ```

3. **Individual Tests**
   ```typescript
   it('should perform operation', async () => {
     // 1. Verify prerequisites
     await verifyTestDataExists();
     
     // 2. Perform test operation
     const result = await performOperation();
     
     // 3. Verify results
     expect(result).toBeDefined();
     
     // 4. Cleanup test-specific data
     await cleanupTestData();
   });
   ```

## Implementation Priority

1. Fix database cleanup order inconsistency
2. Implement proper JWT configuration for tests
3. Add data verification steps in test helpers
4. Update all test suites to follow new guidelines

## Success Criteria

- All tests pass consistently in multiple runs
- No database constraint violations
- No authentication errors in protected routes
- Clean database state after each test suite
- Proper error handling for all operations 