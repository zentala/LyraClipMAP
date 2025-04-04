# Wizualizacja Audio i Synchronizacja Tekstu w LyraClipMAP

## Założenia architektoniczne

Aby zrealizować zaawansowaną wizualizację audio (wykresy głośności) i synchronizację tekstów (napisy do muzyki), proponuję następujące rozszerzenia systemu:

## 1. Analiza Audio

### Nowe modele danych

```prisma
model AudioAnalysis {
  id            String           @id @default(cuid())
  songId        String           @unique
  song          Song             @relation(fields: [songId], references: [id], onDelete: Cascade)
  waveformData  String           @db.Text  // JSON string zawierający dane falowe
  loudnessData  String           @db.Text  // JSON string z danymi o głośności
  beatsData     String?          @db.Text  // JSON string z oznaczeniami rytmicznymi
  duration      Float            // Czas trwania w sekundach
  sampleRate    Int              // Częstotliwość próbkowania
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt
  segments      AudioSegment[]
}

model AudioSegment {
  id            String        @id @default(cuid())
  analysisId    String
  analysis      AudioAnalysis @relation(fields: [analysisId], references: [id], onDelete: Cascade)
  startTime     Float         // Czas początkowy segmentu w sekundach
  endTime       Float         // Czas końcowy segmentu w sekundach
  loudness      Float         // Poziom głośności (dB)
  type          SegmentType   // Typ segmentu (np. refren, zwrotka)
  confidence    Float         // Pewność klasyfikacji (0-1)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

enum SegmentType {
  INTRO
  VERSE
  CHORUS
  BRIDGE
  OUTRO
  INSTRUMENTAL
  SOLO
  UNKNOWN
}
```

### Proces generowania danych

1. **Ekstrakcja waveformy**:
   - Po dodaniu utworu, automatycznie pobieramy audio (np. z YouTube)
   - Używamy FFT (Fast Fourier Transform) do analizy sygnału audio
   - Generujemy dane o falach dźwiękowych w formacie JSON
   - Zapisujemy dane w modelu AudioAnalysis

2. **Analiza głośności**:
   - Obliczamy RMS (Root Mean Square) dla krótkich fragmentów audio
   - Identyfikujemy dynamikę utworu (ciche/głośne fragmenty)
   - Wykrywamy punkty przełomowe (np. początek refrenu)

3. **Wykrywanie rytmu i segmentów**:
   - Identyfikujemy uderzenia (beats) i tempo
   - Dzielimy utwór na segmenty (zwrotki, refreny itp.)
   - Generujemy model AudioSegment dla każdego wykrytego segmentu

## 2. Synchronizacja tekstu

### Rozszerzenie istniejącego modelu WordTimestamp

```prisma
model WordTimestamp {
  id            String      @id @default(cuid())
  songId        String
  textContentId String
  word          String
  startTime     Float       // Czas początkowy w sekundach
  endTime       Float       // Czas końcowy w sekundach
  confidence    Float       @default(0.8) // Pewność synchronizacji
  isManualSync  Boolean     @default(false) // Czy synchronizacja ręczna
  segment       String?     // Identyfikator segmentu (np. "verse1", "chorus")
  fontSize      Float?      // Opcjonalny rozmiar czcionki dla efektów
  emphasis      Int?        @default(0) // Poziom wyróżnienia (0-5)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  song          Song        @relation(fields: [songId], references: [id], onDelete: Cascade)
  textContent   TextContent @relation(fields: [textContentId], references: [id], onDelete: Cascade)
}

model LineTimestamp {
  id            String      @id @default(cuid())
  songId        String
  textContentId String
  lineNumber    Int         // Numer linii tekstu
  text          String      // Tekst całej linii
  startTime     Float       // Czas początkowy w sekundach
  endTime       Float       // Czas końcowy w sekundach 
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  song          Song        @relation(fields: [songId], references: [id], onDelete: Cascade)
  textContent   TextContent @relation(fields: [textContentId], references: [id], onDelete: Cascade)
}
```

### Metody synchronizacji

1. **Automatyczna synchronizacja tekstów**:
   - Wykorzystanie API rozpoznawania mowy (np. Google Cloud Speech-to-Text)
   - Mapowanie wyników rozpoznawania na tekst utworu
   - Automatyczne generowanie WordTimestamp i LineTimestamp

2. **Półautomatyczna synchronizacja**:
   - Generator oparty o analitykę audio i wykrywanie pauz
   - GUI do korekty synchronizacji z wizualizacją waveformy

3. **Ręczna synchronizacja**:
   - Edytor timeline do ręcznego ustawiania znaczników czasu
   - Opcja zaznaczania i synchronizacji większych fragmentów tekstu

## 3. Interfejs użytkownika

### Wizualizacja audio

1. **Wave Player**:
   - Interaktywny komponent wyświetlający waveformę audio
   - Możliwość nawigacji przez kliknięcie dowolnego miejsca wykresu
   - Podświetlanie aktualnie odtwarzanego fragmentu
   - Kolorowanie waveformy na podstawie głośności/energii

```vue
<template>
  <v-card class="wave-player pa-2">
    <div class="wave-container" ref="waveContainer">
      <!-- Wizualizacja waveformy -->
      <div 
        v-for="(segment, index) in waveSegments" 
        :key="index"
        class="wave-segment"
        :style="{
          height: `${segment.amplitude * 100}%`,
          backgroundColor: getSegmentColor(segment),
          left: `${segment.position * 100}%`,
          width: `${segment.width * 100}%`
        }"
        @click="seekToPosition(segment.position)"
      ></div>
      
      <!-- Wskaźnik aktualnej pozycji -->
      <div class="playhead" :style="{ left: `${playPosition * 100}%` }"></div>
    </div>
    
    <!-- Oznaczenia segmentów -->
    <div class="segment-markers">
      <div 
        v-for="segment in audioSegments" 
        :key="segment.id"
        class="segment-marker"
        :style="{
          left: `${(segment.startTime / duration) * 100}%`,
          width: `${((segment.endTime - segment.startTime) / duration) * 100}%`
        }"
        :title="segment.type"
      >
        <span v-if="showLabels">{{ segment.type }}</span>
      </div>
    </div>
    
    <v-row class="controls mt-2">
      <v-col cols="2">
        <v-btn icon @click="togglePlay">
          <v-icon>{{ isPlaying ? 'mdi-pause' : 'mdi-play' }}</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="8">
        <v-slider
          v-model="currentTime"
          :max="duration"
          hide-details
          @change="seekToTime"
        ></v-slider>
      </v-col>
      <v-col cols="2" class="text-right">
        {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
      </v-col>
    </v-row>
  </v-card>
</template>
```

2. **Intensity Heat Map**:
   - Kolorowa mapa intensywności audio
   - Pozwala zobaczyć strukturę utworu na pierwszy rzut oka

```vue
<template>
  <v-card class="intensity-map pa-2">
    <div class="heat-map-container">
      <div 
        v-for="(segment, index) in intensityData" 
        :key="index"
        class="intensity-segment"
        :style="{
          backgroundColor: getIntensityColor(segment.intensity),
          width: `${(segment.duration / totalDuration) * 100}%`
        }"
        :title="`Głośność: ${Math.round(segment.intensity * 100)}%`"
        @click="seekToTime(segment.startTime)"
      ></div>
    </div>
    <div class="time-markers">
      <div class="marker" v-for="marker in timeMarkers" :key="marker.time"
           :style="{ left: `${(marker.time / totalDuration) * 100}%` }">
        {{ marker.label }}
      </div>
    </div>
  </v-card>
</template>
```

### Synchronized Lyrics Display

1. **Karaoke Mode**:
   - Podświetlanie aktualnie wypowiadanych słów
   - Automatyczne przewijanie tekstu

```vue
<template>
  <v-card class="lyrics-display">
    <v-card-title>
      <v-icon>mdi-text</v-icon>
      Synchronized Lyrics
      <v-spacer></v-spacer>
      <v-btn-toggle v-model="displayMode" mandatory>
        <v-btn value="word">Word</v-btn>
        <v-btn value="line">Line</v-btn>
      </v-btn-toggle>
    </v-card-title>
    
    <v-divider></v-divider>
    
    <v-card-text>
      <div class="lyrics-container" ref="lyricsContainer">
        <template v-if="displayMode === 'word'">
          <span 
            v-for="(word, index) in wordTimestamps" 
            :key="index"
            :class="{
              'word': true,
              'current-word': isCurrentWord(word),
              'past-word': isPastWord(word),
              'future-word': isFutureWord(word)
            }"
            :style="{
              fontSize: word.fontSize ? `${word.fontSize}px` : null,
              fontWeight: word.emphasis ? 400 + (word.emphasis * 100) : null
            }"
          >
            {{ word.word }}
          </span>
        </template>
        
        <template v-else>
          <div 
            v-for="(line, index) in lineTimestamps" 
            :key="index"
            :class="{
              'line': true,
              'current-line': isCurrentLine(line),
              'past-line': isPastLine(line),
              'future-line': isFutureLine(line)
            }"
            ref="lines"
          >
            {{ line.text }}
          </div>
        </template>
      </div>
    </v-card-text>
  </v-card>
</template>
```

2. **Dual Language Display**:
   - Wyświetlanie oryginalnego tekstu i tłumaczenia jednocześnie
   - Synchronizacja obu wersji tekstu

```vue
<template>
  <v-card class="dual-lyrics">
    <v-tabs v-model="lyricsTab" center-active>
      <v-tab value="dual">Dual Language</v-tab>
      <v-tab value="original">Original Only</v-tab>
      <v-tab value="translation">Translation Only</v-tab>
    </v-tabs>
    
    <v-window v-model="lyricsTab">
      <v-window-item value="dual">
        <div class="dual-container">
          <div class="original-column">
            <div 
              v-for="(line, index) in originalLines" 
              :key="'orig-'+index"
              :class="{ 
                'line': true, 
                'current-line': currentLineIndex === index 
              }"
            >
              {{ line.text }}
            </div>
          </div>
          
          <v-divider vertical></v-divider>
          
          <div class="translation-column">
            <div 
              v-for="(line, index) in translationLines" 
              :key="'trans-'+index"
              :class="{ 
                'line': true, 
                'current-line': currentLineIndex === index 
              }"
            >
              {{ line.text }}
            </div>
          </div>
        </div>
      </v-window-item>
      
      <!-- Pozostałe zakładki -->
    </v-window>
  </v-card>
</template>
```

3. **Subtitle Overlay**:
   - Wyświetlanie napisów na filmie YouTube
   - Możliwość włączenia/wyłączenia

```vue
<template>
  <div class="video-container position-relative">
    <!-- YouTube Embed -->
    <div class="youtube-player" v-html="youtubeEmbed"></div>
    
    <!-- Subtitle Overlay -->
    <div class="subtitle-overlay" v-if="showSubtitles">
      <div class="subtitle-text" :style="subtitleStyle">
        <span v-if="currentSubtitle" v-html="currentSubtitle.text"></span>
      </div>
    </div>
    
    <!-- Controls -->
    <div class="subtitle-controls">
      <v-btn icon small @click="toggleSubtitles">
        <v-icon>{{ showSubtitles ? 'mdi-closed-caption' : 'mdi-closed-caption-outline' }}</v-icon>
      </v-btn>
      <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon small v-bind="attrs" v-on="on">
            <v-icon>mdi-translate</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item 
            v-for="lang in availableLanguages" 
            :key="lang.code"
            @click="changeSubtitleLanguage(lang.code)"
          >
            <v-list-item-title>{{ lang.name }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </div>
</template>
```

## 4. Implementacja technologiczna

### Przetwarzanie po stronie serwera

1. **Analiza audio**:
   - Serwis użyje FFmpeg do ekstrakcji audio z YouTube
   - Web Audio API do generowania danych waveformy
   - Librosa (Python) do analizy głośności i segmentacji
   - Redis do cache'owania wyników w trakcie analizy

2. **Generowanie znaczników czasowych**:
   - Usługa wykorzystująca ML do dopasowania tekstu do audio
   - API do ręcznej korekty znaczników
   - Zapisywanie w formacie kompatybilnym z VTT/SRT

### Frontend

1. **WebAudio API**:
   - Renderowanie waveformy w czasie rzeczywistym
   - Synchronizacja audio z YouTube API
   - Obsługa zdarzeń timeupdate do synchronizacji tekstu

2. **Canvas/WebGL**:
   - Renderowanie waveformy i map intensywności
   - Wykorzystanie shaderów dla płynnych efektów animacji

3. **Vuetify Components**:
   - `v-wave-player` - komponent wizualizacji waveformy
   - `v-lyrics-display` - komponent wyświetlania tekstów
   - `v-intensity-map` - komponent mapy intensywności
   - `v-subtitle-overlay` - komponent nakładki z napisami

## 5. Przepływ danych

1. **Dodawanie utworu**:
   - Pobranie audio z YouTube
   - Analiza i segmentacja audio
   - Generowanie danych waveformy
   - Zapisanie do AudioAnalysis

2. **Synchronizacja tekstu**:
   - Automatyczna propozycja synchronizacji
   - Interfejs edytora do korekty
   - Zapisanie WordTimestamp i LineTimestamp

3. **Odtwarzanie**:
   - Ładowanie danych waveformy z API
   - Ładowanie znaczników czasowych
   - Synchronizacja z odtwarzaczem YouTube
   - Aktualizacja wyświetlania tekstów w czasie rzeczywistym

## 6. Przykład użycia API

```typescript
// Pobieranie danych analizy audio
const getAudioAnalysis = async (songId: string) => {
  const response = await api.get<AudioAnalysisResponse>(`/songs/${songId}/audio-analysis`);
  return response.data;
};

// Pobieranie znaczników czasowych
const getLyricsTimestamps = async (songId: string, textContentId: string) => {
  const response = await api.get<TimestampResponse>(
    `/songs/${songId}/text-contents/${textContentId}/timestamps`
  );
  return response.data;
};

// Zapisywanie zaktualizowanych znaczników
const updateTimestamp = async (
  songId: string, 
  wordTimestampId: string, 
  data: WordTimestampUpdate
) => {
  return api.patch(`/songs/${songId}/word-timestamps/${wordTimestampId}`, data);
};
```

## 7. Zaawansowane funkcje

1. **Rozpoznawanie struktury utworów**:
   - Automatyczne wykrywanie zwrotek, refrenów
   - Wizualna reprezentacja struktury utworu

2. **Personalizowane style wyświetlania**:
   - Dostosowanie kolorów, rozmiaru czcionki
   - Animacje dla podświetlonych słów
   - Zmiana stylu napisów

3. **Edytor synchronizacji**:
   - Przeciąganie znaczników na waveformie
   - Podgląd w czasie rzeczywistym
   - Możliwość masowej edycji (np. przesunięcie wszystkich znaczników)

4. **Eksport/import**:
   - Eksport napisów w formacie SRT/VTT
   - Import istniejących plików napisów
   - Integracja z popularnymi serwisami karaoke