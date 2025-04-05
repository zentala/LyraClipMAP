# JWT Authorization Issues in Integration Tests

## Implementation Plan for Developers

### 1. Environment & Dependencies Check (15 min)
```bash
# 1. Verify all required packages are installed
pnpm install
pnpm list @nestjs/jwt @nestjs/passport passport passport-jwt

# 2. Check environment files
cat .env.test
cat .env.development

# 3. Verify test database is configured
pnpm prisma migrate status

# 4. Verify database cleanup order
cat << EOF > backend/src/tests/db-cleanup-order.ts
export const CLEANUP_ORDER = [
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
EOF
```

### 2. Standardization Implementation (30 min)
1. Create new files first:
```bash
touch backend/src/tests/test-utils.ts
touch backend/src/tests/auth-test.helper.ts
touch backend/src/tests/db-test.helper.ts  # New file for DB operations
```

2. Implement helpers in order:
   - `test-utils.ts` - base test utilities
   - `auth-test.helper.ts` - auth specific helpers
   - `db-test.helper.ts` - database cleanup and setup
   - Update existing `test-helpers.ts`

3. Update test configurations:
   - Standardize JWT module config
   - Update environment setup
   - Add validation helpers

### Database Operations Helper
```typescript
// Add to db-test.helper.ts
export class DbTestHelper {
  constructor(private prisma: PrismaService) {}

  async cleanupDatabase() {
    for (const table of CLEANUP_ORDER) {
      await this.prisma[table.toLowerCase()].deleteMany();
      console.log(`Cleaned up ${table} table`);
    }
  }

  async verifyCleanup() {
    for (const table of CLEANUP_ORDER) {
      const count = await this.prisma[table.toLowerCase()].count();
      if (count > 0) {
        console.warn(`Warning: ${table} still has ${count} records`);
      }
    }
  }
}
```

### Test Data Tracking
```typescript
// Add to test-helpers.ts
interface TestDataTracking {
  iteration: number;
  createdAt: Date;
  entities: {
    adminUser: number;
    regularUser: number;
    artist: number;
    lyrics: number;
    song: number;
  }
}

private testDataHistory: TestDataTracking[] = [];

private trackTestData(data: any) {
  this.testDataHistory.push({
    iteration: this.testDataHistory.length + 1,
    createdAt: new Date(),
    entities: {
      adminUser: data.adminUser,
      regularUser: data.regularUser,
      artist: data.artist,
      lyrics: data.lyrics,
      song: data.song
    }
  });
}
```

### 3. Test Migration (45 min)
1. Update one test file first as proof of concept:
```bash
# Start with songs integration test
cd backend/src/songs/tests/
cp songs.integration.spec.ts songs.integration.spec.ts.backup
```

2. Implement changes:
   - Add new helpers
   - Update auth configuration
   - Add validation checks
   - Run tests and verify

3. If successful, update other test files:
   - Create migration script for other test files
   - Run full test suite
   - Document any new issues

### 4. Validation Steps (15 min)
```bash
# 1. Run specific test file
pnpm test src/songs/tests/songs.integration.spec.ts

# 2. Run all tests
pnpm test

# 3. Check test coverage
pnpm test:cov
```

### 5. Rollback Plan
```bash
# If issues occur, restore from backup
cd backend/src/songs/tests/
mv songs.integration.spec.ts.backup songs.integration.spec.ts

# Revert package.json if needed
git checkout -- package.json
pnpm install
```

### Expected Results
After implementing these changes:
1. All tests should pass
2. JWT validation should work correctly
3. Test setup should be more maintainable
4. Auth configuration should be consistent

### Potential Issues to Watch
1. Token expiration during long test runs
2. Race conditions in async operations
3. Database cleanup between tests
4. JWT secret consistency
5. Database cleanup order dependencies
6. Multiple test iterations creating duplicate data
7. Inconsistent cleanup between test runs

### Success Metrics
- All tests passing
- No undefined tokens in headers
- Consistent auth behavior
- Clean test logs without JWT errors

## Quick Fixes & Automation

### Grep & Replace Commands
```bash
# 1. Replace all direct process.env.JWT_SECRET usage with ConfigService
grep -r "process.env.JWT_SECRET" ./backend/src/
# Replace with: configService.get('JWT_SECRET')

# 2. Ensure consistent JWT configuration across all files
grep -r "JwtModule.register" ./backend/src/
# Replace with standardized async configuration

# 3. Check for incorrect token header format
grep -r ".set('Authorization'" ./backend/src/
# Ensure format is: .set('Authorization', `Bearer ${token}`)
```

### Automated Checks
```typescript
// Add this helper in test-helpers.ts
async function validateTestSetup() {
  const secret = this.configService.get('JWT_SECRET');
  const adminToken = this.generateToken(userId, 'admin');
  
  console.log({
    secret,
    adminToken,
    decoded: this.jwtService.decode(adminToken),
    envSecret: process.env.JWT_SECRET,
    configSecret: this.configService.get('JWT_SECRET')
  });
  
  return {
    isSecretSet: !!secret,
    isTokenValid: !!adminToken,
    secretsMatch: secret === process.env.JWT_SECRET
  };
}
```

### Common Issues & Quick Solutions
1. **Token Generation**
   ```typescript
   // Replace manual token generation with:
   const token = await this.authService.generateAccessToken(user);
   ```

2. **Test Environment**
   ```typescript
   // Add to beginning of each test file:
   beforeAll(() => {
     process.env.JWT_SECRET = 'test-secret';
     process.env.NODE_ENV = 'test';
   });
   ```

3. **Request Headers**
   ```typescript
   // Replace manual header setting with helper:
   const authHeader = token ? `Bearer ${token}` : '';
   return request(app.getHttpServer())
     .get('/endpoint')
     .set('Authorization', authHeader);
   ```

4. **Module Configuration**
   ```typescript
   // Standardize JWT module configuration:
   const jwtConfig = {
     secret: configService.get('JWT_SECRET'),
     signOptions: { expiresIn: '1d' }
   };
   ```

5. **Database Cleanup**
   ```typescript
   // Add to beginning of each test file:
   let dbHelper: DbTestHelper;

   beforeAll(async () => {
     dbHelper = new DbTestHelper(prisma);
   });

   afterEach(async () => {
     await dbHelper.cleanupDatabase();
     await dbHelper.verifyCleanup();
   });
   ```

### Automated Test Fixes
Add these to `backend/src/tests/test-utils.ts`:
```typescript
export const withAuth = (request: any, token: string) => {
  return request.set('Authorization', `Bearer ${token}`);
};

export const setupTestAuth = async (app: INestApplication) => {
  const authService = app.get(AuthService);
  const user = await createTestUser(app);
  const token = await authService.generateAccessToken(user);
  return { user, token };
};
```

### Debugging Helpers
```typescript
// Add to test-utils.ts
export const debugTestSetup = async (testData: any) => {
  console.log('Test Setup State:', {
    timestamp: new Date().toISOString(),
    testData: {
      adminUser: testData.adminUser,
      regularUser: testData.regularUser,
      artist: testData.artist,
      lyrics: testData.lyrics,
      song: testData.song
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      adminToken: testData.adminToken,
      userToken: testData.userToken
    }
  });
};
```

## Problem Description
Integration tests for the Songs module are failing due to JWT authorization issues. All requests are receiving 401 Unauthorized responses, even though tokens are being generated and set in the request headers.

### Error Details
```
JwtAuthGuard - Request headers: {
  host: '127.0.0.1:45443',
  'accept-encoding': 'gzip, deflate',
  authorization: 'Bearer undefined',
  connection: 'close'
}
```

### Test Failures Analysis

#### Failed Tests:
1. `POST /songs`
   - ✕ should create a song when user is admin
   - ✕ should not create a song when user is not admin
   - ✓ should not create a song without authentication (expected behavior)
2. `GET /songs`
   - ✕ should return all songs
3. `GET /songs/:id`
   - ✕ should return a song by id

#### Error Pattern:
All authenticated endpoints consistently fail with 401 Unauthorized. The pattern shows that:
1. Test setup completes successfully (users, artists, lyrics created)
2. JwtAuthGuard receives requests with undefined token
3. Token validation fails in guard
4. Endpoints return 401 Unauthorized

#### Database Operations:
- All database operations (CREATE/DELETE) through Prisma are working correctly
- Test data setup creates:
  - Admin User (ID: 2577-2585)
  - Regular User (ID: 2578-2586)
  - Artist (ID: 1730-1734)
  - Lyrics (ID: 1405-1410)
  - Song (ID: 1316-1320)

### Affected Files
- `backend/src/songs/tests/songs.integration.spec.ts`
- `backend/src/auth/guards/jwt-auth.guard.ts`
- `backend/src/auth/strategies/jwt.strategy.ts`
- `backend/src/tests/test-helpers.ts`

### Test Setup
1. JWT secret is set in environment:
```typescript
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-jwt-tokens';
```

2. JWT Module configuration:
```typescript
JwtModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    const secret = configService.get('JWT_SECRET');
    return {
      secret,
      signOptions: { 
        expiresIn: '1d',
        algorithm: 'HS256'
      },
    };
  },
  inject: [ConfigService],
})
```

3. Token generation in TestHelpers:
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
      expiresIn: '1d',
      algorithm: 'HS256'
    }
  );
}
```

## Investigation Steps
1. Verify token generation in `TestHelpers.setupTestData()`
   - Check if tokens are actually generated
   - Verify token payload structure
   - Log generated tokens for inspection

2. Check if token is correctly assigned to `testData.adminToken` and `testData.userToken`
   - Add logging after token assignment
   - Verify token persistence between test cases
   - Check if tokens are reset properly between tests

3. Verify token is correctly set in request headers
   - Add logging for request headers before sending
   - Verify Authorization header format
   - Check for any header manipulation issues

4. Debug JWT validation in `JwtAuthGuard` and `JwtStrategy`
   - Add detailed logging in guard
   - Verify secret used for validation
   - Check token extraction logic

## Potential Solutions
1. Ensure JWT secret is consistently used between token generation and validation
   - Verify secret in ConfigService
   - Check environment variable loading
   - Consider hardcoding test secret

2. Verify token format and payload structure
   - Log complete token lifecycle
   - Validate against JWT standards
   - Check signing algorithm consistency

3. Check if token is properly passed through test request headers
   - Review supertest header setting
   - Verify header format
   - Add request interceptor for debugging

4. Validate JWT module configuration in test environment
   - Review module initialization
   - Check dependency injection
   - Verify configuration loading order

## Related Issues
- All authenticated endpoints return 401 Unauthorized
- Token appears as 'undefined' in request headers
- JWT validation fails in guard
- Test setup appears to work but authentication fails
- Database operations succeed while auth fails

## Next Steps
1. Add detailed logging in `TestHelpers.setupTestData()`
2. Verify token generation and assignment
3. Add request header logging before sending
4. Check JWT validation process in guard 

## TypeScript Issues & Quick Fixes

### Error Patterns Analysis
1. **Missing Required Properties** (17 occurrences)
   - `genre` and `releaseYear` missing in Song objects
   - `language` and `sourceUrl` missing in Lyrics objects
   - Missing properties in Artist objects

2. **Invalid Properties** (8 occurrences)
   - `lrc` property doesn't exist in Lyrics types
   - `spotifyId` and `value` properties not in correct types
   - `song` vs `songs` property name mismatch

3. **Type Mismatches** (3 occurrences)
   - String assigned to number type
   - Array type mismatches
   - Incorrect property types

4. **Mock Implementation Issues** (12 occurrences)
   - Missing mockImplementation/mockResolvedValue on Prisma clients

### Automated Fixes

#### 1. Type Definitions Update
Create `backend/src/types/prisma-extensions.ts`:
```typescript
// Add missing properties to base types
type SongExtended = Prisma.SongCreateInput & {
  genre: string;
  releaseYear: number;
};

type LyricsExtended = Prisma.LyricsCreateInput & {
  language: string;
  sourceUrl: string;
};

// Export for use in tests
export const createDefaultSong = (): SongExtended => ({
  title: 'Test Song',
  artistId: 1,
  duration: 180,
  audioUrl: 'https://example.com/song.mp3',
  genre: 'pop',
  releaseYear: 2024,
  lyricsId: 1
});

export const createDefaultLyrics = (): LyricsExtended => ({
  content: 'Test lyrics',
  language: 'en',
  sourceUrl: 'https://example.com/lyrics',
  timestamps: {}
});
```

#### 2. Property Fixes Script
Create `backend/scripts/fix-property-names.sh`:
```bash
#!/bin/bash

# Fix lrc -> timestamps
find ./backend/src -type f -name "*.ts" -exec sed -i 's/lrc:/timestamps:/g' {} +

# Fix song -> songs in includes
find ./backend/src -type f -name "*.ts" -exec sed -i 's/include: { song:/include: { songs:/g' {} +

# Fix spotifyId references
find ./backend/src -type f -name "*.ts" -exec sed -i 's/spotifyId:/id:/g' {} +
```

#### 3. Mock Helper Functions
Create `backend/src/tests/prisma-mock.helper.ts`:
```typescript
export const createPrismaMock = (prismaService: any) => {
  // Add mock implementations to all Prisma methods
  Object.keys(prismaService).forEach(key => {
    const model = prismaService[key];
    if (typeof model === 'object') {
      ['create', 'findUnique', 'findMany', 'update', 'delete'].forEach(method => {
        if (model[method]) {
          model[method].mockImplementation = jest.fn();
          model[method].mockResolvedValue = jest.fn();
        }
      });
    }
  });
  return prismaService;
};

export const mockPrismaMethod = (
  model: any,
  method: string,
  returnValue: any
) => {
  model[method].mockResolvedValue(returnValue);
};
```

#### 4. Type Validation Helper
Create `backend/src/tests/type-validation.helper.ts`:
```typescript
export const validateSongData = (data: any): void => {
  const requiredProps = [
    'title', 'artistId', 'duration', 'audioUrl',
    'genre', 'releaseYear', 'lyricsId'
  ];
  
  const missing = requiredProps.filter(prop => !(prop in data));
  if (missing.length > 0) {
    throw new Error(`Missing required properties in song data: ${missing.join(', ')}`);
  }
};

export const validateLyricsData = (data: any): void => {
  const requiredProps = ['content', 'language', 'sourceUrl', 'timestamps'];
  
  const missing = requiredProps.filter(prop => !(prop in data));
  if (missing.length > 0) {
    throw new Error(`Missing required properties in lyrics data: ${missing.join(', ')}`);
  }
};
```

### Quick Fix Commands
```bash
# 1. Fix all property name issues
chmod +x backend/scripts/fix-property-names.sh
./backend/scripts/fix-property-names.sh

# 2. Add missing properties to Song objects
find ./backend/src -type f -name "*.ts" -exec sed -i 's/{ title: string, artistId: number }/{ title: string, artistId: number, genre: string, releaseYear: number }/g' {} +

# 3. Add missing properties to Lyrics objects
find ./backend/src -type f -name "*.ts" -exec sed -i 's/{ content: string }/{ content: string, language: string, sourceUrl: string }/g' {} +

# 4. Fix mock implementations
find ./backend/src -type f -name "*.spec.ts" -exec sed -i 's/prismaService = /prismaService = createPrismaMock(/g' {} +
```

### Implementation Steps
1. Create helper files:
```bash
mkdir -p backend/src/types
touch backend/src/types/prisma-extensions.ts
mkdir -p backend/scripts
touch backend/scripts/fix-property-names.sh
touch backend/src/tests/prisma-mock.helper.ts
touch backend/src/tests/type-validation.helper.ts
```

2. Update test files:
```typescript
// Add to test files
import { createDefaultSong, createDefaultLyrics } from '../types/prisma-extensions';
import { createPrismaMock, mockPrismaMethod } from './prisma-mock.helper';
import { validateSongData, validateLyricsData } from './type-validation.helper';

describe('Test Suite', () => {
  beforeEach(() => {
    // Initialize with all required properties
    const song = createDefaultSong();
    const lyrics = createDefaultLyrics();
    
    // Validate data before using
    validateSongData(song);
    validateLyricsData(lyrics);
  });
});
```

3. Update Prisma schema:
```prisma
// Add to prisma/schema.prisma
model Song {
  // ... existing fields ...
  genre       String
  releaseYear Int
}

model Lyrics {
  // ... existing fields ...
  language   String
  sourceUrl  String
}
```

4. Run migrations:
```bash
pnpm prisma migrate dev --name add_required_fields
``` 