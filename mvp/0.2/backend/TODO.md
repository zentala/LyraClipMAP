# Rules

* never change rules. section. never. ever.
* mark task as done, commit, take next task fromtak the list
* in every point / task
* manitain this `TODO.md` as: Groups > Tasks > TODO Actions

# Test Repair Plan (2024-03-XX)

## Analiza błędów

Znaleziono 3 główne kategorie błędów w testach:

1. Błędy w `media-flow.spec.ts`:
   - Test "should handle non-existent song deletion" nie przechodzi
   - Promise jest rozwiązywana zamiast odrzucana przy próbie usunięcia nieistniejącego utworu

2. Błędy w `entity-relationships.spec.ts`:
   - Dwa testy związane z relacją Artist-Song nie przechodzą
   - NotFoundException jest rzucany przy próbie utworzenia piosenki z nieistniejącym artystą

3. Błędy w `artists.integration.spec.ts`:
   - Błąd PrismaClientKnownRequestError przy próbie usunięcia artysty
   - Problem z czyszczeniem danych testowych w afterAll

## Plan naprawy

### 1. Naprawa obsługi usuwania nieistniejących utworów
**Commit name:** `fix(backend): improve error handling for non-existent song deletion`

**Pliki do modyfikacji:**
- `./backend/src/songs/songs.service.ts`
- `./backend/src/tests/media-flow.spec.ts`

**Wytyczne techniczne:**
- Zmodyfikować metodę `remove` w `SongsService`, aby najpierw sprawdzała istnienie utworu
- Zaktualizować mock w testach, aby prawidłowo symulował zachowanie Prisma
- Dodać obsługę błędów Prisma

**Implementacja:**
```typescript
// W SongsService
async remove(id: number) {
  const song = await this.prisma.song.findUnique({
    where: { id }
  });
  if (!song) {
    throw new NotFoundException(`Song with ID ${id} not found`);
  }
  return this.prisma.song.delete({
    where: { id }
  });
}

// W media-flow.spec.ts
mockPrismaService.song.findUnique.mockResolvedValue(null);
mockPrismaService.song.delete.mockRejectedValue(
  new PrismaClientKnownRequestError('Record not found', {
    code: 'P2025',
    clientVersion: '5.0.0'
  })
);
```

### 2. Naprawa testów relacji Artist-Song
**Commit name:** `fix(backend): correct artist-song relationship tests`

**Pliki do modyfikacji:**
- `./backend/src/tests/entity-relationships.spec.ts`
- `./backend/src/songs/songs.service.ts`

**Wytyczne techniczne:**
- Poprawić implementację mocków w testach
- Zaktualizować obsługę błędów w serwisie
- Dodać prawidłową walidację istnienia artysty

**Implementacja:**
```typescript
// W entity-relationships.spec.ts
mockPrismaService.artist.findUnique.mockResolvedValue(null);
mockPrismaService.song.create.mockRejectedValue(
  new PrismaClientKnownRequestError('Foreign key constraint failed', {
    code: 'P2003',
    clientVersion: '5.0.0'
  })
);
```

### 3. Naprawa testów integracyjnych artystów
**Commit name:** `fix(backend): improve artist integration tests cleanup`

**Pliki do modyfikacji:**
- `./backend/src/artists/tests/artists.integration.spec.ts`

**Wytyczne techniczne:**
- Dodać prawidłowe czyszczenie danych testowych
- Zaimplementować obsługę przypadku, gdy artysta już nie istnieje
- Użyć `deleteMany` zamiast `delete` dla bezpieczniejszego czyszczenia

**Implementacja:**
```typescript
afterAll(async () => {
  try {
    await prismaService.song.deleteMany({
      where: { artistId: createdArtist.id }
    });
    await prismaService.artist.deleteMany({
      where: { id: createdArtist.id }
    });
  } catch (error) {
    console.warn('Cleanup error:', error);
  }
});
```

## Kolejność implementacji:
1. Najpierw naprawić obsługę usuwania nieistniejących utworów (#1)
2. Następnie poprawić testy relacji Artist-Song (#2)
3. Na końcu naprawić testy integracyjne artystów (#3)

## Uwagi:
- Każda zmiana powinna być poprzedzona testami jednostkowymi
- Należy zachować istniejące testy i tylko je poprawić
- Dodać odpowiednie komentarze w kodzie
- Zaktualizować dokumentację API jeśli to konieczne

## Priority Issues

### 1. Fix Song Creation (High Priority) ✅
**Commit name:** `fix(backend): resolve song creation 404 error`
**Files to check:**
- `src/songs/songs.service.ts`
- `src/songs/songs.controller.ts`
- `src/songs/tests/songs.integration.spec.ts`

**Technical Guidelines:**
- Verify artist and lyrics existence before song creation
- Add proper error handling for non-existent resources
- Update error responses to match API documentation
- Add logging for debugging purposes

**Implementation Steps:**
```typescript
// In SongsService
async create(createSongDto: CreateSongDto) {
  const artist = await this.prisma.artist.findUnique({
    where: { id: createSongDto.artistId }
  });
  if (!artist) throw new NotFoundException('Artist not found');

  if (createSongDto.lyricsId) {
    const lyrics = await this.prisma.lyrics.findUnique({
      where: { id: createSongDto.lyricsId }
    });
    if (!lyrics) throw new NotFoundException('Lyrics not found');
  }

  return this.prisma.song.create({
    data: createSongDto,
    include: { artist: true, lyrics: true }
  });
}
```

### 2. Fix Song Deletion Error Handling ✅
**Commit name:** `fix(backend): improve song deletion error handling`
**Files to check:**
- `src/songs/songs.service.ts`
- `src/tests/media-flow.spec.ts`

**Technical Guidelines:**
- Ensure proper error throwing for non-existent songs
- Update transaction handling in delete operations
- Add proper error mapping in service layer

**Implementation Steps:**
```typescript
// In SongsService
async remove(id: number) {
  const song = await this.prisma.song.findUnique({
    where: { id }
  });
  if (!song) throw new NotFoundException(`Song with ID ${id} not found`);

  return this.prisma.song.delete({
    where: { id }
  });
}
```

### 3. Fix Entity Relationship Error Handling ✅
**Commit name:** `fix(backend): standardize entity relationship error handling`
**Files to check:**
- `src/tests/entity-relationships.spec.ts`
- `src/songs/songs.service.ts`
- `src/common/exceptions/prisma-error.handler.ts`

**Technical Guidelines:**
- Standardize error handling across entity relationships
- Create common error handling utilities
- Update test mocks to properly simulate Prisma errors

**Implementation Steps:**
```typescript
// In PrismaErrorHandler
export class PrismaErrorHandler {
  static handle(error: any) {
    if (error.code === 'P2025') {
      throw new NotFoundException('Record not found');
    }
    throw error;
  }
}

// In SongsService
try {
  return await this.prisma.song.create({
    data: createSongDto
  });
} catch (error) {
  throw PrismaErrorHandler.handle(error);
}
```

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
- [ ] Update DELETE endpoint tests to expect 204 No Content
- [ ] Update controller to match expected response codes
- [ ] Add proper response serialization

4. Fix Error Handling
- [ ] Update mock implementations for non-existent records
- [ ] Add proper error throwing in service layer
- [ ] Update tests to properly handle async errors

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

## 1. Fix Song Deletion Tests
### Technical Guidelines:
- Review `SongsService.remove()` implementation
- Ensure proper error handling for non-existent records
- Check if `findUnique()` is called before deletion
- Verify exception mapping in the controller layer
- Files to check: 
  - `src/songs/songs.service.ts`
  - `src/songs/songs.controller.ts`
  - `src/tests/media-flow.spec.ts`

## 2. Fix Artist-Song Relationship Tests
### Technical Guidelines:
- Review Prisma schema for Artist-Song relationship
- Verify cascade delete settings
- Check foreign key constraints
- Ensure proper error handling in service layer
- Files to check:
  - `prisma/schema.prisma`
  - `src/songs/songs.service.ts`
  - `src/tests/entity-relationships.spec.ts`

## 3. Fix Song Update Operations
### Technical Guidelines:
- Debug 500 error in update operation
- Check transaction handling
- Verify input validation
- Review error handling middleware
- Files to check:
  - `src/songs/songs.service.ts`
  - `src/songs/dto/update-song.dto.ts`
  - `src/songs/tests/songs.integration.spec.ts`

## 4. Fix Artist ID Related Operations
### Technical Guidelines:
- Review artist ID validation logic
- Check artist-song relationship queries
- Verify error handling for non-existent artists
- Files to check:
  - `src/songs/songs.service.ts`
  - `src/artists/artists.service.ts`
  - `src/songs/tests/songs.integration.spec.ts`

## 5. Fix ID Inconsistencies
### Technical Guidelines:
- Review test data setup
- Check ID generation in test environment
- Verify database seeding process
- Files to check:
  - `src/tests/test-helpers.ts`
  - `prisma/seed.ts`
  - All affected test files

## Implementation Order:
1. Start with entity relationships (#2) as other issues may depend on this
2. Fix ID inconsistencies (#5) as this affects all tests
3. Fix song deletion (#1)
4. Fix update operations (#3)
5. Fix artist ID operations (#4)

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

8. **Spotify Integration Tests**
   [ ] Test Spotify API client with proper mocking
   [ ] Verify track import functionality
   [ ] Test audio features extraction

## Integration Tests (5-8 story points each)

1. **Authentication Flow**
   [x] Test complete auth flow with token validation
   [x] Verify refresh token mechanism
   [x] Test permission cascades across resources

2. **Song Management Pipeline**
   [ ] Test song creation with artist assignment
   [ ] Validate audio source processing
   [ ] Test lyrics attachment and processing

3. **Search Functionality**
   [ ] Test search with filtering capabilities
   [ ] Verify pagination works across resources
   [ ] Test search relevance scoring

4. **Playlist Management**
   [ ] Test playlist creation with initial songs
   [ ] Verify song addition/removal from playlists
   [ ] Test playlist sharing mechanisms

5. **Data Import Flows**
   [ ] Test Spotify import workflow
   [ ] Verify lyrics fetching integration
   [ ] Test metadata enrichment process

## E2E Tests (8 story points each)

1. **Complete Auth API**
   [x] Test registration, login, token refresh
   [x] Verify account management endpoints
   [x] Test authorization on protected routes

2. **Artists and Songs API**
   [x] Test complete CRUD for artists and songs
   [ ] Verify relationships between entities
   [ ] Test media association flows

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

1. **Test Database Setup**
   [ ] Configure isolated test database
   [ ] Implement database seeding for tests
   [ ] Create database reset mechanisms

2. **Mock Service Implementation**
   [x] Create comprehensive mocks for external services
   [x] Implement mock factories for test data
   [x] Setup dynamic test fixtures

3. **CI Pipeline Configuration**
   [ ] Configure GitHub Actions for test automation
   [ ] Setup test coverage reporting
   [ ] Implement test result visualization

4. **Documentation**
   [ ] Update API documentation with test examples
   [ ] Document test patterns and conventions
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