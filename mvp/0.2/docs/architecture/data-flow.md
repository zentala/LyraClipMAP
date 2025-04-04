# Przepływ danych

## Wersja dokumentu: 0.2.0

## Przepływy danych w systemie

### 1. Autentykacja i autoryzacja
```mermaid
graph TD
    A[Użytkownik] -->|Rejestracja| B[Auth Service]
    B -->|Hash hasła| C[Baza danych]
    A -->|Logowanie| B
    B -->|Weryfikacja| C
    B -->|Token JWT| A
```

### 2. Import utworów
```mermaid
graph TD
    A[Użytkownik] -->|Wybór utworu| B[Spotify API]
    B -->|Dane utworu| C[Lyrics Service]
    C -->|Konwersja tekstu| D[LRC Generator]
    D -->|Zapis| E[Baza danych]
```

### 3. Generowanie wizualizacji
```mermaid
graph TD
    A[Audio] -->|Analiza| B[Audio Analyzer]
    B -->|Dane| C[Visualization Generator]
    C -->|Render| D[Canvas]
    D -->|Zapis| E[Baza danych]
```

## Modele danych

### User
```typescript
interface User {
  id: string;
  email: string;
  password: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Song
```typescript
interface Song {
  id: string;
  title: string;
  artist: string;
  spotifyId: string;
  lyrics: string;
  lrc: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Visualization
```typescript
interface Visualization {
  id: string;
  songId: string;
  type: string;
  data: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Relacje w bazie danych

### One-to-Many
- User -> Songs
- User -> Visualizations
- Song -> Visualizations

### Many-to-Many
- Songs <-> Tags
- Users <-> Playlists

## Cache
- Redis dla tokenów
- Cache dla wyników wizualizacji
- Cache dla wyników wyszukiwania 