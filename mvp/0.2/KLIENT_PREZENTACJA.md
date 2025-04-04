# LyraClipMAP - Prezentacja projektu

## Przegląd projektu

LyraClipMAP to nowoczesna aplikacja webowa do zarządzania biblioteką muzyczną z synchronizowanymi tekstami piosenek. Projekt umożliwia organizację piosenek wraz z ich tekstami, odtwarzanie muzyki bezpośrednio z YouTube, zaawansowaną wizualizację audio i karaoke w trybie rzeczywistym.

## Kluczowe funkcje

### Zarządzanie biblioteką muzyczną
- Dodawanie, edycja i organizacja piosenek z metadanymi
- Automatyczne pobieranie tekstów z różnych źródeł (Tekstowo.pl, Genius, Musixmatch)
- Wyszukiwanie w całej bibliotece (po tytule, artyście lub tekście)
- Tworzenie i zarządzanie playlistami

### Integracja z YouTube
- Automatyczne wyodrębnianie metadanych z linków YouTube
- Wbudowany odtwarzacz YouTube
- Pobieranie miniatur i informacji o utworach

### Wizualizacja audio i synchronizacja tekstu
- Wizualizacja waveform audio z wavesurfer.js
- Karaoke z synchronizowanym tekstem (podświetlanie na poziomie linii i słów)
- Edytor synchronizacji tekstów z audio
- Obsługa formatu LRC do zapisywania i wczytywania synchronizowanych tekstów

### Nowoczesny interfejs
- Responsywny i intuicyjny interfejs zbudowany z Vue.js i Vuetify
- Wsparcie dla trybu ciemnego
- Dostosowane komponenty dla odtwarzacza audio i wyświetlania tekstów

## Zrzuty ekranu i wizualizacje interfejsu

### Ekran główny
![Ekran główny](https://via.placeholder.com/800x450?text=Ekran+główny)

Ekran główny zawiera:
- Ostatnio dodane piosenki
- Popularne utwory
- Playlisty użytkownika
- Szybki dostęp do wyszukiwania

### Szczegóły piosenki
![Szczegóły piosenki](https://via.placeholder.com/800x450?text=Szczegóły+piosenki)

Ekran szczegółów piosenki oferuje:
- Odtwarzacz wbudowany (YouTube lub audio)
- Wizualizację waveform
- Synchronizowany tekst w trybie karaoke
- Informacje o utworze

### Dodawanie nowej piosenki
![Dodawanie piosenki](https://via.placeholder.com/800x450?text=Dodawanie+piosenki)

Formularz dodawania piosenki umożliwia:
- Wprowadzenie linku do YouTube
- Automatyczne pobranie metadanych
- Dodanie lub wyszukanie tekstu piosenki
- Ustawienie podstawowych informacji

### Edytor synchronizacji
![Edytor synchronizacji](https://via.placeholder.com/800x450?text=Edytor+synchronizacji)

Edytor synchronizacji pozwala na:
- Precyzyjne ustawienie czasu dla każdej linii tekstu
- Podgląd waveform audio dla dokładnego oznaczania czasu
- Automatyczne generowanie timingów
- Podgląd efektu w czasie rzeczywistym

## Technologie

### Frontend
- **Vue.js 3** z Composition API
- **Vuetify 3** dla komponentów Material Design
- **Pinia** do zarządzania stanem
- **TypeScript** dla bezpieczeństwa typów
- **wavesurfer.js** do wizualizacji audio

### Backend
- **NestJS** (framework TypeScript dla Node.js)
- **PostgreSQL** jako baza danych
- **Prisma ORM** do komunikacji z bazą danych
- **REST API** z automatyczną dokumentacją Swagger

## Przykłady komponentów

### WavePlayer
Zaawansowany odtwarzacz audio z wizualizacją waveform:

```vue
<WavePlayer 
  :audio-url="audioSource.url"
  :waveform-data="waveformData"
  :options="{
    waveColor: '#A0AEC0',
    progressColor: '#6200EA',
    cursorColor: '#03DAC6'
  }"
  :show-controls="true"
  :show-timeline="true"
  @play="onPlayerPlay"
  @timeupdate="onPlayerTimeUpdate"
/>
```

### LyricsDisplay
Komponent do wyświetlania synchronizowanych tekstów:

```vue
<LyricsDisplay
  :lines="parsedLyrics"
  :current-time="currentTime"
  :options="{
    displayMode: 'karaoke',
    highlightColor: '#6200EA',
    autoScroll: true,
    showTranslation: true
  }"
  :translation="parsedTranslation"
  @line-click="seekToTime"
/>
```

## Harmonogram wdrożenia

1. **MVP 0.1** (bieżąca wersja w Python/Flask)
   - Podstawowa funkcjonalność ✓
   - Integracja z YouTube ✓
   - Proste wyszukiwanie ✓

2. **MVP 0.2** (planowana wersja w TypeScript)
   - Nowoczesny stack technologiczny (Vue.js + NestJS) ⟳
   - Wizualizacja audio ⟳
   - Synchronizacja tekstów ⟳
   - Zaawansowane wyszukiwanie ⟳

3. **Wersja 1.0**
   - Pełna funkcjonalność z autoryzacją użytkowników
   - Zaawansowane funkcje społecznościowe
   - Aplikacja mobilna
   - API dla deweloperów

## Korzyści biznesowe

1. **Unikalne doświadczenie użytkownika**
   - Wizualizacja audio i synchronizacja tekstu wyróżniają aplikację
   - Intuicyjny interfejs przyciąga i zatrzymuje użytkowników

2. **Elastyczna architektura**
   - Modułowa struktura umożliwia łatwe dodawanie nowych funkcji
   - Skalowalność dla rosnącej bazy użytkowników

3. **Technologie przyszłościowe**
   - Wykorzystanie najnowszych frameworków i bibliotek
   - Łatwość utrzymania i rozwijania aplikacji

## Następne kroki

1. Potwierdzenie specyfikacji projektu
2. Uzgodnienie ostatecznych szczegółów interfejsu
3. Rozpoczęcie implementacji MVP 0.2
4. Regularne dema postępu prac
5. Testy i wdrożenie