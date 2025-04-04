# LyraClipMAP

## Wersja: 0.2.0

LyraClipMAP to aplikacja do synchronizacji tekstu z muzyką, która pozwala na tworzenie i zarządzanie wizualizacjami tekstu zintegrowanymi z utworami muzycznymi.

## Główne funkcje

- 🎵 Import utworów ze Spotify
- 📝 Konwersja tekstu do formatu LRC
- 🎨 Generowanie wizualizacji tekstu
- 👥 System użytkowników i playlist
- 🎯 Precyzyjna synchronizacja tekstu z muzyką

## Dokumentacja

Dokumentacja projektu została podzielona na trzy główne sekcje:

### 1. Dokumentacja ogólna (`/docs`)
- [Przegląd dokumentacji](docs/README.md)
- [Architektura systemu](docs/architecture/overview.md)
- [Przepływ danych](docs/architecture/data-flow.md)
- [Konfiguracja środowiska](docs/development/setup.md)

### 2. Dokumentacja backendu (`/backend/docs`)
- [TODO i plan rozwoju](backend/docs/TODO.md)
- [Dokumentacja API](backend/docs/api/api-documentation.md)
- [Szczegóły techniczne](backend/docs/technical/technical-details.md)
- [Struktura danych](backend/docs/data/data-structure.md)

### 3. Dokumentacja frontendu (`/frontend/docs`)
- [Interfejs użytkownika](frontend/docs/ui/ui.xml)
- [Doświadczenie użytkownika](frontend/docs/ux/ux.xml)
- [Style i wygląd](frontend/docs/ui/style.md)
- [Walidacja formularzy](frontend/docs/ux/form-validation.md)

## Szybki start

1. Sklonuj repozytorium
2. Zainstaluj zależności:
   ```bash
   pnpm install
   ```
3. Skonfiguruj środowisko:
   ```bash
   cp .env.example .env
   # Edytuj .env z odpowiednimi wartościami
   ```
4. Uruchom aplikację:
   ```bash
   # Backend
   cd backend
   pnpm start:dev

   # Frontend
   cd frontend
   pnpm dev
   ```

Szczegółowe instrukcje znajdziesz w [dokumentacji](docs/development/setup.md).

## Status projektu

Aktualny status projektu i plan rozwoju znajdziesz w [VERSION.md](docs/VERSION.md).

## Licencja

MIT

## Kontakt

W przypadku pytań lub sugestii, prosimy o kontakt z zespołem deweloperskim.

## 📦 Overview
**LyraClipMAP** is an intelligent app for working with music and lyrics. It allows you to:

- Search songs by text fragments (even if you don't know the title)
- See the structure of a track as a visual map
- Synchronize lyrics with audio and highlight emotional moments
- Clip and tag audio segments for later playback or sharing
- Create collections and storyboards from chosen parts of songs

## 🎯 Core Features (MVP)

1. **🔍 Lyrics Search**  
   – Find songs by words, lines, or emotional themes.

2. **📈 Visual Track Map (ClipMAP)**  
   – Shows loudness, tempo, mood, and lyrics over time.

3. **✂️ Clipping and Tagging**  
   – Mark segments, name them, add notes or color tags.

4. **🎶 Audio-Lyrics Sync**  
   – Karaoke-style sync, automatic or manual.

5. **📁 Clip Collections & Playlists**  
   – Build emotional stories from your favorite parts.

6. **📤 Export / Share**  
   – Share clips and maps with others.

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- pip (Python package manager)
- Python virtual environment package (for isolated dependencies)

### Installation & Running (Recommended Method)

```bash
# 1. Clone the repository
git clone https://github.com/zentala/LyraClipMAP.git
cd LyraClipMAP

# 2. Install virtual environment package if you don't have it
sudo apt install python3-venv python3-full -y

# 3. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Run the application
PYTHONPATH=/home/zentala/code/LyraClipMAP python3 app/main.py
# Or use your actual path to the project:
# PYTHONPATH=/path/to/LyraClipMAP python3 app/main.py

# 6. Open your browser and navigate to http://localhost:8000
```

### Alternative Methods

**Running directly (not recommended in newer Python versions)**
```bash
# Install dependencies globally (may require --break-system-packages flag on newer systems)
pip install -r requirements.txt --break-system-packages

# Run the application
PYTHONPATH=/path/to/LyraClipMAP python3 app/main.py
```

**Using pipx (for application-style installation)**
```bash
# Install pipx if you don't have it
sudo apt install pipx

# Use pipx to run the application in an isolated environment
pipx run --spec -r requirements.txt flask run -p 8000 -h 0.0.0.0
```

## 🧰 Current Functionality

- Add songs with YouTube URLs (e.g., https://www.youtube.com/watch?v=PR_eYLKPmko)
- Auto-fetch lyrics from tekstowo.pl
- Search through lyrics, song titles, and artists
- View songs with embedded YouTube players

## 📊 Database Structure

- **Songs**: Titles and artists
- **Text Content**: Lyrics, translations (with language tags)
- **Audio Sources**: YouTube links (expandable to other sources)
- **Word Timestamps**: For future word-level synchronization

## 🖼️ User Flow

1. **Home**
   - 🔍 Search bar
   - 🎧 Recently played
   - 📂 User collections

2. **Track View**
   - 🧠 Audio map with lyrics, waveform, emotion colors
   - 🎤 Synced lyrics display
   - ✂️ Clipping tool

3. **Clip Editor**
   - Title, tags, color, note
   - 🎚️ Length & cut options
   - ⏳ Time markers and mood labels

4. **Collection / Storyboard**
   - 📋 Clip list with descriptions
   - ▶️ Play montage mode
   - 📤 Export options

## 🌱 Future Development

- Word-to-timestamp mapping using auto-transcription
- Support for more lyrics sources
- Better YouTube title parsing
- Multiple audio source types
- AI-powered tagging of emotion and lyrical themes
- Community: shared clips and collaborative maps
- Compare versions: covers, remixes, and live edits
- Export to TikTok / Instagram / Reels
- Expand to podcasts and spoken word content

## 📝 License
[MIT](LICENSE)

## 📧 Contact
Your Name – [@yourhandle](https://twitter.com/yourhandle) – your.email@example.com

Project Link: [https://github.com/zentala/LyraClipMAP](https://github.com/zentala/LyraClipMAP)

## 🧪 Testing

### Backend Tests

The backend uses Jest for testing. To run the tests:

```bash
# Install dependencies
cd backend
pnpm install

# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:cov

# Run e2e tests
pnpm test:e2e
```

Test files are located in:
- Unit tests: `backend/src/**/*.spec.ts`
- E2E tests: `backend/test/**/*.e2e-spec.ts`

### Test Structure

The tests cover:
- Authentication (register, login, token refresh)
- Guards and interceptors
- Validators and pipes
- Services and controllers
- Database operations
- Error handling

## 💾 Database Setup

The project uses Prisma ORM with PostgreSQL. Follow these steps to set up the database:

1. Make sure you have PostgreSQL installed and running
```bash
# On Ubuntu/Debian
sudo apt install postgresql
sudo systemctl start postgresql
```

2. Create a new database
```bash
sudo -u postgres psql
postgres=# CREATE DATABASE lyraclipmap;
postgres=# \q
```

3. Set up environment variables - create `.env` file in the `backend` directory:
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lyraclipmap"
JWT_SECRET="your-secret-key"
```

4. Run database migrations
```bash
cd backend
pnpm prisma:generate   # Generate Prisma Client
pnpm prisma:migrate    # Run migrations
```

5. (Optional) Open Prisma Studio to manage your data
```bash
pnpm prisma:studio
```