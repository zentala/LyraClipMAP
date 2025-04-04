# LyraClipMAP Architecture

This document outlines the architecture of LyraClipMAP v0.2, a modern web application designed for managing a music library with synchronized lyrics, audio visualization, and multi-platform integration.

## Technology Stack

### Overview

LyraClipMAP employs a modern TypeScript-based stack with clear separation of concerns:

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│    Frontend     │◄────►│     Backend     │◄────►│    Database     │
│    (Vue.js)     │      │    (NestJS)     │      │  (PostgreSQL)   │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
        ▲                        ▲                        
        │                        │                        
        ▼                        ▼                        
┌─────────────────┐      ┌─────────────────┐      
│                 │      │                 │      
│  External APIs  │      │  Media Storage  │      
│  (YouTube,etc)  │      │                 │      
│                 │      │                 │      
└─────────────────┘      └─────────────────┘      
```

### Core Technologies

#### Backend
- **NestJS**: TypeScript-based Node.js framework with modular architecture
- **PostgreSQL**: Modern, open-source relational database with excellent JSON support
- **Prisma ORM**: Type-safe database client with migrations and excellent developer experience
- **Zod**: Schema validation for backend and frontend
- **JWT**: For future authentication implementation

#### Frontend
- **Vue.js 3**: Modern JavaScript framework with the Composition API
- **Vuetify 3**: Material Design component library for Vue
- **Pinia**: State management solution (replacement for Vuex)
- **Vue Router**: Client-side routing
- **TypeScript**: For type safety throughout the application
- **Vite**: Modern, fast build tool and development server

#### Development Tools
- **PNPM**: Fast, disk-efficient package manager with workspace support
- **ESLint + Prettier**: Code formatting and linting
- **Husky + lint-staged**: Git hooks for clean code
- **Vitest**: Unit testing framework for Vue components
- **Jest**: Testing framework for the NestJS backend

#### Form Handling & Validation
- **vee-validate + yup**: Form validation for the Vue frontend
- **zod**: Schema validation for both frontend and backend

## Monorepo Structure

LyraClipMAP uses a PNPM workspace-based monorepo structure:

```
mvp/0.2/
├── client/                 # Vue.js frontend application
├── server/                 # NestJS backend application
└── package.json            # Workspace root package.json
```

### Workspace Configuration

```json
// package.json
{
  "workspaces": [
    "client",
    "server"
  ],
  "scripts": {
    "dev": "pnpm --filter client dev & pnpm --filter server dev",
    "build": "pnpm --filter client build && pnpm --filter server build",
    "start": "node server/dist/main.js",
    "test": "pnpm --filter client test && pnpm --filter server test",
    "lint": "pnpm --filter client lint && pnpm --filter server lint"
  }
}
```

## Backend Architecture

### NestJS Module Structure

```
server/
├── src/
│   ├── main.ts                # Application entry point
│   ├── app.module.ts          # Root application module
│   ├── common/                # Shared utilities and guards
│   │   ├── guards/            # Auth guards (ready for JWT)
│   │   ├── decorators/        # Custom decorators
│   │   ├── filters/           # Exception filters
│   │   └── interceptors/      # Request/response interceptors
│   ├── config/                # Application configuration
│   ├── modules/               # Feature modules
│   │   ├── songs/             # Song-related features
│   │   │   ├── controllers/   # REST endpoints
│   │   │   ├── services/      # Business logic
│   │   │   ├── dto/           # Data transfer objects
│   │   │   └── entities/      # Entities and schemas
│   │   ├── lyrics/            # Lyrics management
│   │   ├── playlists/         # Playlist management
│   │   └── users/             # User management (for future auth)
│   ├── providers/             # External service integrations
│   │   ├── youtube/           # YouTube API integration
│   │   └── lyrics-sources/    # Lyrics scraping services
│   └── prisma/                # Prisma service and client
└── prisma/                    # Prisma schema and migrations
    ├── schema.prisma          # Database schema
    └── migrations/            # Database migrations
```

### Authentication Placeholder

The backend is structured to easily add authentication later, without compromising the MVP development:

```typescript
// src/common/guards/auth.guard.ts
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Initially returns true - authentication always passes
    return true;
  }
}

// src/app.controller.ts
@UseGuards(AuthGuard) // <-- Later replace with JWTGuard
@Get('secure-data')
getSecureData() {
  return 'Only for logged users in future';
}
```

### Database Schema (Prisma)

```prisma
// prisma/schema.prisma
model User {
  id            String         @id @default(cuid())
  email         String         @unique
  password      String
  name          String?
  avatarUrl     String?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  playlists     Playlist[]
  likedSongs    SongLike[]
  likedArtists  ArtistLike[]
  preferences   UserPreference?
}

model Song {
  id             String        @id @default(cuid())
  title          String
  artistId       String
  description    String?
  duration       Int?          // Duration in seconds
  thumbnailUrl   String?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  artist         Artist        @relation(fields: [artistId], references: [id])
  audioSources   AudioSource[]
  textContents   TextContent[]
  // ... other relations
}

model TextContent {
  id            String          @id @default(cuid())
  songId        String
  content       String          @db.Text
  contentType   ContentType
  language      String?
  source        String?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  song          Song            @relation(fields: [songId], references: [id], onDelete: Cascade)
  wordTimestamps WordTimestamp[]
}

// ... other models
```

## Frontend Architecture

### Vue.js Application Structure

```
client/
├── src/
│   ├── main.ts                # Application entry point
│   ├── App.vue                # Root component
│   ├── assets/                # Static assets
│   ├── components/            # Reusable UI components
│   │   ├── player/            # Audio playback components
│   │   │   ├── WavePlayer.vue # Waveform visualization 
│   │   ├── lyrics/            # Lyrics components
│   │   │   ├── LyricsDisplay.vue  # Synchronized lyrics
│   │   ├── common/            # Shared UI components
│   │   └── layout/            # Layout components
│   ├── composables/           # Vue composition functions
│   ├── router/                # Vue Router configuration
│   ├── stores/                # Pinia stores
│   │   ├── player.ts          # Audio player state
│   │   ├── songs.ts           # Song management
│   │   ├── auth.ts            # Auth placeholder for future
│   │   └── ui.ts              # UI state management
│   ├── types/                 # TypeScript type definitions
│   │   ├── index.ts           # Core data models
│   │   ├── api.ts             # API interfaces
│   │   ├── components.ts      # Component props/emits
│   │   └── store.ts           # Store type definitions
│   └── views/                 # Page components
│       ├── Home.vue           # Home/dashboard
│       ├── SongDetail.vue     # Song details page
│       └── SongList.vue       # Song listing page
└── public/                    # Public static assets
```

### Authentication Placeholder (Frontend)

The frontend is also prepared for future authentication:

```typescript
// stores/auth.ts
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    login() {
      // In the future: send login request, receive JWT, save
    },
    logout() {
      this.user = null;
      this.token = null;
    },
  },
})
```

### State Management with Pinia

```
stores/
├── player.ts             # Audio player state
│   ├── currentSong       # Currently playing song
│   ├── playbackState     # playing/paused/stopped
│   ├── playlist          # Current playlist
│   └── actions           # play, pause, seek, etc.
├── songs.ts              # Song library management
│   ├── recentSongs       # Recently added/played songs
│   ├── popularSongs      # Most popular songs
│   └── actions           # fetch, add, update, delete
├── textContents.ts       # Lyrics management
│   ├── currentLyrics     # Currently displayed lyrics
│   └── actions           # fetch, sync, edit
├── auth.ts               # Authentication (future)
│   ├── user              # Current user
│   ├── token             # JWT token
│   └── actions           # login, logout, register
└── ui.ts                 # UI state
    ├── theme             # Light/dark mode
    ├── layout            # Layout preferences
    └── actions           # toggleTheme, etc.
```

## External Integrations

### YouTube Integration
- Extract video metadata (title, artist, thumbnail)
- Parse different URL formats
- Generate embed HTML for video playback
- Stream audio for visualization and playback

### Lyrics Sources
- **Tekstowo.pl**: Polish lyrics provider
- **Genius**: English lyrics provider
- **Musixmatch**: Multi-language lyrics provider

## Key Feature Implementation

### Audio Visualization (WavePlayer)
- Uses wavesurfer.js for audio waveform visualization
- Supports regions and markers for segmentation
- Provides time-synced playback controls
- Works with both YouTube and direct audio sources

### Synchronized Lyrics (LyricsDisplay)
- Supports both scrolling and karaoke display modes
- Line-level and word-level synchronization
- Optional translation display
- Interactive seeking by clicking on lyrics

### LRC Editor
- Manual timestamp placement
- Audio previewing and looping
- Word-level timing editing
- Automatic line splitting
- Export to LRC format

## Deployment Architecture

For the MVP, a simple deployment architecture is used:

```
┌──────────────────────────────────┐
│            Docker Host           │
│                                  │
│  ┌────────────┐   ┌────────────┐ │
│  │            │   │            │ │
│  │ Frontend   │   │  Backend   │ │
│  │ Container  │   │ Container  │ │
│  │            │   │            │ │
│  └────────────┘   └────────────┘ │
│                        │         │
│                  ┌────────────┐  │
│                  │            │  │
│                  │ PostgreSQL │  │
│                  │ Container  │  │
│                  │            │  │
│                  └────────────┘  │
└──────────────────────────────────┘
```

## Future Considerations

### Authentication Implementation
When needed, the auth placeholders can be replaced with a full JWT authentication system:

1. Add JWT validation to the `AuthGuard`
2. Implement login, register, and token refresh endpoints
3. Update the auth store to manage JWT tokens
4. Add protected routes in the frontend

### Performance Optimizations
- Server-side rendering for SEO and faster initial load
- Progressive Web App capabilities
- Waveform data pre-generation
- Lyrics indexing for faster search

### Additional Features
- Social features (comments, sharing)
- Public API for third-party integration
- Mobile application
- Offline mode

### Scalability
- Horizontal scaling of NestJS backend
- Database sharding for larger collections
- CDN integration for media assets
- Caching layer (Redis)