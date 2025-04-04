# Rules

[ ] never change rules. section. never. ever.
[ ] manitain TODO.md as tasks lists `[ ]` or `[x]` and track here progress
[ ] makr task as done, commit, take next task fromtak the list

...end_of_rues_section.


# Backend Implementation TODO List

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
   [ ] Implement tests for artist-song relationships
   [ ] Test artist metadata handling

6. **Playlists Module Tests**
   [ ] Test CRUD operations for playlists
   [ ] Verify playlist-song relationships
   [ ] Test public/private access controls

7. **Tags Module Tests**
   [ ] Test tag creation and assignment
   [ ] Verify tag categorization
   [ ] Test song-tag relationships

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