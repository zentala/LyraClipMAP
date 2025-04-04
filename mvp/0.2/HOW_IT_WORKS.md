# Jak działa wizualizacja audio i synchronizacja tekstu

## Generowanie waveformy

### Sposób 1: Generowanie w przeglądarce (Real-time)

1. **Proces**:
   - Użytkownik dodaje utwór (URL do YouTube)
   - Przeglądarka pobiera audio z YouTube (przez proxy na serwerze)
   - Wavesurfer.js analizuje audio bezpośrednio w przeglądarce
   - Waveforma jest renderowana dynamicznie przy użyciu HTML Canvas

2. **Zalety**:
   - Nie wymaga dodatkowego przetwarzania na serwerze
   - Działa od razu po załadowaniu audio
   - Niższe obciążenie serwera

3. **Wady**:
   - Wyższe obciążenie przeglądarki użytkownika
   - Wolniejsze ładowanie dla dłuższych utworów
   - Może działać słabiej na starszych urządzeniach

4. **Kod**:
```javascript
// Inicjalizacja z URL audio
wavesurfer.load('https://proxy.server/youtube-audio?id=dQw4w9WgXcQ')

// Wavesurfer automatycznie analizuje audio i generuje waveformę
wavesurfer.on('ready', () => {
  console.log('Waveforma wygenerowana i gotowa do wyświetlenia')
})
```

### Sposób 2: Pre-generowanie i przechowywanie (Recommended)

1. **Proces**:
   - Użytkownik dodaje utwór (URL do YouTube)
   - Serwer pobiera audio, generuje waveformę i zapisuje dane w bazie
   - Przeglądarka pobiera gotowe dane waveformy z API
   - Wavesurfer.js renderuje waveformę na podstawie gotowych danych

2. **Zalety**:
   - Szybsze ładowanie dla użytkownika
   - Mniejsze obciążenie przeglądarki
   - Lepsze działanie na słabszych urządzeniach
   - Możliwość zaawansowanej analizy audio na serwerze

3. **Wady**:
   - Wymaga dodatkowego przetwarzania na serwerze
   - Dodatkowe dane do przechowywania w bazie

4. **Implementacja**:

Backend (Node.js z FFmpeg):
```javascript
const { execSync } = require('child_process')
const fs = require('fs')

async function generateWaveformData(youtubeId) {
  // Pobranie audio z YouTube
  const audioPath = `/tmp/${youtubeId}.mp3`
  execSync(`youtube-dl -x --audio-format mp3 -o ${audioPath} https://www.youtube.com/watch?v=${youtubeId}`)
  
  // Generowanie danych waveformy przy użyciu FFmpeg
  const waveDataPath = `/tmp/${youtubeId}-wave.json`
  execSync(`ffmpeg -i ${audioPath} -filter_complex "aformat=channel_layouts=mono,showwavespic=s=800x200:colors=#32CD32" -frames:v 1 ${waveDataPath}`)
  
  // Konwersja wynikowego obrazu na dane JSON
  const waveformData = processImageToWaveformData(waveDataPath)
  
  // Zapis do bazy danych
  await db.collection('audioAnalysis').insertOne({
    youtubeId,
    waveformData,
    createdAt: new Date()
  })
  
  // Czyszczenie plików tymczasowych
  fs.unlinkSync(audioPath)
  fs.unlinkSync(waveDataPath)
  
  return waveformData
}
```

Frontend (Vue.js z wavesurfer.js):
```javascript
async mounted() {
  // Pobierz dane waveformy z API
  const response = await fetch(`/api/songs/${this.songId}/waveform`)
  const waveformData = await response.json()
  
  // Inicjalizacja wavesurfer.js z gotowymi danymi
  this.wavesurfer = WaveSurfer.create({
    container: this.$refs.waveformContainer,
    waveColor: '#9575CD',
    progressColor: '#6200EA',
    responsive: true,
    // Użyj wczytanych danych zamiast generować
    peaks: waveformData.peaks,
    // Opcjonalnie wyłącz wbudowane dekodowanie
    backend: 'MediaElement'
  })
  
  // Załaduj samo audio
  this.wavesurfer.load(this.audioUrl)
}
```

## Synchronizacja tekstu z audio

### 1. Parsowanie plików LRC

Pliki LRC zawierają znaczniki czasu dla każdej linii:

```
[00:04.50]Pierwsza linia tekstu
[00:08.10]Druga linia tekstu
[00:12.30]Trzecia linia tekstu
```

Parser przetwarza ten format na tablicę obiektów:

```javascript
function parseLRC(lrcContent) {
  const lines = lrcContent.split('\n')
  const parsed = []
  
  lines.forEach(line => {
    const timeMatch = line.match(/\[(\d{2}):(\d{2})\.(\d{2})\]/)
    if (!timeMatch) return
    
    const minutes = parseInt(timeMatch[1])
    const seconds = parseInt(timeMatch[2])
    const hundredths = parseInt(timeMatch[3])
    const timeInSeconds = minutes * 60 + seconds + hundredths / 100
    
    const text = line.replace(/\[\d{2}:\d{2}\.\d{2}\]/, '').trim()
    
    parsed.push({
      time: timeInSeconds,
      text: text
    })
  })
  
  return parsed.sort((a, b) => a.time - b.time)
}
```

### 2. Synchronizacja podczas odtwarzania

1. **Podejście zdarzeniowe**:
   - Podczas odtwarzania sprawdzamy aktualny czas
   - Znajdujemy aktualną linię tekstu na podstawie czasu
   - Aktualizujemy widok, podświetlając właściwą linię

```javascript
// Nasłuchiwanie zdarzeń odtwarzacza
wavesurfer.on('audioprocess', currentTime => {
  updateLyrics(currentTime)
})

function updateLyrics(currentTime) {
  // Znajdź aktualną linię (pierwszą, której czas jest większy niż currentTime)
  const nextLineIndex = parsedLyrics.findIndex(line => line.time > currentTime)
  // Aktualna linia to poprzednia przed następną
  const currentLineIndex = nextLineIndex > 0 ? nextLineIndex - 1 : 
                           (nextLineIndex === -1 ? parsedLyrics.length - 1 : 0)
  
  // Jeśli zmieniła się aktualna linia
  if (currentLineIndex !== previousLineIndex) {
    // Odznacz poprzednią linię
    if (previousLineIndex >= 0) {
      document.querySelector(`.lyrics-line[data-index="${previousLineIndex}"]`)
        .classList.remove('current-line')
    }
    
    // Podświetl aktualną linię
    const currentLine = document.querySelector(`.lyrics-line[data-index="${currentLineIndex}"]`)
    currentLine.classList.add('current-line')
    
    // Przewiń widok, aby aktualna linia była widoczna
    currentLine.scrollIntoView({ behavior: 'smooth', block: 'center' })
    
    previousLineIndex = currentLineIndex
  }
}
```

### 3. Synchronizacja na poziomie słów (Karaoke)

Aby osiągnąć synchronizację na poziomie słów (jak w karaoke):

1. **Format rozszerzony**:
   - Znaczniki czasu dla każdego słowa/frazy
   - Może być przechowywany jako rozszerzony LRC lub JSON

```
[00:04.50]<00:04.50,00:04.80>Pierwsza <00:04.80,00:05.20>linia <00:05.20,00:05.50>tekstu
```

2. **Implementacja**:
   - Tekst dzielimy na pojedyncze słowa z czasami
   - Podczas odtwarzania podświetlamy słowa w czasie rzeczywistym

```javascript
// Struktura danych dla synchronizacji słów
const wordTimestamps = [
  { word: "Pierwsza", start: 4.5, end: 4.8 },
  { word: "linia", start: 4.8, end: 5.2 },
  { word: "tekstu", start: 5.2, end: 5.5 },
  // ...
]

// Funkcja aktualizacji podczas odtwarzania
function updateWordsHighlight(currentTime) {
  wordTimestamps.forEach(wordData => {
    const wordElement = document.querySelector(`[data-word-id="${wordData.id}"]`)
    
    if (currentTime >= wordData.start && currentTime <= wordData.end) {
      // Słowo aktualnie wypowiadane
      wordElement.classList.add('current-word')
    } else {
      // Słowo nieaktywne
      wordElement.classList.remove('current-word')
    }
  })
}
```

## Podkładanie tekstu do fragmentów YouTube

Aby precyzyjnie podkładać tekst do fragmentów YouTube, potrzebujemy:

### 1. Integracja YouTube API z kontrolą czasu

```javascript
// Inicjalizacja odtwarzacza YouTube
let player
function onYouTubeIframeAPIReady() {
  player = new YT.Player('youtube-player', {
    videoId: 'dQw4w9WgXcQ',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  })
}

// Timer do synchronizacji
let syncTimer
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    // Uruchom timer aktualizujący tekst
    syncTimer = setInterval(() => {
      const currentTime = player.getCurrentTime()
      updateLyrics(currentTime)
    }, 100) // Aktualizacja co 100ms
  } else {
    // Zatrzymaj timer, gdy odtwarzanie zatrzymane
    clearInterval(syncTimer)
  }
}
```

### 2. Nakładka z napisami na wideo

```vue
<template>
  <div class="video-container">
    <!-- Player YouTube -->
    <div id="youtube-player"></div>
    
    <!-- Nakładka z napisami -->
    <div class="subtitles-overlay" v-if="showSubtitles">
      <div class="subtitle-text" :class="{ 'dual-language': showTranslation }">
        <div class="original" v-if="currentLine">{{ currentLine.text }}</div>
        <div class="translation" v-if="showTranslation && currentTranslation">
          {{ currentTranslation.text }}
        </div>
      </div>
    </div>
    
    <!-- Kontrolki -->
    <div class="subtitle-controls">
      <v-switch v-model="showSubtitles" label="Napisy"></v-switch>
      <v-switch v-model="showTranslation" label="Tłumaczenie"></v-switch>
    </div>
  </div>
</template>

<style>
.video-container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* Proporcje 16:9 */
}

#youtube-player {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.subtitles-overlay {
  position: absolute;
  bottom: 60px;
  left: 0;
  width: 100%;
  text-align: center;
  z-index: 10;
}

.subtitle-text {
  display: inline-block;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  max-width: 80%;
  margin: 0 auto;
}

.dual-language .original {
  margin-bottom: 8px;
  font-weight: bold;
}

.dual-language .translation {
  font-style: italic;
  font-size: 0.9em;
}

.subtitle-controls {
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 20;
}
</style>

<script>
export default {
  data() {
    return {
      player: null,
      showSubtitles: true,
      showTranslation: true,
      currentLine: null,
      currentTranslation: null,
      lyrics: [],
      translations: [],
      syncTimer: null
    }
  },
  
  mounted() {
    this.initYouTubeAPI()
    this.loadLyrics()
    this.loadTranslations()
  },
  
  methods: {
    initYouTubeAPI() {
      // Ładowanie YouTube API i inicjalizacja odtwarzacza
      // ...
    },
    
    loadLyrics() {
      // Wczytanie synchronizowanych tekstów
      // ...
    },
    
    loadTranslations() {
      // Wczytanie tłumaczeń
      // ...
    },
    
    updateSubtitles(currentTime) {
      // Znajdź aktualną linię tekstu
      const nextLineIndex = this.lyrics.findIndex(line => line.time > currentTime)
      const currentIndex = nextLineIndex > 0 ? nextLineIndex - 1 : 
                         (nextLineIndex === -1 ? this.lyrics.length - 1 : 0)
      
      // Aktualizuj tekst
      this.currentLine = this.lyrics[currentIndex]
      
      // Znajdź odpowiednie tłumaczenie
      if (this.translations.length > 0) {
        this.currentTranslation = this.translations.find(
          t => Math.abs(t.time - this.currentLine.time) < 0.5
        ) || this.translations[currentIndex]
      }
    }
  }
}
</script>
```

## Edytor do synchronizacji tekstu

Aby ułatwić tworzenie zsynchronizowanego tekstu, możemy zaimplementować edytor:

```vue
<template>
  <v-card>
    <v-card-title>Edytor synchronizacji tekstu</v-card-title>
    
    <v-card-text>
      <!-- Waveforma audio z możliwością zaznaczania regionów -->
      <div ref="waveformEditor"></div>
      
      <!-- Lista linii tekstu do synchronizacji -->
      <v-list>
        <v-list-item v-for="(line, index) in lines" :key="index" 
                     :class="{ 'current-line': currentLineIndex === index }">
          <v-list-item-content>
            <v-text-field v-model="line.text" label="Tekst linii"></v-text-field>
          </v-list-item-content>
          
          <v-list-item-action>
            <v-text-field v-model="line.timeFormatted" label="Czas (mm:ss.ms)"
                         @input="updateTimeFromFormatted(index)"></v-text-field>
          </v-list-item-action>
          
          <v-list-item-action>
            <v-btn icon @click="setCurrentTime(index)">
              <v-icon>mdi-play</v-icon>
            </v-btn>
            
            <v-btn icon @click="markCurrentTime(index)">
              <v-icon>mdi-flag</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-card-text>
    
    <v-card-actions>
      <v-btn @click="addLine">Dodaj linię</v-btn>
      <v-spacer></v-spacer>
      <v-btn @click="exportLRC">Eksportuj LRC</v-btn>
      <v-btn color="primary" @click="saveSynchronization">Zapisz</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import WaveSurfer from 'wavesurfer.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js'

export default {
  data() {
    return {
      waveform: null,
      lines: [
        { text: '', time: 0, timeFormatted: '00:00.00' }
      ],
      currentLineIndex: -1
    }
  },
  
  mounted() {
    this.initWaveform()
  },
  
  methods: {
    initWaveform() {
      this.waveform = WaveSurfer.create({
        container: this.$refs.waveformEditor,
        waveColor: '#9575CD',
        progressColor: '#6200EA',
        responsive: true,
        plugins: [
          RegionsPlugin.create()
        ]
      })
      
      // Załaduj audio
      this.waveform.load(this.audioUrl)
      
      // Obsługa zdarzeń
      this.waveform.on('seek', this.updateCurrentLine)
    },
    
    updateCurrentLine() {
      const currentTime = this.waveform.getCurrentTime()
      
      // Znajdź aktualną linię
      const index = this.lines.findIndex(line => line.time > currentTime)
      this.currentLineIndex = index > 0 ? index - 1 : 
                             (index === -1 ? this.lines.length - 1 : 0)
    },
    
    markCurrentTime(index) {
      // Zapisz aktualny czas odtwarzania jako czas dla wybranej linii
      const currentTime = this.waveform.getCurrentTime()
      this.lines[index].time = currentTime
      
      // Formatuj czas w czytelny sposób
      const minutes = Math.floor(currentTime / 60)
      const seconds = Math.floor(currentTime % 60)
      const milliseconds = Math.floor((currentTime % 1) * 100)
      
      this.lines[index].timeFormatted = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`
    },
    
    updateTimeFromFormatted(index) {
      // Parsowanie sformatowanego czasu
      const parts = this.lines[index].timeFormatted.split(/[:.]/)
      if (parts.length === 3) {
        const minutes = parseInt(parts[0])
        const seconds = parseInt(parts[1])
        const milliseconds = parseInt(parts[2])
        
        this.lines[index].time = minutes * 60 + seconds + milliseconds / 100
      }
    },
    
    setCurrentTime(index) {
      // Przejdź do czasu wybranej linii
      this.waveform.seekTo(this.lines[index].time / this.waveform.getDuration())
      this.waveform.play()
    },
    
    addLine() {
      this.lines.push({ text: '', time: 0, timeFormatted: '00:00.00' })
    },
    
    exportLRC() {
      // Generowanie pliku LRC
      let lrcContent = '[ti:' + this.songTitle + ']\n'
      lrcContent += '[ar:' + this.artist + ']\n\n'
      
      // Dodaj linie z czasami
      this.lines.sort((a, b) => a.time - b.time).forEach(line => {
        if (!line.text.trim()) return
        
        const minutes = Math.floor(line.time / 60)
        const seconds = Math.floor(line.time % 60)
        const milliseconds = Math.floor((line.time % 1) * 100)
        
        const timeStr = 
          `[${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}]`
        
        lrcContent += timeStr + line.text + '\n'
      })
      
      // Utwórz link do pobrania
      const blob = new Blob([lrcContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `${this.artist} - ${this.songTitle}.lrc`
      a.click()
      
      URL.revokeObjectURL(url)
    },
    
    saveSynchronization() {
      // Zapisanie synchronizacji do bazy danych
      const syncData = this.lines
        .filter(line => line.text.trim())
        .sort((a, b) => a.time - b.time)
        .map(line => ({
          text: line.text,
          time: line.time
        }))
      
      // Wywołanie API do zapisania
      this.$emit('save', syncData)
    }
  }
}
</script>
```

## Podsumowanie

1. **Wizualizacja audio**:
   - Najlepsze rozwiązanie to pre-generowanie waveformy na serwerze
   - Zapisywanie danych w bazie danych
   - Renderowanie w przeglądarce za pomocą wavesurfer.js

2. **Synchronizacja tekstu**:
   - Format LRC jest prosty i efektywny
   - Można rozszerzyć do synchronizacji na poziomie słów
   - Warto zaimplementować edytor do tworzenia synchronizacji

3. **Integracja z YouTube**:
   - YouTube API pozwala na dokładną kontrolę czasu
   - Można nakładać napisy bezpośrednio na wideo
   - Można wyświetlać oryginał i tłumaczenie jednocześnie