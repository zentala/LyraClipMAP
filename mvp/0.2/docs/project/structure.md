# LyraClipMAP Project Structure

This document provides a detailed overview of the project structure for the LyraClipMAP v0.2 implementation, which uses Vue.js for the frontend and NestJS for the backend.

## Repository Structure

```
LyraClipMAP/
├── mvp/
│   ├── 0.1/                           # Original Flask implementation
│   └── 0.2/                           # TypeScript implementation
│       ├── client/                    # Vue.js frontend
│       ├── server/                    # NestJS backend
│       ├── package.json               # Workspace root package.json
│       ├── README.md                  # Project overview
│       ├── ARCHITECTURE.md            # Architecture documentation
│       ├── CONSISTENCY.md             # Naming conventions
│       ├── LANG.md                    # Ubiquitous language
│       ├── TECHNICAL_DETAILS.md       # Technical implementation details
│       ├── STYLE.md                   # Style guide
│       ├── UI.xml                     # UI component designs
│       └── PROJECT_STRUCTURE.md       # This file
├── LICENSE
└── README.md
```

## Client Structure (Vue.js)

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
│   │   └── index.ts           # Routes definition
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
├── public/                    # Public static assets
├── package.json               # Package dependencies
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite configuration
└── .env.example               # Example environment variables
```

## Server Structure (NestJS)

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
├── prisma/                    # Prisma schema and migrations
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── test/                      # End-to-end tests
├── package.json               # Package dependencies
├── tsconfig.json              # TypeScript configuration
└── .env.example               # Example environment variables
```

## Component Structure

### Client Components

#### WavePlayer Component

```vue
<!-- src/components/player/WavePlayer.vue -->
<template>
  <div class="wave-player">
    <div class="wave-container" ref="waveContainer"></div>
    
    <div v-if="showControls" class="player-controls d-flex align-center mt-2">
      <v-btn icon :color="isPlaying ? 'primary' : undefined" @click="togglePlay">
        <v-icon>{{ isPlaying ? 'mdi-pause' : 'mdi-play' }}</v-icon>
      </v-btn>
      
      <div class="time-display text-caption mx-2">
        {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
      </div>
      
      <v-slider v-model="sliderPosition" class="mx-2 flex-grow-1" hide-details density="compact" 
               color="primary" @update:modelValue="onSliderChange"></v-slider>
      
      <v-btn icon @click="toggleMute">
        <v-icon>{{ isMuted ? 'mdi-volume-off' : volume > 0.5 ? 'mdi-volume-high' : 'mdi-volume-medium' }}</v-icon>
      </v-btn>
      
      <v-slider v-model="volume" class="mx-2" max="1" step="0.01" hide-details density="compact" 
               color="primary" style="max-width: 100px" @update:modelValue="onVolumeChange"></v-slider>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import { WavePlayerProps, WavePlayerEmits } from '@/types/components';
import WaveSurfer from 'wavesurfer.js';
// Rest of component implementation...
</script>
```

#### LyricsDisplay Component

```vue
<!-- src/components/lyrics/LyricsDisplay.vue -->
<template>
  <div class="lyrics-display">
    <div class="lyrics-container" :class="{ 'karaoke-mode': displayMode === 'karaoke' }" ref="lyricsContainer">
      <div v-if="lines.length === 0" class="no-lyrics text-center py-8">
        <v-icon size="x-large" class="mb-2">mdi-text</v-icon>
        <div>No synchronized lyrics available</div>
      </div>
      
      <template v-else>
        <div v-for="(line, index) in lines" :key="index" class="lyric-line"
             :class="{ 'active': currentLineIndex === index, 'past': index < currentLineIndex }"
             :id="`line-${index}`" @click="onLineClick(line)">
          <!-- Line content implementation -->
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue';
import { LyricsDisplayProps, LyricsDisplayEmits } from '@/types/components';
import { LRCLine } from '@/types/index';
// Rest of component implementation...
</script>
```

### Pinia Store Example

```typescript
// src/stores/player.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Song, TextContent, AudioSource, AudioAnalysis, LRCLine } from '@/types/index';
import { PlayerStore } from '@/types/store';

export const usePlayerStore = defineStore('player', (): PlayerStore => {
  // State
  const currentSong = ref<Song | null>(null);
  const playbackState = ref<'playing' | 'paused' | 'stopped' | 'loading' | 'error'>('stopped');
  const currentTime = ref(0);
  const duration = ref(0);
  
  // Getters
  const isPlaying = computed(() => playbackState.value === 'playing');
  const progress = computed(() => (currentTime.value / duration.value) * 100);
  
  // Actions
  const playSong = async (song: Song) => {
    // Implementation...
  };
  
  const togglePlay = () => {
    // Implementation...
  };
  
  // Return store
  return {
    // State
    currentSong,
    playbackState,
    currentTime,
    duration,
    // ...other state properties
    
    // Getters
    isPlaying,
    progress,
    // ...other getters
    
    // Actions
    playSong,
    togglePlay,
    // ...other actions
  };
});
```

## Server Module Structure Example

```typescript
// src/modules/songs/controllers/songs.controller.ts
import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SongsService } from '../services/songs.service';
import { CreateSongDto } from '../dto/create-song.dto';
import { AuthGuard } from '../../../common/guards/auth.guard';

@Controller('songs')
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string
  ) {
    return this.songsService.findAll({ page, limit, search });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.songsService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard) // Currently allows all requests, will be replaced with real JWT auth later
  async create(@Body() createSongDto: CreateSongDto) {
    return this.songsService.create(createSongDto);
  }
  
  // Additional endpoints...
}
```

## Database Schema

```prisma
// prisma/schema.prisma
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

// Additional models...
```

## API Routes

```
GET    /api/songs                # Get paginated list of songs
GET    /api/songs/:id            # Get song by ID
POST   /api/songs                # Create a new song
PATCH  /api/songs/:id            # Update a song
DELETE /api/songs/:id            # Delete a song

GET    /api/text-contents        # Get all text contents
POST   /api/text-contents        # Create a new text content
GET    /api/text-contents/:id    # Get text content by ID
PATCH  /api/text-contents/:id    # Update a text content
DELETE /api/text-contents/:id    # Delete a text content

POST   /api/lyrics/search        # Search for lyrics by artist and title

POST   /api/youtube/info         # Extract info from YouTube URL

// Authentication endpoints (placeholder for future implementation)
POST   /api/auth/register        # Register a new user
POST   /api/auth/login           # Log in a user
GET    /api/auth/profile         # Get the current user's profile
```

## Development Workflow

### Local Development

1. Start both frontend and backend concurrently:
   ```bash
   cd mvp/0.2
   pnpm dev
   ```

2. Run frontend only:
   ```bash
   cd mvp/0.2
   pnpm --filter client dev
   ```

3. Run backend only:
   ```bash
   cd mvp/0.2
   pnpm --filter server dev
   ```

4. Running tests:
   ```bash
   # Frontend tests
   cd mvp/0.2
   pnpm --filter client test
   
   # Backend tests
   cd mvp/0.2
   pnpm --filter server test
   ```

### Code Linting

```bash
# Lint all code
cd mvp/0.2
pnpm lint

# Lint only client code
cd mvp/0.2
pnpm --filter client lint

# Lint only server code
cd mvp/0.2
pnpm --filter server lint
```

## Building for Production

```bash
# Build both client and server
cd mvp/0.2
pnpm build

# Build only client
cd mvp/0.2
pnpm --filter client build

# Build only server
cd mvp/0.2
pnpm --filter server build
```

This project structure is designed for maintainability, scalability, and developer experience, with clear separation of concerns between frontend and backend components.