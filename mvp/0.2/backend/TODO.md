# Rules

* never change rules. section. never. ever.
* mark task as done, commit, take next task fromtak the list
* in every point / task
* manitain this `TODO.md` as: Groups > Tasks > TODO Actions

## Implementation Order:
1. ✅ Start with Song Creation fix as it affects the main API functionality
2. ✅ Implement Song Deletion error handling
3. ✅ Standardize Entity Relationship error handling

## Notes:
- Each fix should include both implementation and test updates
- Add detailed error logging for debugging
- Update API documentation to reflect error handling
- Consider adding transaction rollback in tests

## Test Repair Plan

## Priority Issues

1. Fix Prisma Transaction Mocking ✅
- [x] Add `$transaction` mock to PrismaService mock in test files
- [x] Update mock implementation to handle transaction callbacks
- [x] Add proper error handling in transaction mocks

2. Fix Authentication in Integration Tests ✅
- [x] Add authentication token to all protected endpoints in tests
- [x] Update test setup to include proper JWT configuration
- [x] Add user token to GET endpoints that require authentication

3. Fix HTTP Response Codes ✅
- [x] Update DELETE endpoint tests to expect 204 No Content
- [x] Update controller to match expected response codes
- [x] Add proper response serialization

4. Fix Error Handling ✅
- [x] Update mock implementations for non-existent records
- [x] Add proper error throwing in service layer
- [x] Update tests to properly handle async errors

## Implementation Steps

1. Update PrismaService mock:
```typescript
{
  $transaction: jest.fn((callback) => callback(prismaService)),
  // ... other mocks
}
```

2. Update integration tests:
```typescript
.set('Authorization', `Bearer ${testData.userToken}`)
```

3. Update controller response codes:
```typescript
@HttpCode(HttpStatus.NO_CONTENT)
```

4. Update error handling:
```typescript
if (!record) throw new NotFoundException();
```

# Test Fixes Plan (2024-03-XX)

## 1. Fix Song Deletion Tests ✅
### Technical Guidelines:
- Review `SongsService.remove()` implementation
- Ensure proper error handling for non-existent records
- Check if `findUnique()` is called before deletion
- Verify exception mapping in the controller layer
- Files to check: 
  - `src/songs/songs.service.ts`
  - `src/songs/songs.controller.ts`
  - `src/tests/media-flow.spec.ts`

## 2. Fix Artist-Song Relationship Tests ✅
### Technical Guidelines:
- Review Prisma schema for Artist-Song relationship
- Verify cascade delete settings
- Check foreign key constraints
- Ensure proper error handling in service layer
- Files to check:
  - `prisma/schema.prisma`
  - `src/songs/songs.service.ts`
  - `src/tests/entity-relationships.spec.ts`

## 3. Fix Song Update Operations ✅
### Technical Guidelines:
- Debug 500 error in update operation
- Check transaction handling
- Verify input validation
- Review error handling middleware
- Files to check:
  - `src/songs/songs.service.ts`
  - `src/songs/dto/update-song.dto.ts`
  - `src/songs/tests/songs.integration.spec.ts`

## 4. Fix Artist ID Related Operations ✅
### Technical Guidelines:
- Review artist ID validation logic
- Check artist-song relationship queries
- Verify error handling for non-existent artists
- Files to check:
  - `src/songs/songs.service.ts`
  - `src/artists/artists.service.ts`
  - `src/songs/tests/songs.integration.spec.ts`

## 5. Fix ID Inconsistencies ✅
### Technical Guidelines:
- Review test data setup
- Check ID generation in test environment
- Verify database seeding process
- Files to check:
  - `src/tests/test-helpers.ts`
  - `prisma/seed.ts`
  - All affected test files

## Implementation Order:
1. ✅ Start with entity relationships (#2) as other issues may depend on this
2. ✅ Fix ID inconsistencies (#5) as this affects all tests
3. ✅ Fix song deletion (#1)
4. ✅ Fix update operations (#3)
5. ✅ Fix artist ID operations (#4)

## Notes:
- Each fix should include updating both implementation and test code
- Add more detailed error logging for debugging
- Consider adding transaction rollback in tests
- Update API documentation after fixes

## Test Fixes (5-8 story points)

1. **Fix AuthModule Configuration in Tests**
   Commit name: `fix(backend): resolve AuthModule dependencies in tests`
   [x] Add ConfigModule to AuthModule imports in test files
   [x] Fix ConfigService dependency injection in AuthService
   [x] Update test setup to properly mock ConfigService
   [x] Verify AuthModule initialization in integration tests
   Rationale: Tests are failing because AuthModule cannot resolve ConfigService dependency, which is required for JWT operations.
   Status: COMPLETED - Added ConfigModule to test imports and fixed dependency injection

2. **Fix Prisma Mock Implementation**
   Commit name: `fix(backend): correct Prisma mock implementation in tests`
   [x] Update Prisma mock to include $queryRaw and $executeRaw methods
   [x] Fix mock implementation in UsersService tests
   [x] Ensure proper mocking of Prisma methods in integration tests
   [x] Update test cleanup to use proper Prisma methods
   Rationale: Tests are failing because Prisma mock is missing $queryRaw and $executeRaw methods, which are used in several services.
   Status: COMPLETED - Added missing methods to Prisma mock and updated tests

3. **Fix Test Expectations**
   Commit name: `fix(backend): correct test expectations in artists and media flow tests`
   [x] Update artists.metadata.spec.ts to properly handle BadRequestException
   [x] Fix media-flow.spec.ts to correctly handle non-existent song deletion
   [x] Ensure proper error handling in service methods
   [x] Update test assertions to match actual service behavior
   Rationale: Several tests are failing because expectations don't match actual service behavior, particularly around error handling.
   Status: COMPLETED - Fixed test expectations and error handling

## Critical Infrastructure Updates (3-5 story points)

1. **Test Database Setup**
   Commit name: `feat(backend): configure test database setup`
   [x] Create test database configuration in .env.test
   [x] Add script to create test database if not exists
   [x] Add script to reset test database before tests
   [x] Update jest.setup.js to use test database
   [x] Add database seeding for tests
   Rationale: Proper test database setup is crucial for reliable and isolated tests. We need to ensure each test runs in a clean environment.
   Status: COMPLETED - Added all necessary scripts and configuration for test database management

## Critical Security Updates (1-2 story points)

1. **Migrate from bcrypt to bcryptjs**
   Commit name: `refactor(backend): migrate from bcrypt to bcryptjs`
   [x] Update package.json to remove bcrypt and add bcryptjs
   [x] Update all imports from 'bcrypt' to 'bcryptjs'
   [x] Update AuthService to use bcryptjs
   [x] Update tests to use bcryptjs mocks
   [x] Verify all auth flows still work correctly
   Rationale: bcryptjs is a pure JavaScript implementation that is more portable and doesn't require native dependencies, making it easier to deploy and maintain.
   Status: COMPLETED - All files were already using bcryptjs, only needed to remove bcrypt from package.json

## Unit Tests (3-5 story points each)

1. **Auth Module Tests**
   [x] Implement unit tests for AuthService
   [x] Test JWT authentication strategy
   [x] Test registration and login flows
   [x] Verify token refresh mechanism

2. **Users Module Tests**
   [x] Implement tests for UserService CRUD operations
   [x] Test user preferences logic
   [x] Validate user-specific permission checks

3. **Lyrics Module Tests**
   [x] Test lyrics search functionality
   [x] Implement tests for LRC generation
   [x] Verify word timestamp mapping

4. **Text Content Tests**
   [x] Test CRUD operations for text content
   [x] Verify language detection
   [x] Test content type validation

5. **Artists Module Tests**
   [x] Test CRUD operations for artists
   [x] Implement tests for artist-song relationships
   [x] Test artist metadata handling

6. **Playlists Module Tests**
   [x] Test CRUD operations for playlists
   [x] Verify playlist-song relationships
   [x] Test public/private access controls

7. **Tags Module Tests**
   [x] Test CRUD operations for tags
   [x] Verify tag-song relationships
   [x] Test tag categories and filtering

8. **Spotify Integration Tests** [SKIP]
   [ ] ~~Test Spotify API client with proper mocking~~
   [ ] ~~Verify track import functionality~~
   [ ] ~~Test audio features extraction~~

## Integration Tests (5-8 story points each)

1. **Authentication Flow**
   [x] Test complete auth flow with token validation
   [x] Verify refresh token mechanism
   [x] Test permission cascades across resources

2. **Song Management Pipeline** ✅
   [x] Test song creation with artist assignment
   [x] Validate audio source processing
   [x] Test lyrics attachment and processing

3. **Search Functionality**
   [x] Test search with filtering capabilities
   [x] Verify pagination works across resources
   [x] Test search relevance scoring

4. **Playlist Management**
   [x] Test playlist creation with initial songs
   [ ] Verify song addition/removal from playlists
   [ ] Test playlist sharing mechanisms

5. **Data Import Flows** [SKIP]
   [ ] ~~Test Spotify import workflow~~
   [ ] Verify lyrics fetching integration
   [ ] Test metadata enrichment process

## E2E Tests (8 story points each)

1. **Complete Auth API**
   [x] Test registration, login, token refresh
   [x] Verify account management endpoints
   [x] Test authorization on protected routes

2. **Artists and Songs API** ✅
   [x] Test complete CRUD for artists and songs
   [x] Verify relationships between entities
   [x] Test media association flows

3. **Playlists and Collections API**
   [ ] Test playlist creation and management
   [ ] Verify user collection functionality
   [ ] Test sharing and collaboration features

4. **Search and Discovery API**
   [ ] Test search endpoints with various filters
   [ ] Verify recommendation endpoints
   [ ] Test pagination and sorting options

5. **Media Processing API**
   [ ] Test audio source management
   [ ] Verify lyrics synchronization endpoints
   [ ] Test media upload and processing

## Infrastructure Tasks (3-5 story points each)

1. **Test Database Setup** ✅
   [x] Configure isolated test database
   [x] Implement database seeding for tests
   [x] Create database reset mechanisms

2. **Mock Service Implementation**
   [x] Create comprehensive mocks for external services
   [x] Implement mock factories for test data
   [x] Setup dynamic test fixtures

3. **CI Pipeline Configuration**
   [x] Configure GitHub Actions for test automation
   [ ] Setup test coverage reporting
   [ ] Implement test result visualization

4. **Documentation**
   [x] Update API documentation with test examples
   [x] Document test patterns and conventions
   [ ] Create developer guidelines for testing

## Technical Debt (3 story points each)

1. **Refactor Auth Service**
   [x] Split authentication logic for better testability
   [x] Improve token handling for testing
   [x] Add more granular permission checks

2. **Test Helper Utilities**
   [x] Create reusable test factories
   [x] Implement test data generators
   [x] Build request simulation utilities

[x] Implement tests for media flowp

## Error Fix Plan

### 1. JWT Authorization Fixes
- [ ] Fix JWT configuration in `./backend/src/songs/tests/songs.integration.spec.ts`:
  - Add JwtModule configuration with test secret
  - Ensure proper token generation in TestHelpers
  - Add global JWT guard configuration

### 2. Circular Dependencies
- [ ] Fix circular dependencies in `./backend/src/playlists/tests/playlists.service.spec.ts`:
  - Use forwardRef() for bidirectional relationships
  - Review module dependencies
  - Ensure proper module initialization order

### 3. Prisma Foreign Key Constraints
- [ ] Update cleanup order in `./backend/src/tests/test-helpers.ts`:
```typescript
async cleanupDatabase() {
  await this.prisma.playlistSong.deleteMany();
  await this.prisma.playlistShare.deleteMany();
  await this.prisma.playlist.deleteMany();
  await this.prisma.songTag.deleteMany();
  await this.prisma.tag.deleteMany();
  await this.prisma.song.deleteMany();
  await this.prisma.lyrics.deleteMany();
  await this.prisma.artist.deleteMany();
  await this.prisma.userPreferences.deleteMany();
  await this.prisma.user.deleteMany();
}
```

### 4. Lyrics Type Validation
- [ ] Fix LyricsCreateInput type in `./backend/prisma/schema.prisma`:
  - Add 'text' field to Lyrics model
  - Update all related interfaces and types
  - Regenerate Prisma client

### 5. Search Test Data
- [ ] Update search tests in `./backend/src/search/tests/search.integration.spec.ts`:
  - Add proper test data setup
  - Ensure test data matches search criteria
  - Add proper cleanup after tests

### Implementation Order:
1. Fix Prisma schema and regenerate client
2. Update database cleanup order
3. Fix JWT configuration
4. Resolve circular dependencies
5. Update search test data

## Current Error Fix Plan (2024-03-XX)

### 1. JWT Authorization Issues
Files to check:
- `backend/src/songs/tests/songs.integration.spec.ts`
- `backend/src/auth/strategies/jwt.strategy.ts`
- `backend/src/tests/test-helpers.ts`

Tasks:
1. Fix JWT module configuration in test setup:
```typescript
beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      AppModule,
      JwtModule.registerAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          secret: configService.get('JWT_SECRET'),
          signOptions: { expiresIn: '1d' },
        }),
        inject: [ConfigService],
      }),
      AuthModule,
    ],
  }).compile();
  // ... rest of the setup
}
```

2. Fix token generation in TestHelpers:
```typescript
generateToken(userId: number, role: UserRole) {
  return this.jwtService.sign(
    {
      sub: userId,
      role: role,
      type: 'access_token'
    },
    {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '1d'
    }
  );
}
```

3. Verify JWT strategy configuration:
```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }
}
```

### 2. Lyrics Model Type Issues
Files to check:
- `backend/prisma/schema.prisma`
- `backend/src/songs/tests/songs.integration.spec.ts`
- `backend/src/tests/test-helpers.ts`

Tasks:
1. Update Prisma schema to include text field:
```prisma
model Lyrics {
  id         Int       @id @default(autoincrement())
  content    String    @db.Text
  language   String    // zmiana z String? na String
  sourceUrl  String?
  timestamps Json?
  songs      Song[]
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}
```

2. Run Prisma generate to update types:
```bash
cd backend && pnpm prisma generate
```

3. Update all Lyrics creation calls to match schema:
```typescript
const data: Prisma.LyricsCreateInput = {
  content: 'Test lyrics content',
  language: 'en',
  sourceUrl: 'https://example.com/lyrics',
  timestamps: { '00:00': 'Test lyrics' },
};
```

### Implementation Order:
1. Fix Prisma schema and regenerate client first
2. Update JWT configuration
3. Run tests to verify fixes

### Notes:
- Each fix should include both implementation and test updates
- Add detailed error logging for debugging
- Consider adding transaction rollback in tests
- Update API documentation after fixes

# Test Fix Plan (2024-04-05)

## 1. JWT Authorization Issues
Files to check:
- `./backend/src/songs/tests/songs.integration.spec.ts`
- `./backend/src/auth/auth.module.ts`
- `./backend/src/auth/strategies/jwt.strategy.ts`

Tasks:
1. Poprawić konfigurację modułu JWT w testach:
```typescript
imports: [
  ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env.test',
  }),
  AuthModule,
  AppModule,
]
```

2. Upewnić się, że `AuthModule` eksportuje wszystkie potrzebne zależności:
```typescript
@Module({
  exports: [AuthService, JwtModule, JwtStrategy],
})
```

## 2. Prisma Schema Issues
Files to check:
- `./backend/prisma/schema.prisma`
- `./backend/src/songs/tests/songs.integration.spec.ts`
- `./backend/src/tests/test-helpers.ts`

Tasks:
1. Zaktualizować model Lyrics w schema.prisma:
```prisma
model Lyrics {
  id         Int       @id @default(autoincrement())
  content    String    @db.Text
  language   String    // zmiana z String? na String
  sourceUrl  String?
  timestamps Json?
  songs      Song[]
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}
```

2. Zaktualizować wszystkie miejsca tworzenia Lyrics w testach:
```typescript
// w songs.integration.spec.ts
const lyrics = await prismaService.lyrics.create({
  data: {
    content: '[00:00.00]Test lyrics\n[00:05.00]Second line',
    language: 'en',
    sourceUrl: 'https://example.com/lyrics',
    timestamps: { '00:00': 'Test lyrics', '00:05': 'Second line' }
  }
});

// w test-helpers.ts
async createTestLyrics(): Promise<Lyrics> {
  return this.prisma.lyrics.create({
    data: {
      content: 'Test lyrics content',
      language: 'en',
      sourceUrl: 'https://example.com/lyrics',
      timestamps: { '00:00': 'Test lyrics' }
    }
  });
}
```

## Implementation Order:
1. Najpierw zaktualizować schemat Prisma i wygenerować klienta
2. Wykonać migrację bazy danych
3. Zaktualizować kod testów
4. Poprawić konfigurację JWT
5. Uruchomić testy i zweryfikować poprawki

## Polecenia do wykonania:
```bash
# 1. Wygenerować nowego klienta Prisma
cd backend && pnpm prisma generate

# 2. Wykonać migrację
cd backend && pnpm prisma migrate dev --name update_lyrics_model

# 3. Uruchomić testy
cd backend && NODE_ENV=test pnpm test src/songs/tests/songs.integration.spec.ts
```

## Uwagi:
- Upewnić się, że baza testowa jest w czystym stanie przed uruchomieniem testów
- Dodać szczegółowe logowanie dla debugowania
- Rozważyć dodanie wycofywania transakcji w testach
- Zaktualizować dokumentację API po wprowadzeniu zmian

# Backend Tasks

## High Priority: Fix Tests & TypeScript Issues

### 1. JWT Authorization Test Fixes
**Problem**: Integration tests failing due to JWT authorization issues (401 Unauthorized)
**Files affected**: 
- `src/songs/tests/songs.integration.spec.ts`
- `src/auth/guards/jwt-auth.guard.ts`
- `src/auth/strategies/jwt.strategy.ts`

**Implementation steps**:
1. Add test helpers:
```typescript
// src/tests/auth-test.helper.ts
export const setupTestAuth = async (app: INestApplication) => {
  const authService = app.get(AuthService);
  const user = await createTestUser(app);
  const token = await authService.generateAccessToken(user);
  return { user, token };
};

export const withAuth = (request: any, token: string) => {
  return request.set('Authorization', `Bearer ${token}`);
};
```

2. Update JWT configuration:
```typescript
// In test setup
JwtModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    secret: configService.get('JWT_SECRET'),
    signOptions: { expiresIn: '1d' }
  }),
  inject: [ConfigService],
})
```

### 2. TypeScript Type Fixes
**Problem**: Multiple TypeScript errors in models and tests
**Files affected**: Multiple test and service files

**Implementation steps**:
1. Create type definitions:
```typescript
// src/types/prisma-extensions.ts
export interface SongExtended extends Prisma.SongCreateInput {
  genre: string;
  releaseYear: number;
}

export interface LyricsExtended extends Prisma.LyricsCreateInput {
  language: string;
  sourceUrl: string;
}
```

2. Add test data factories:
```typescript
// src/tests/test-utils.ts
export const createTestSong = (): SongExtended => ({
  title: 'Test Song',
  artistId: 1,
  duration: 180,
  audioUrl: 'https://example.com/song.mp3',
  genre: 'pop',
  releaseYear: 2024,
  lyricsId: 1
});
```

3. Update Prisma schema:
```prisma
// prisma/schema.prisma
model Song {
  // existing fields...
  genre       String
  releaseYear Int
}

model Lyrics {
  // existing fields...
  language   String
  sourceUrl  String
}
```

### 3. Database Test Helpers
**Problem**: Inconsistent database cleanup and setup in tests
**Files affected**: All test files

**Implementation steps**:
1. Create DB helper:
```typescript
// src/tests/db-test.helper.ts
export class DbTestHelper {
  constructor(private prisma: PrismaService) {}

  async cleanupDatabase() {
    // Cleanup in correct order
    const tables = [
      'PlaylistSong',
      'PlaylistShare',
      'Playlist',
      'SongTag',
      'Tag',
      'Song',
      'Lyrics',
      'Artist',
      'UserPreferences',
      'User'
    ];
    
    for (const table of tables) {
      await this.prisma[table.toLowerCase()].deleteMany();
    }
  }
}
```

2. Add to test setup:
```typescript
// In test files
describe('Test Suite', () => {
  let dbHelper: DbTestHelper;

  beforeAll(async () => {
    dbHelper = new DbTestHelper(prisma);
  });

  afterEach(async () => {
    await dbHelper.cleanupDatabase();
  });
});
```

### 4. Prisma Mock Helpers
**Problem**: Inconsistent mocking of Prisma methods in tests
**Files affected**: All test files using Prisma mocks

**Implementation steps**:
1. Create mock helper:
```typescript
// src/tests/prisma-mock.helper.ts
export const mockPrismaMethod = (
  model: any,
  method: string,
  returnValue: any
) => {
  model[method].mockResolvedValue(returnValue);
};

// Usage example:
mockPrismaMethod(prismaService.song, 'create', {
  id: 1,
  title: 'Test Song',
  genre: 'pop',
  releaseYear: 2024
});
```

### 5. Automated Fixes Script
**Problem**: Manual fixes needed for property names and types
**Files affected**: Multiple files

**Implementation steps**:
1. Create fix script:
```bash
#!/bin/bash
# scripts/fix-property-names.sh

# Fix property names
find ./src -type f -name "*.ts" -exec sed -i 's/lrc:/timestamps:/g' {} +
find ./src -type f -name "*.ts" -exec sed -i 's/include: { song:/include: { songs:/g' {} +

# Add missing properties
find ./src -type f -name "*.ts" -exec sed -i 's/{ title: string, artistId: number }/{ title: string, artistId: number, genre: string, releaseYear: number }/g' {} +
```

### Implementation Order
1. Create and test helpers first
2. Run Prisma migrations
3. Update test configurations
4. Apply automated fixes
5. Verify and fix remaining issues

### Success Criteria
- All TypeScript errors resolved
- Tests passing with proper JWT auth
- Consistent test data structure
- Clean database state between tests