# LyraClipMAP - Struktura Danych

## Główne modele danych

### Artyści (Artist)
- Osobna tabela dla artystów, co pozwala na grupowanie utworów wg wykonawcy
- Jeden artysta może mieć wiele utworów (relacja jeden-do-wielu)
- Każdy artysta ma unikalne ID, nazwę, opcjonalny opis i zdjęcie
- Możliwość "polubienia" artysty przez użytkownika

### Utwory (Song)
- Centralna jednostka danych w aplikacji
- Każdy utwór przypisany jest do konkretnego artysty (relacja wiele-do-jednego)
- Zawiera podstawowe dane: tytuł, opis, czas trwania, miniaturkę
- Utwory mogą być dodawane do playlist i oznaczane tagami

### Źródła audio (AudioSource)
- Reprezentuje link do źródła audio utworu (YouTube, Spotify, itd.)
- Jeden utwór może mieć wiele źródeł audio (np. kilka wersji na YouTube)
- Jedno źródło może być oznaczone jako główne (isMain)
- Zawiera typ źródła (zdefiniowany przez enum SourceType)

### Treści tekstowe (TextContent)
- Przechowuje różne rodzaje treści tekstowych związanych z utworem
- Typy treści zdefiniowane przez enum ContentType:
  - LYRICS - tekst piosenki
  - TRANSLATION - tłumaczenie tekstu
  - TRANSCRIPTION - transkrypcja
  - DESCRIPTION - opis
  - CHORDS - akordy
  - SHEET_MUSIC - nuty
- Każda treść ma określony język
- Jeden utwór może mieć wiele treści (np. tekst oryginalny + tłumaczenie)

### Znaczniki czasowe słów (WordTimestamp)
- Pozwala na synchronizację poszczególnych słów z muzyką
- Zawiera słowo, czas początkowy i końcowy w sekundach
- Powiązany zarówno z utworem jak i treścią tekstową

### Playlisty (Playlist)
- Umożliwia grupowanie utworów przez użytkownika
- Zawiera nazwę, opis i informację o prywatności
- Powiązana z konkretnym użytkownikiem

### Tagi (Tag)
- Pozwala na kategoryzację utworów
- Relacja wiele-do-wielu między utworami a tagami

## Przykładowe scenariusze

### Jeden utwór - wielu artystów
Jeśli utwór wykonuje kilku artystów (np. feat. lub duet), możliwe są dwa podejścia:

1. **Główny artysta + informacja w tytule**:
   - Utwór jest przypisany do głównego artysty (artistId)
   - W tytule dodajemy informację o współpracy, np. "Tytuł (feat. Artysta2)"

2. **Użycie tagów do oznaczenia współpracujących artystów**:
   - Utwór jest przypisany do głównego artysty
   - Dodatkowi artyści są oznaczeni tagami

### Wiele wersji tego samego utworu
Jeśli mamy kilka wersji tego samego utworu (np. studio, live, remix):

1. **Osobne rekordy Song**:
   - Każda wersja ma własny rekord w tabeli Song
   - Tytuły mogą zawierać rozróżnienie, np. "Tytuł (Live)", "Tytuł (Remix)"
   - Można użyć tagów do grupowania wersji (np. tag "remix", "live")

2. **Wiele źródeł audio dla jednego utworu**:
   - Jeden rekord Song
   - Różne wersje zapisane jako oddzielne AudioSource
   - Jedno źródło oznaczone jako główne (isMain = true)

### Różne treści tekstowe
Aplikacja obsługuje różne rodzaje treści tekstowych:

- **Oryginalny tekst piosenki**: ContentType.LYRICS, language = "en" (lub inny)
- **Tłumaczenie**: ContentType.TRANSLATION, language = "pl"
- **Transkrypcja**: ContentType.TRANSCRIPTION, language = "en"
- **Akordy**: ContentType.CHORDS
- **Nuty**: ContentType.SHEET_MUSIC

### Społecznościowe funkcje
Aplikacja zawiera elementy społecznościowe:

- **Polubienia utworów**: tabela SongLike
- **Polubienia artystów**: tabela ArtistLike
- **Publiczne playlisty**: parametr isPublic w tabeli Playlist

## Schemat relacji

```
User 1--* Playlist
User 1--* SongLike
User 1--* ArtistLike
User 1--1 UserPreference

Artist 1--* Song
Artist *--* User (poprzez ArtistLike)

Song 1--* AudioSource
Song 1--* TextContent
Song 1--* WordTimestamp
Song *--* User (poprzez SongLike)
Song *--* Playlist (poprzez PlaylistSong)
Song *--* Tag (poprzez SongTag)

TextContent 1--* WordTimestamp
```

## Przykładowe dane

### Artysta
```json
{
  "id": "artist123",
  "name": "Pink Floyd",
  "description": "Brytyjski zespół rockowy założony w 1965 roku.",
  "imageUrl": "https://example.com/pinkfloyd.jpg",
  "createdAt": "2023-06-14T10:30:00Z",
  "updatedAt": "2023-06-14T10:30:00Z"
}
```

### Utwór
```json
{
  "id": "song456",
  "title": "Wish You Were Here",
  "artistId": "artist123",
  "description": "Tytułowy utwór z albumu z 1975 roku.",
  "duration": 334,
  "thumbnailUrl": "https://example.com/wishyouwerehere.jpg",
  "createdAt": "2023-06-14T10:35:00Z",
  "updatedAt": "2023-06-14T10:35:00Z"
}
```

### Źródło audio
```json
{
  "id": "audiosource789",
  "songId": "song456",
  "url": "https://www.youtube.com/watch?v=IXdNnw99-Ic",
  "sourceType": "YOUTUBE",
  "isMain": true,
  "createdAt": "2023-06-14T10:40:00Z",
  "updatedAt": "2023-06-14T10:40:00Z"
}
```

### Treść tekstowa
```json
{
  "id": "text101",
  "songId": "song456",
  "content": "So, so you think you can tell...",
  "contentType": "LYRICS",
  "language": "en",
  "source": "tekstowo.pl",
  "createdAt": "2023-06-14T10:45:00Z",
  "updatedAt": "2023-06-14T10:45:00Z"
}
```

### Znacznik czasowy słowa
```json
{
  "id": "timestamp001",
  "songId": "song456",
  "textContentId": "text101",
  "word": "So,",
  "startTime": 67.5,
  "endTime": 68.2,
  "createdAt": "2023-06-14T10:50:00Z",
  "updatedAt": "2023-06-14T10:50:00Z"
}
```