# LyraClipMAP Project Consistency Guide

This document addresses inconsistencies identified in the project documentation, code, and architecture to ensure a unified approach moving forward. It serves as the single source of truth for naming conventions, structure, technologies, and API formats.

## 1. Technology Stack

### Confirmed Stack
- **Backend**: NestJS (TypeScript)
- **Frontend**: Vue.js 3 + Vuetify 3 (TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **State Management**: Pinia (replacing Vuex)
- **Build Tool**: Vite

### Inconsistency Resolution
- ❌ **Next.js references**: Any references to Next.js in the documentation are deprecated. The project has been migrated to Vue.js.
- ❌ **Flask/Python references**: The original prototype used Flask, but the project has migrated to a TypeScript stack.

## 2. Project Structure

### Standardized Directory Structure

```
mvp/0.2/
├── client/                 # Vue.js frontend application
│   ├── public/             # Static assets
│   └── src/
│       ├── assets/         # Images, fonts, etc.
│       ├── components/     # Vue components organized by feature
│       ├── composables/    # Vue composition API hooks
│       ├── layouts/        # Page layouts
│       ├── router/         # Vue Router configuration
│       ├── stores/         # Pinia stores
│       ├── styles/         # Global styles
│       ├── types/          # TypeScript type definitions
│       ├── utils/          # Utility functions
│       └── views/          # Page components
│
├── server/                 # NestJS backend application
│   ├── prisma/             # Prisma schema and migrations
│   └── src/
│       ├── api/            # API modules and controllers
│       ├── common/         # Shared utilities and interfaces
│       ├── config/         # Application configuration
│       ├── core/           # Core application modules
│       └── modules/        # Feature modules
│
├── docs/                   # Project documentation
└── package.json            # Monorepo root package.json (PNPM workspaces)
```

### Inconsistency Resolution
- ❌ **'frontend' directory**: Use `client` directory instead
- ❌ **'backend' directory**: Use `server` directory instead
- ❌ **Flask directory structure**: Completely deprecated

## 3. Naming Conventions

### Data Models

| Standardized Name | Alternative Names (Deprecated) | Description |
|-------------------|-------------------------------|-------------|
| `Song` | `Track` | A musical composition with metadata |
| `Artist` | `Performer`, `Author` | The creator/performer of songs |
| `AudioSource` | `Source`, `AudioTrack` | Source for audio playback |
| `TextContent` | `Content`, `Lyrics` (when used generically) | Text associated with a song |
| `WordTimestamp` | `LyricTimestamp`, `Timestamp` | Timing for a specific word |
| `Playlist` | `Collection` | User-created collection of songs |
| `User` | `Account` | User account information |
| `UserPreference` | `Settings`, `Preferences` | User-specific settings |

### Component Names

| Standardized Name | Alternative Names (Deprecated) | Description |
|-------------------|-------------------------------|-------------|
| `WavePlayer` | `AudioPlayer`, `Waveform` | Audio player with waveform visualization |
| `LyricsDisplay` | `LyricView`, `SyncedLyrics` | Component for displaying lyrics |
| `SongCard` | `MusicCard`, `TrackCard` | Card component for song information |
| `SongList` | `TrackList`, `SongTable` | List/table of songs |
| `PlaylistCard` | `CollectionCard` | Card component for playlists |

### Object Properties

| Entity | Standardized Property Names | Incorrect Variations |
|--------|---------------------------|-------------------|
| Song | `id`, `title`, `artistId`, `thumbnailUrl` | `songId`, `name`, `artist_id`, `thumbnail` |
| AudioSource | `id`, `songId`, `url`, `sourceType` | `audioId`, `trackId`, `link`, `type` |
| TextContent | `id`, `songId`, `content`, `contentType`, `language` | `textId`, `trackId`, `text`, `type`, `lang` |

## 4. API Endpoints

### RESTful Endpoint Structure

```
/api
├── /songs                  # Song operations
│   ├── GET /              # List songs
│   ├── POST /             # Create song
│   ├── GET /:id           # Get song details
│   ├── PUT /:id           # Update song
│   ├── DELETE /:id        # Delete song
│   ├── GET /:id/audio-sources     # Get song's audio sources
│   └── GET /:id/text-contents     # Get song's text contents
│
├── /artists               # Artist operations
├── /playlists             # Playlist operations
├── /text-contents         # Text content operations
├── /audio-sources         # Audio source operations
├── /users                 # User operations
└── /auth                  # Authentication endpoints
```

### Special Endpoints

```
/api
├── /lyrics                # Specialized lyrics operations
│   ├── POST /search       # Search for lyrics online
│   └── POST /synchronize  # Generate synchronized lyrics
│
├── /youtube               # YouTube integration
│   └── POST /info         # Get info from YouTube URL
```

### API Response Format

All API responses should follow this format:

```typescript
// Success response
{
  data: T,               // Response data (type varies by endpoint)
  meta?: {               // Optional metadata
    total?: number,      // Total count for pagination
    page?: number,       // Current page
    limit?: number,      // Items per page
    timestamp?: string   // Response timestamp
  }
}

// Error response
{
  statusCode: number,    // HTTP status code
  message: string,       // Error message
  code: string,          // Error code
  timestamp: string,     // Error timestamp
  path?: string,         // Request path
  errors?: {             // Validation errors
    field: string,
    message: string
  }[]
}
```

## 5. State Management

### Pinia Store Structure

```
stores/
├── player.ts             # Audio player state
├── songs.ts              # Song library management
├── artists.ts            # Artist management
├── playlists.ts          # Playlist management
├── textContents.ts       # Text content management
├── user.ts               # User and authentication
└── ui.ts                 # UI state (theme, layout, etc.)
```

### Store Actions Naming

| Store | Standardized Action Names | Deprecated Names |
|-------|--------------------------|-----------------|
| Player | `playSong`, `pauseSong`, `seekTo`, `setVolume` | `play`, `pause`, `setTime` |
| Songs | `fetchSongs`, `addSong`, `updateSong`, `deleteSong` | `getSongs`, `createSong`, `removeSong` |
| TextContents | `fetchTextContents`, `addTextContent`, `updateTextContent` | `getLyrics`, `addLyrics`, `updateLyrics` |

## 6. UI Components

### Consistent Vuetify Usage

- Use Vuetify's built-in components where possible
- Follow Vuetify's prop naming conventions
- Use the standardized theme colors defined in `main.ts`

```typescript
// Theme configuration
const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#6200EA',     // Main color
          secondary: '#03DAC6',   // Accent color
          background: '#F5F5F5',  // Background
          surface: '#FFFFFF',     // Surface
          error: '#B00020',       // Error
          info: '#2196F3',        // Info
          success: '#4CAF50',     // Success
          warning: '#FB8C00'      // Warning
        }
      },
      dark: {
        colors: {
          primary: '#6200EA',
          secondary: '#03DAC6',
          background: '#121212',
          surface: '#1E1E1E',
          error: '#CF6679',
          // Other colors consistent with light theme
        }
      }
    }
  }
})
```

## 7. TypeScript Types

### Type Definitions Structure

```
client/src/types/
├── index.ts              # Core data models and interfaces
├── api.ts                # API request/response interfaces
├── components.ts         # Vue component props and emits
└── store.ts              # Pinia store interfaces
```

### Type Naming Conventions

- Use PascalCase for interface and type names: `Song`, `AudioSource`, etc.
- Use PascalCase for enum names: `ContentType`, `SourceType`, etc.
- Use camelCase for properties: `songId`, `textContent`, etc.

### Enums Instead of String Constants

```typescript
// Correct
export enum ContentType {
  LYRICS = 'LYRICS',
  TRANSLATION = 'TRANSLATION',
  TRANSCRIPTION = 'TRANSCRIPTION',
  // ...
}

// Incorrect - do not use
const CONTENT_TYPES = {
  LYRICS: 'lyrics',
  TRANSLATION: 'translation',
  // ...
};
```

## 8. Documentation

### Standardized Documentation Files

| File | Purpose | Location |
|------|---------|----------|
| README.md | Project overview | Root directory |
| ARCHITECTURE.md | System architecture | Root directory |
| API.md | API documentation | docs/ directory |
| STYLE.md | Style guide | Root directory |
| UI.xml | UI component designs | Root directory |
| LANG.md | Ubiquitous language | Root directory |

### Code Documentation Standards

- Use JSDoc/TSDoc for documenting functions, classes, and interfaces
- Document all public APIs and complex functions
- Include examples for non-obvious usage

```typescript
/**
 * Parses LRC format string into an array of timed lyrics
 * 
 * @param lrcText - Raw LRC format text
 * @returns Array of parsed lyric lines with timing information
 * 
 * @example
 * const lyrics = parseLRC("[00:10.00]First line\n[00:15.00]Second line");
 * // Returns: [{time: 10, text: "First line"}, {time: 15, text: "Second line"}]
 */
function parseLRC(lrcText: string): LRCLine[] {
  // Implementation...
}
```

## 9. Prisma Schema

The Prisma schema is the definitive source for data model definitions:

```prisma
model Song {
  id           String        @id @default(cuid())
  title        String
  artistId     String
  description  String?
  thumbnailUrl String?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  artist       Artist        @relation(fields: [artistId], references: [id])
  audioSources AudioSource[]
  textContents TextContent[]
  // ...other relations
}

model TextContent {
  id          String      @id @default(cuid())
  songId      String
  content     String      @db.Text
  contentType ContentType
  language    String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  song        Song        @relation(fields: [songId], references: [id], onDelete: Cascade)
  // ...other relations
}

// ...other models
```

TypeScript interfaces should match these model definitions as closely as possible.