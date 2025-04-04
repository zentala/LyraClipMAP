# LyraClipMAP v0.2

## Overview

LyraClipMAP is a web application for managing your music collection with synchronized lyrics. This project helps you organize songs with their lyrics, allowing you to search through your collection, play songs directly from YouTube, and manage your personal music database with karaoke-style synchronized lyrics.

## Core Features

- **Music Management**: Add, edit, and organize your song collection with metadata
- **Multi-source Lyrics**: Automatic lyrics fetching from various sources (Tekstowo.pl, Genius, Musixmatch)
- **YouTube Integration**: Extract metadata and embed videos directly from YouTube links
- **Audio Visualization**: Waveform visualization with wavesurfer.js for an enhanced audio experience
- **Synchronized Lyrics**: Karaoke-style synchronized lyrics display with line and word-level timing
- **Search Functionality**: Full-text search through your music library and lyrics
- **Modern Interface**: Responsive and intuitive user interface with Vuetify components

## Tech Stack

### Backend
- **NestJS**: TypeScript-based Node.js framework with modular architecture
- **PostgreSQL**: Modern, open-source relational database
- **Prisma ORM**: Type-safe database client with migrations and excellent developer experience
- **JWT**: Authentication (prepared for future implementation)

### Frontend
- **Vue.js 3**: Modern JavaScript framework with the Composition API
- **Vuetify 3**: Material Design component library for Vue
- **Pinia**: State management solution
- **TypeScript**: For type safety throughout the application
- **Vite**: Fast build tool and development server

### Form Handling & Validation
- **vee-validate + yup**: Form validation for the Vue frontend
- **zod**: Schema validation for both frontend and backend

### Development Tools
- **PNPM**: Package manager with workspace support
- **ESLint + Prettier**: Code formatting and linting
- **Vitest**: Unit testing framework

## Project Structure

```
mvp/0.2/
├── client/              # Vue.js frontend application
├── server/              # NestJS backend application
├── ARCHITECTURE.md      # Architecture documentation
├── TECHNICAL_DETAILS.md # Technical implementation details
├── CONSISTENCY.md       # Naming conventions and consistency guidelines
├── LANG.md              # Ubiquitous language definitions
└── package.json         # Root package.json for PNPM workspace
```

## Getting Started

### Prerequisites
- Node.js 16+
- PostgreSQL 14+
- PNPM 7+
- Docker (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/LyraClipMAP.git
cd LyraClipMAP/mvp/0.2
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

4. Set up the database:
```bash
cd server
pnpm prisma migrate dev
```

5. Start the development servers:
```bash
# From the root directory (mvp/0.2)
pnpm dev
```

6. Visit `http://localhost:5173` in your browser to see the application.

## Documentation

- [Architecture Overview](./ARCHITECTURE.md) - System architecture and design
- [Technical Details](./TECHNICAL_DETAILS.md) - Implementation details and technical specifications
- [Consistency Guide](./CONSISTENCY.md) - Naming conventions and consistency standards
- [Ubiquitous Language](./LANG.md) - Domain language definitions for the project

## Key Components

### WavePlayer
Audio player with waveform visualization using wavesurfer.js. Supports playback controls, regions, and markers for synchronized lyrics.

### LyricsDisplay
Component for displaying synchronized lyrics with support for scroll and karaoke modes, word-level highlighting, and translations.

### SongDetail
Comprehensive view for song details, integrating the YouTube player, waveform visualization, and synchronized lyrics display.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.