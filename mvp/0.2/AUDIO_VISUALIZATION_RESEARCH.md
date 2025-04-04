# Badanie rozwiązań do wizualizacji audio i synchronizacji tekstu

## Biblioteki do wizualizacji audio

### 1. Wavesurfer.js
- **Opis**: Popularna biblioteka JavaScript do wizualizacji fal dźwiękowych
- **Główne funkcje**:
  - Wyświetlanie waveform z audio
  - Możliwość zaznaczania regionów na falach
  - Plugin spektrogramu
  - Znaczniki czasu
  - Pełna responsywność
- **Złożoność implementacji**: Łatwa-Średnia
- **GitHub**: [https://github.com/wavesurfer-js/wavesurfer.js](https://github.com/wavesurfer-js/wavesurfer.js)
- **Dokumentacja**: [https://wavesurfer-js.org/](https://wavesurfer-js.org/)
- **Integracja z Vue**: Istnieją gotowe wrappery Vue dla tej biblioteki
- **Przykład**:
```javascript
import WaveSurfer from 'wavesurfer.js'

// Utworzenie instancji
const wavesurfer = WaveSurfer.create({
  container: '#waveform',
  waveColor: '#4F4A85',
  progressColor: '#383351',
  responsive: true,
  barWidth: 3,
  url: 'audio.mp3'
})

// Obsługa zdarzeń
wavesurfer.on('ready', () => {
  wavesurfer.play()
})
wavesurfer.on('timeupdate', (currentTime) => {
  // Synchronizacja z tekstem
  updateLyrics(currentTime)
})
```

**Przykład integracji z Vue.js**:
```vue
<template>
  <div>
    <div ref="waveform"></div>
    <v-btn @click="togglePlay">{{ isPlaying ? 'Pause' : 'Play' }}</v-btn>
  </div>
</template>

<script>
import WaveSurfer from 'wavesurfer.js'

export default {
  data() {
    return {
      wavesurfer: null,
      isPlaying: false
    }
  },
  mounted() {
    this.wavesurfer = WaveSurfer.create({
      container: this.$refs.waveform,
      waveColor: '#1976D2',
      progressColor: '#6200EA',
      responsive: true
    })
    
    this.wavesurfer.load(this.audioUrl)
    
    this.wavesurfer.on('play', () => {
      this.isPlaying = true
    })
    
    this.wavesurfer.on('pause', () => {
      this.isPlaying = false
    })
  },
  methods: {
    togglePlay() {
      this.wavesurfer.playPause()
    }
  }
}
</script>
```

### 2. Peaks.js
- **Opis**: Biblioteka do wizualizacji waveform stworzona przez BBC
- **Główne funkcje**:
  - Powiększanie fragmentów waveform
  - Dodawanie znaczników punktowych i segmentów
  - Dostosowywalne UI
  - Predefiniowane zoomowanie
- **Złożoność implementacji**: Średnia
- **GitHub**: [https://github.com/bbc/peaks.js](https://github.com/bbc/peaks.js)
- **Przykład**:
```javascript
import Peaks from 'peaks.js'

const options = {
  container: document.getElementById('peaks-container'),
  mediaElement: document.querySelector('audio'),
  dataUri: {
    arraybuffer: 'waveform.dat'
  },
  height: 200
}

Peaks.init(options, function(err, peaks) {
  // Obsługa zdarzeń
  peaks.on('segments.dragend', function(segment) {
    console.log('Segment moved', segment)
  })
})
```

### 3. p5.sound
- **Opis**: Część biblioteki p5.js, umożliwiająca tworzenie własnych wizualizacji
- **Główne funkcje**: 
  - Analiza FFT (Fast Fourier Transform)
  - Analiza amplitudy
  - Elastyczność w tworzeniu własnych wizualizacji
- **Złożoność implementacji**: Łatwa (dla prostych wizualizacji)
- **GitHub**: [https://github.com/processing/p5.js-sound](https://github.com/processing/p5.js-sound)
- **Przykład**:
```javascript
let song, fft

function preload() {
  song = loadSound('song.mp3')
}

function setup() {
  createCanvas(1024, 400)
  fft = new p5.FFT()
  song.play()
}

function draw() {
  background(0)
  
  let spectrum = fft.analyze()
  
  // Rysowanie wizualizacji
  stroke(255)
  noFill()
  beginShape()
  for (let i = 0; i < spectrum.length; i++) {
    let x = map(i, 0, spectrum.length, 0, width)
    let y = map(spectrum[i], 0, 255, height, 0)
    vertex(x, y)
  }
  endShape()
}
```

### 4. Web Audio API z Canvas
- **Opis**: Natywne rozwiązanie bez zewnętrznych bibliotek
- **Główne funkcje**:
  - Pełna kontrola nad wizualizacją
  - Wykorzystanie AnalyserNode z Web Audio API
  - Rysowanie na Canvas
- **Złożoność implementacji**: Średnia-Trudna
- **Przykład**:
```javascript
// Konfiguracja Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)()
const analyser = audioContext.createAnalyser()
analyser.fftSize = 2048

// Przetwarzanie audio
const audioSource = audioContext.createMediaElementSource(audioElement)
audioSource.connect(analyser)
analyser.connect(audioContext.destination)

// Wizualizacja
function draw() {
  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  
  // Pobierz dane częstotliwości
  analyser.getByteFrequencyData(dataArray)
  
  // Wyczyść canvas
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height)
  
  // Rysuj wizualizację
  const barWidth = (canvas.width / bufferLength) * 2.5
  let x = 0
  
  for (let i = 0; i < bufferLength; i++) {
    const barHeight = dataArray[i] / 2
    canvasCtx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`
    canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)
    x += barWidth + 1
  }
  
  requestAnimationFrame(draw)
}
```

## Rozwiązania do synchronizacji tekstu (lyrics)

### 1. Format LRC i parsery
- **Opis**: LRC to standardowy format dla tekstów synchronizowanych
- **Główne funkcje**:
  - Prosty format tekstowy z czasami
  - Szeroka kompatybilność
  - Łatwe do implementacji parsery
- **Złożoność implementacji**: Łatwa
- **Przykład formatu LRC**:
```
[ti:Tytuł utworu]
[ar:Artysta]
[al:Album]
[00:12.00]Pierwsza linia tekstu
[00:17.20]Druga linia tekstu
```

**Przykład parsera LRC**:
```javascript
function parseLRC(lrc) {
  const lines = lrc.split('\n')
  const timeTagRegex = /\[(\d{2}):(\d{2})\.(\d{2})\]/g
  const result = []
  
  lines.forEach(line => {
    // Ignoruj puste linie
    if (!line.trim()) return
    
    const matches = [...line.matchAll(timeTagRegex)]
    const text = line.replace(timeTagRegex, '').trim()
    
    if (!text || !matches.length) return
    
    matches.forEach(match => {
      const minutes = parseInt(match[1])
      const seconds = parseInt(match[2])
      const centiseconds = parseInt(match[3])
      const time = minutes * 60 + seconds + centiseconds / 100
      
      result.push({
        time,
        text
      })
    })
  })
  
  // Sortuj według czasu
  return result.sort((a, b) => a.time - b.time)
}
```

### 2. Karaoke.js
- **Opis**: Lekka biblioteka do tworzenia efektu karaoke
- **Główne funkcje**:
  - Podświetlanie tekstu w czasie odtwarzania
  - Wsparcie dla formatu LRC
  - Łatwe do zintegrowania z odtwarzaczami
- **Złożoność implementacji**: Średnia
- **Przykład**:
```javascript
const karaoke = new Karaoke({
  audioElement: document.getElementById('audio'),
  lyricsContainer: document.getElementById('lyrics'),
  highlightClass: 'highlight'
})

karaoke.loadLRC('song.lrc')
karaoke.connect()

// Uruchomienie synchronizacji
audioElement.addEventListener('play', () => {
  karaoke.start()
})
```

### 3. Spleeter (Deezer)
- **Opis**: Narzędzie AI do separacji audio oparte na uczeniu maszynowym
- **Główne funkcje**:
  - Oddzielenie wokalu od muzyki
  - Rozdzielenie ścieżek instrumentalnych
  - Możliwe wykorzystanie do analizy wokalnej i lepszej synchronizacji
- **Złożoność implementacji**: Trudna (wymaga backendu Python)
- **GitHub**: [https://github.com/deezer/spleeter](https://github.com/deezer/spleeter)
- **Przykład użycia** (Python, po stronie serwera):
```python
from spleeter.separator import Separator

# Wykorzystanie modelu z 2 ścieżkami (wokal + akompaniament)
separator = Separator('spleeter:2stems')

# Rozdzielenie audio
separator.separate_to_file('song.mp3', 'output/')
```

## Integracja z Vue.js i Vuetify

### Przykład komponentu z wavesurfer.js i LRC

```vue
<template>
  <v-card class="music-player">
    <v-card-title>{{ songTitle }}</v-card-title>
    <v-card-subtitle>{{ artist }}</v-card-subtitle>
    
    <!-- Waveform -->
    <div ref="waveformContainer" class="pa-2"></div>
    
    <!-- Kontrolki -->
    <v-card-actions>
      <v-btn icon @click="togglePlay">
        <v-icon>{{ isPlaying ? 'mdi-pause' : 'mdi-play' }}</v-icon>
      </v-btn>
      <v-slider
        v-model="currentTime"
        :max="duration"
        hide-details
        class="mx-4"
        @change="seekTo"
      ></v-slider>
      <div class="time-display">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</div>
    </v-card-actions>
    
    <!-- Tekst piosenki -->
    <v-card-text class="lyrics-container">
      <div v-for="(line, index) in lyrics" :key="index"
           :class="{ 'current-line': isCurrentLine(line), 'lyrics-line': true }"
           ref="lyricsLines">
        {{ line.text }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import WaveSurfer from 'wavesurfer.js'

export default {
  props: {
    audioUrl: {
      type: String,
      required: true
    },
    lrcUrl: {
      type: String,
      default: null
    },
    songTitle: String,
    artist: String
  },
  
  data() {
    return {
      wavesurfer: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      lyrics: [],
      currentLineIndex: -1
    }
  },
  
  async mounted() {
    // Inicjalizacja wavesurfer
    this.wavesurfer = WaveSurfer.create({
      container: this.$refs.waveformContainer,
      waveColor: '#9575CD',
      progressColor: '#6200EA',
      responsive: true,
      cursorColor: '#E040FB',
      barWidth: 2,
      height: 100
    })
    
    this.wavesurfer.load(this.audioUrl)
    
    this.wavesurfer.on('ready', () => {
      this.duration = this.wavesurfer.getDuration()
    })
    
    this.wavesurfer.on('audioprocess', (currentTime) => {
      this.currentTime = currentTime
      this.updateLyrics(currentTime)
    })
    
    this.wavesurfer.on('play', () => {
      this.isPlaying = true
    })
    
    this.wavesurfer.on('pause', () => {
      this.isPlaying = false
    })
    
    // Wczytanie LRC jeśli dostępne
    if (this.lrcUrl) {
      await this.loadLRCFile()
    }
  },
  
  methods: {
    togglePlay() {
      this.wavesurfer.playPause()
    },
    
    seekTo(time) {
      this.wavesurfer.seekTo(time / this.duration)
    },
    
    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60)
      seconds = Math.floor(seconds % 60)
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    },
    
    async loadLRCFile() {
      try {
        const response = await fetch(this.lrcUrl)
        const lrcText = await response.text()
        this.lyrics = this.parseLRC(lrcText)
      } catch (error) {
        console.error('Błąd wczytywania pliku LRC:', error)
      }
    },
    
    parseLRC(lrc) {
      // Implementacja parsera LRC jak powyżej
      // ...
      return parsedLyrics
    },
    
    updateLyrics(currentTime) {
      if (!this.lyrics.length) return
      
      // Znajdź aktualną linię
      let index = this.lyrics.findIndex(line => line.time > currentTime)
      if (index > 0) index--
      else if (index === -1) index = this.lyrics.length - 1
      
      if (this.currentLineIndex !== index) {
        this.currentLineIndex = index
        
        // Przewijanie do aktualnej linii
        this.$nextTick(() => {
          if (this.$refs.lyricsLines && this.$refs.lyricsLines[index]) {
            this.$refs.lyricsLines[index].scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            })
          }
        })
      }
    },
    
    isCurrentLine(line) {
      const index = this.lyrics.indexOf(line)
      return index === this.currentLineIndex
    }
  }
}
</script>

<style scoped>
.lyrics-container {
  max-height: 300px;
  overflow-y: auto;
  text-align: center;
}

.lyrics-line {
  padding: 8px;
  transition: all 0.3s ease;
  opacity: 0.7;
  font-size: 16px;
}

.current-line {
  opacity: 1;
  font-weight: bold;
  font-size: 18px;
  color: #6200EA;
}
</style>
```

## Praktyczne podejście do implementacji

Na podstawie dostępnych bibliotek, zalecam następujące podejście do implementacji wizualizacji audio i synchronizacji tekstu w aplikacji LyraClipMAP:

1. **Wizualizacja audio**: Wykorzystanie wavesurfer.js ze względu na:
   - Aktywny rozwój i wsparcie
   - Prostą integrację z Vue.js
   - Możliwość rozszerzenia o dodatkowe funkcje (np. plugin spektrogramu)
   - Dobre wsparcie dla mobilnych urządzeń

2. **Synchronizacja tekstu**:
   - Wykorzystanie formatu LRC jako standardu przechowywania
   - Utworzenie własnego komponentu Vue do wyświetlania zsynchronizowanego tekstu
   - Możliwość importu/eksportu plików LRC

3. **Architektura**:
   - Komponent `AudioPlayer` zawierający wavesurfer.js
   - Komponent `SynchronizedLyrics` do wyświetlania tekstu
   - Usługa backendowa do parsowania i tworzenia plików LRC

4. **Plan implementacji**:
   - Faza 1: Podstawowa wizualizacja waveform z wavesurfer.js
   - Faza 2: Dodanie obsługi plików LRC i synchronizacji tekstu
   - Faza 3: Implementacja edytora do manualnej synchronizacji
   - Faza 4: Zaawansowane funkcje (wizualizacja głośności, automatyczna synchronizacja)

Ten plan pozwala na stopniową implementację funkcji wizualizacji i synchronizacji, zaczynając od najprostszych rozwiązań i rozbudowując je w miarę potrzeb.