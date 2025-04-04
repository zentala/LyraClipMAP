# Konwersja zwykłego tekstu piosenki na format LRC

## Wyzwanie
Większość tekstów piosenek nie posiada synchronizacji czasowej. Użytkownicy zwykle mają dostęp jedynie do zwykłego tekstu (TXT) bez znaczników czasowych. Jak efektywnie przekształcić taki tekst w zsynchronizowany format LRC?

## Rozwiązania automatycznej synchronizacji

### 1. Synchronizacja podczas dodawania piosenki

#### Metoda 1: Analiza audio + ML (zaawansowana)

1. **Proces**:
   - Pobieramy audio z YouTube
   - Wykonujemy automatyczną transkrypcję mowy na tekst (Speech-to-Text)
   - Dopasowujemy transkrypcję do istniejącego tekstu
   - Generujemy plik LRC na podstawie dopasowania

2. **Implementacja**:
```javascript
async function generateLRCFromAudio(audioFile, lyricsText) {
  // Przygotowanie tekstu do analizy
  const cleanedLyrics = cleanupLyrics(lyricsText) // Usunięcie interpunkcji, normalizacja
  const lyricsLines = cleanedLyrics.split('\n').filter(line => line.trim())

  // Wykonanie transkrypcji audio
  const transcriptionResult = await transcribeAudio(audioFile)
  
  // Dopasowanie transkrypcji do tekstu
  const alignmentResult = await alignTranscriptionToLyrics(
    transcriptionResult, 
    lyricsLines
  )
  
  // Generowanie LRC
  let lrcContent = ''
  alignmentResult.forEach(item => {
    if (item.text && item.startTime) {
      const minutes = Math.floor(item.startTime / 60)
      const seconds = Math.floor(item.startTime % 60)
      const milliseconds = Math.floor((item.startTime % 1) * 100)
      
      lrcContent += `[${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}]${item.text}\n`
    }
  })
  
  return lrcContent
}
```

#### Metoda 2: Równomierne rozmieszczenie (prosta)

1. **Proces**:
   - Pobieramy czas trwania utworu z YouTube API
   - Dzielimy czas równomiernie na wszystkie linie tekstu
   - Generujemy plik LRC z równomiernie rozłożonymi znacznikami czasu

2. **Implementacja**:
```javascript
function generateEvenlySpacedLRC(lyricsText, durationInSeconds) {
  const lyricsLines = lyricsText.split('\n')
    .filter(line => line.trim())
    .map(line => line.trim())
  
  const timePerLine = durationInSeconds / lyricsLines.length
  let lrcContent = ''
  
  lyricsLines.forEach((line, index) => {
    const startTime = index * timePerLine
    const minutes = Math.floor(startTime / 60)
    const seconds = Math.floor(startTime % 60)
    const milliseconds = Math.floor((startTime % 1) * 100)
    
    lrcContent += `[${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}]${line}\n`
  })
  
  return lrcContent
}
```

#### Metoda 3: Algorytm struktury utworu (średniozaawansowana)

1. **Proces**:
   - Analizujemy strukturę utworu (wykrywanie refrenu, zwrotek)
   - Dopasowujemy tekst do struktury audio (intensywność, zmiany)
   - Przydzielamy znaczniki czasu na podstawie wykrytej struktury

2. **Implementacja**:
```javascript
async function generateStructuredLRC(audioFile, lyricsText) {
  // Analiza audio - wykrywanie struktury utworu
  const audioAnalysis = await analyzeAudioStructure(audioFile)
  
  // Wykrywanie struktury tekstu
  const lyricsStructure = detectLyricsStructure(lyricsText)
  
  // Dopasowanie struktury tekstu do struktury audio
  const alignment = alignStructures(lyricsStructure, audioAnalysis)
  
  // Generowanie LRC
  let lrcContent = ''
  alignment.forEach(section => {
    section.lines.forEach((line, i) => {
      // Oblicz czas dla linii w sekcji
      const lineTime = section.startTime + 
        (i * (section.endTime - section.startTime) / section.lines.length)
      
      const minutes = Math.floor(lineTime / 60)
      const seconds = Math.floor(lineTime % 60)
      const milliseconds = Math.floor((lineTime % 1) * 100)
      
      lrcContent += `[${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}]${line}\n`
    })
  })
  
  return lrcContent
}
```

### 2. Półautomatyczna synchronizacja z udziałem użytkownika

#### Interfejs edytora synchronizacji

```vue
<template>
  <v-card>
    <v-card-title>
      <v-icon left>mdi-music-note</v-icon>
      Synchronizacja tekstu
    </v-card-title>
    
    <v-card-text>
      <div class="waveform-container mb-4" ref="waveform"></div>
      
      <v-card outlined class="mb-4">
        <v-toolbar dense flat>
          <v-toolbar-title>Krok 1: Wykryj strukturę tekstu</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn small @click="detectStructure" color="primary">
            Wykryj automatycznie
          </v-btn>
        </v-toolbar>
        
        <v-card-text>
          <v-textarea
            v-model="rawLyrics"
            label="Wklej oryginalny tekst piosenki"
            hint="Wklej tekst piosenki, w którym każda linia odpowiada jednej linii w utworze"
            auto-grow
            outlined
            rows="10"
          ></v-textarea>
        </v-card-text>
      </v-card>
      
      <v-card outlined class="mb-4">
        <v-toolbar dense flat>
          <v-toolbar-title>Krok 2: Synchronizuj tekst z audio</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn-toggle v-model="syncMethod" mandatory>
            <v-btn small value="auto">Auto</v-btn>
            <v-btn small value="even">Równomierne</v-btn>
            <v-btn small value="manual">Manualne</v-btn>
          </v-btn-toggle>
        </v-toolbar>
        
        <v-card-text>
          <v-data-table
            :headers="tableHeaders"
            :items="lyricsLines"
            item-key="index"
            dense
            disable-sort
            disable-pagination
            hide-default-footer
          >
            <template v-slot:item.text="{ item }">
              <v-text-field v-model="item.text" dense hide-details></v-text-field>
            </template>
            
            <template v-slot:item.time="{ item }">
              <v-text-field 
                v-model="item.timeFormatted" 
                dense 
                hide-details
                :disabled="syncMethod !== 'manual'"
                @input="updateTime(item)"
              ></v-text-field>
            </template>
            
            <template v-slot:item.actions="{ item }">
              <v-btn 
                icon 
                small 
                @click="setCurrentTimeToLine(item)"
                :disabled="!wavesurfer || !wavesurfer.isReady"
              >
                <v-icon small>mdi-play</v-icon>
              </v-btn>
              
              <v-btn 
                icon 
                small 
                @click="markCurrentTimeForLine(item)"
                :disabled="syncMethod !== 'manual' || !wavesurfer || !wavesurfer.isReady"
              >
                <v-icon small>mdi-flag</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
      
      <v-card-actions>
        <v-btn @click="previewLRC" color="primary" text>
          <v-icon left>mdi-eye</v-icon>
          Podgląd
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn @click="downloadLRC" color="secondary">
          <v-icon left>mdi-download</v-icon>
          Pobierz LRC
        </v-btn>
        <v-btn @click="saveLRC" color="primary">
          <v-icon left>mdi-content-save</v-icon>
          Zapisz
        </v-btn>
      </v-card-actions>
      
      <!-- Dialog podglądu synchronizacji -->
      <v-dialog v-model="previewDialog" max-width="700">
        <v-card>
          <v-card-title>Podgląd synchronizacji</v-card-title>
          <v-card-text>
            <div class="waveform-preview mb-4" ref="waveformPreview"></div>
            
            <div class="lyrics-preview">
              <div 
                v-for="(line, i) in lyricsLines" 
                :key="i"
                :class="['preview-line', { 'current-line': currentLineIndex === i }]"
              >
                {{ line.text }}
              </div>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="previewDialog = false">
              Zamknij
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card-text>
  </v-card>
</template>

<script>
import WaveSurfer from 'wavesurfer.js'

export default {
  props: {
    songId: String,
    audioUrl: String,
    existingLyrics: String
  },
  
  data() {
    return {
      wavesurfer: null,
      previewWavesurfer: null,
      rawLyrics: this.existingLyrics || '',
      syncMethod: 'even',
      lyricsLines: [],
      tableHeaders: [
        { text: 'Linia', value: 'text', width: '60%' },
        { text: 'Czas', value: 'time', width: '25%' },
        { text: 'Akcje', value: 'actions', width: '15%', sortable: false }
      ],
      previewDialog: false,
      currentLineIndex: -1,
      audioDuration: 0
    }
  },
  
  mounted() {
    this.initWaveform()
    if (this.existingLyrics) {
      this.processRawLyrics()
    }
  },
  
  methods: {
    initWaveform() {
      // Inicjalizacja głównego edytora waveform
      this.wavesurfer = WaveSurfer.create({
        container: this.$refs.waveform,
        waveColor: '#9575CD',
        progressColor: '#6200EA',
        responsive: true,
        cursorColor: '#E040FB',
        barWidth: 2,
        height: 100
      })
      
      this.wavesurfer.load(this.audioUrl)
      
      this.wavesurfer.on('ready', () => {
        this.audioDuration = this.wavesurfer.getDuration()
      })
    },
    
    processRawLyrics() {
      // Przekształcenie surowego tekstu w linie
      const lines = this.rawLyrics.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
      
      this.lyricsLines = lines.map((text, index) => ({
        index,
        text,
        time: 0,
        timeFormatted: '00:00.00'
      }))
      
      // Jeśli wybrano równomierne rozmieszczenie, zastosuj je
      if (this.syncMethod === 'even' && this.audioDuration > 0) {
        this.applyEvenSpacing()
      }
    },
    
    detectStructure() {
      // Automatyczne wykrywanie struktury tekstu (refreny, zwrotki)
      this.processRawLyrics()
      
      // Wykrywanie powtarzających się linii (potencjalny refren)
      const lines = [...this.lyricsLines]
      const lineCounts = {}
      
      lines.forEach(line => {
        const normalizedText = line.text.toLowerCase().trim()
        lineCounts[normalizedText] = (lineCounts[normalizedText] || 0) + 1
      })
      
      // Oznacz potencjalne refreny
      lines.forEach(line => {
        const normalizedText = line.text.toLowerCase().trim()
        if (lineCounts[normalizedText] > 1) {
          line.isChorus = true
        }
      })
      
      // Oznacz strukturalne części (zwrotki, refreny)
      let currentSection = 'verse'
      let sectionNumber = 1
      
      for (let i = 0; i < lines.length; i++) {
        // Jeśli znajdziemy pusty wiersz, to nowa sekcja
        if (i > 0 && lines[i-1].text.trim() === '') {
          if (currentSection === 'verse') {
            sectionNumber++
          } else {
            currentSection = 'verse'
          }
        }
        
        // Jeśli linia jest częścią refrenu
        if (lines[i].isChorus) {
          currentSection = 'chorus'
        }
        
        lines[i].section = `${currentSection}${currentSection === 'chorus' ? '' : sectionNumber}`
      }
    },
    
    applyEvenSpacing() {
      // Równomierne rozmieszczenie czasów dla linii
      if (!this.lyricsLines.length || !this.audioDuration) return
      
      const timePerLine = this.audioDuration / this.lyricsLines.length
      
      this.lyricsLines.forEach((line, index) => {
        line.time = index * timePerLine
        line.timeFormatted = this.formatTime(line.time)
      })
    },
    
    applyStructuralSpacing() {
      // Rozmieszczenie czasów na podstawie struktury utworu
      if (!this.audioDuration || !this.lyricsLines.length) return
      
      // Analiza struktury audio z serwera
      // W tym przykładzie użyjemy prostego modelu:
      // - Intro: 5% długości
      // - Zwrotki: 20% długości każda
      // - Refreny: 15% długości każdy
      // - Outro: 5% długości
      
      const structureModel = {
        intro: 0.05,
        verse: 0.2,
        chorus: 0.15,
        outro: 0.05
      }
      
      // Identyfikacja sekcji
      const sections = []
      let currentSection = null
      
      this.lyricsLines.forEach(line => {
        if (!line.section) line.section = 'verse1'
        
        if (!currentSection || currentSection.name !== line.section) {
          if (currentSection) {
            sections.push(currentSection)
          }
          currentSection = {
            name: line.section,
            lines: [line]
          }
        } else {
          currentSection.lines.push(line)
        }
      })
      
      if (currentSection && currentSection.lines.length) {
        sections.push(currentSection)
      }
      
      // Przypisanie czasów dla sekcji
      let currentTime = 0
      
      sections.forEach(section => {
        let sectionDuration = 0
        
        if (section.name.includes('verse')) {
          sectionDuration = this.audioDuration * structureModel.verse
        } else if (section.name.includes('chorus')) {
          sectionDuration = this.audioDuration * structureModel.chorus
        } else if (section.name.includes('intro')) {
          sectionDuration = this.audioDuration * structureModel.intro
        } else if (section.name.includes('outro')) {
          sectionDuration = this.audioDuration * structureModel.outro
        }
        
        const timePerLine = sectionDuration / section.lines.length
        
        section.lines.forEach((line, i) => {
          line.time = currentTime + (i * timePerLine)
          line.timeFormatted = this.formatTime(line.time)
        })
        
        currentTime += sectionDuration
      })
    },
    
    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      const milliseconds = Math.floor((seconds % 1) * 100)
      
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`
    },
    
    parseFormattedTime(timeString) {
      const parts = timeString.split(/[:.]/)
      if (parts.length === 3) {
        const minutes = parseInt(parts[0])
        const seconds = parseInt(parts[1])
        const milliseconds = parseInt(parts[2])
        
        return minutes * 60 + seconds + milliseconds / 100
      }
      return 0
    },
    
    updateTime(item) {
      item.time = this.parseFormattedTime(item.timeFormatted)
    },
    
    setCurrentTimeToLine(item) {
      // Przejdź do czasu wybranej linii
      if (this.wavesurfer && this.wavesurfer.isReady) {
        this.wavesurfer.seekTo(item.time / this.audioDuration)
        this.wavesurfer.play()
      }
    },
    
    markCurrentTimeForLine(item) {
      // Oznacz bieżący czas dla wybranej linii
      if (this.wavesurfer && this.wavesurfer.isReady) {
        const currentTime = this.wavesurfer.getCurrentTime()
        item.time = currentTime
        item.timeFormatted = this.formatTime(currentTime)
      }
    },
    
    previewLRC() {
      this.previewDialog = true
      
      // Inicjalizacja waveform w podglądzie
      this.$nextTick(() => {
        if (this.previewWavesurfer) {
          this.previewWavesurfer.destroy()
        }
        
        this.previewWavesurfer = WaveSurfer.create({
          container: this.$refs.waveformPreview,
          waveColor: '#9575CD',
          progressColor: '#6200EA',
          responsive: true,
          cursorColor: '#E040FB',
          barWidth: 2,
          height: 80
        })
        
        this.previewWavesurfer.load(this.audioUrl)
        
        this.previewWavesurfer.on('ready', () => {
          this.previewWavesurfer.play()
        })
        
        this.previewWavesurfer.on('audioprocess', this.updatePreviewLyrics)
      })
    },
    
    updatePreviewLyrics(currentTime) {
      // Aktualizacja podświetlenia tekstu podczas odtwarzania
      const sortedLines = [...this.lyricsLines].sort((a, b) => a.time - b.time)
      
      // Znajdź aktualną linię
      const nextLineIndex = sortedLines.findIndex(line => line.time > currentTime)
      this.currentLineIndex = nextLineIndex > 0 ? nextLineIndex - 1 : 
                             (nextLineIndex === -1 ? sortedLines.length - 1 : 0)
      
      // Przewiń do aktualnej linii
      this.$nextTick(() => {
        const lines = this.$el.querySelectorAll('.preview-line')
        if (lines.length > this.currentLineIndex) {
          lines[this.currentLineIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          })
        }
      })
    },
    
    generateLRC() {
      // Generowanie zawartości pliku LRC
      const sortedLines = [...this.lyricsLines]
        .filter(line => line.text.trim())
        .sort((a, b) => a.time - b.time)
      
      let lrcContent = `[ti:${this.songTitle || 'Unknown Title'}]\n`
      lrcContent += `[ar:${this.songArtist || 'Unknown Artist'}]\n\n`
      
      sortedLines.forEach(line => {
        const minutes = Math.floor(line.time / 60)
        const seconds = Math.floor(line.time % 60)
        const milliseconds = Math.floor((line.time % 1) * 100)
        
        lrcContent += `[${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}]${line.text}\n`
      })
      
      return lrcContent
    },
    
    downloadLRC() {
      // Generowanie i pobieranie pliku LRC
      const lrcContent = this.generateLRC()
      
      const blob = new Blob([lrcContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `${this.songArtist || 'Unknown'} - ${this.songTitle || 'Unknown'}.lrc`
      a.click()
      
      URL.revokeObjectURL(url)
    },
    
    saveLRC() {
      // Zapisanie LRC do bazy danych
      const lrcContent = this.generateLRC()
      
      this.$emit('save-lrc', {
        songId: this.songId,
        lrcContent,
        lyricsLines: this.lyricsLines.sort((a, b) => a.time - b.time)
      })
    }
  },
  
  watch: {
    syncMethod(newMethod) {
      if (newMethod === 'even') {
        this.applyEvenSpacing()
      } else if (newMethod === 'auto') {
        this.applyStructuralSpacing()
      }
    },
    
    rawLyrics() {
      this.processRawLyrics()
    },
    
    audioDuration(newDuration) {
      if (newDuration > 0 && this.syncMethod !== 'manual') {
        if (this.syncMethod === 'even') {
          this.applyEvenSpacing()
        } else if (this.syncMethod === 'auto') {
          this.applyStructuralSpacing()
        }
      }
    }
  }
}
</script>

<style scoped>
.waveform-container, .waveform-preview {
  background-color: #f5f5f5;
  border-radius: 4px;
}

.lyrics-preview {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 16px;
}

.preview-line {
  padding: 8px 0;
  transition: all 0.3s ease;
  opacity: 0.7;
}

.current-line {
  font-weight: bold;
  font-size: 1.1em;
  color: #6200EA;
  opacity: 1;
}
</style>
```

### 3. Narzędzia wspomagające 

#### Detekcja struktury utworu na podstawie tekstu

Aby automatycznie analizować strukturę tekstu piosenki:

```javascript
function detectLyricsStructure(lyricsText) {
  // Podział na linie
  const lines = lyricsText.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
  
  // Znajdź powtarzające się linie (refren)
  const lineFrequency = {}
  lines.forEach(line => {
    const normalizedLine = normalizeLine(line)
    lineFrequency[normalizedLine] = (lineFrequency[normalizedLine] || 0) + 1
  })
  
  // Identyfikacja segmentów (zwrotki, refreny)
  const sections = []
  let currentSection = { type: 'verse', lines: [] }
  let currentLineIndex = 0
  
  while (currentLineIndex < lines.length) {
    const line = lines[currentLineIndex]
    const normalizedLine = normalizeLine(line)
    
    // Pusta linia oznacza nową sekcję
    if (line === '') {
      if (currentSection.lines.length > 0) {
        sections.push(currentSection)
        currentSection = { type: 'verse', lines: [] }
      }
      currentLineIndex++
      continue
    }
    
    // Sprawdź czy to potencjalny refren
    if (lineFrequency[normalizedLine] > 1) {
      // Jeśli mamy już 2 linie i wszystkie są powtarzające się
      // oraz znajdujemy się w nowej sekcji
      if (currentSection.lines.length >= 2 && 
          currentSection.lines.every(l => lineFrequency[normalizeLine(l)] > 1) &&
          currentSection.type === 'verse') {
        // Zakończ poprzednią sekcję
        if (currentSection.lines.length > 0) {
          sections.push(currentSection)
        }
        // Zacznij refren
        currentSection = { type: 'chorus', lines: [line] }
      } else {
        // Dodaj do bieżącej sekcji
        currentSection.lines.push(line)
      }
    } else {
      // Jeśli jesteśmy w refrenie i znaleźliśmy niepowtarzającą się linię
      if (currentSection.type === 'chorus') {
        // Zakończ refren
        sections.push(currentSection)
        // Zacznij nową zwrotkę
        currentSection = { type: 'verse', lines: [line] }
      } else {
        // Dodaj do bieżącej sekcji
        currentSection.lines.push(line)
      }
    }
    
    currentLineIndex++
  }
  
  // Dodaj ostatnią sekcję
  if (currentSection.lines.length > 0) {
    sections.push(currentSection)
  }
  
  return sections
}

function normalizeLine(line) {
  return line.toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}
```

#### Dopasowanie tekstu do audio w czasie dodawania piosenki

W naszej aplikacji LyraClipMAP możemy zaimplementować ten proces w momencie, gdy użytkownik dodaje nową piosenkę:

```javascript
// W komponencie AddSongView.vue
async function addSongWithLyrics() {
  try {
    this.isProcessing = true
    
    // 1. Pobierz metadane z YouTube
    const youtubeInfo = await this.fetchYoutubeInfo(this.youtubeUrl)
    
    // 2. Dodaj podstawowe informacje o piosence do bazy
    const songData = {
      title: this.title || youtubeInfo.title,
      artist: this.artist || youtubeInfo.artist,
      audioSources: [{
        url: this.youtubeUrl,
        sourceType: 'YOUTUBE',
        isMain: true
      }]
    }
    
    const newSong = await this.$api.songs.create(songData)
    
    // 3. Jeśli mamy tekst, przetwórz go
    if (this.lyrics) {
      // Jeśli to już format LRC, użyj go bezpośrednio
      if (this.lyrics.includes('[00:')) {
        await this.$api.lyrics.saveRawLRC(newSong.id, this.lyrics)
      } else {
        // W przeciwnym razie generuj LRC w tle i dodaj zwykły tekst od razu
        await this.$api.textContents.create({
          songId: newSong.id,
          content: this.lyrics,
          contentType: 'LYRICS',
          language: this.detectedLanguage || 'en'
        })
        
        // Uruchom proces synchronizacji w tle
        this.$api.lyrics.generateLRC(newSong.id)
      }
    } else {
      // Próba automatycznego znalezienia tekstu
      this.$api.lyrics.findAndSynchronize(newSong.id)
    }
    
    // 4. Przekieruj do widoku piosenki
    this.$router.push(`/songs/${newSong.id}`)
    
  } catch (error) {
    console.error('Error adding song:', error)
    this.error = 'Wystąpił błąd podczas dodawania piosenki'
  } finally {
    this.isProcessing = false
  }
}
```

## Integracja z backendem

### API do obsługi plików LRC

```typescript
// server/src/api/lyrics/lyrics.controller.ts
@Controller('lyrics')
export class LyricsController {
  constructor(private readonly lyricsService: LyricsService) {}
  
  @Post(':songId/lrc')
  async saveLRC(
    @Param('songId') songId: string,
    @Body() data: { lrcContent: string }
  ) {
    return this.lyricsService.saveLRC(songId, data.lrcContent)
  }
  
  @Get(':songId/lrc')
  async getLRC(@Param('songId') songId: string) {
    return this.lyricsService.getLRC(songId)
  }
  
  @Post(':songId/generate-lrc')
  async generateLRC(
    @Param('songId') songId: string,
    @Body() data: { method?: 'auto' | 'even' | 'ml' }
  ) {
    return this.lyricsService.generateLRC(songId, data.method || 'auto')
  }
}

// server/src/application/lyrics/lyrics.service.ts
@Injectable()
export class LyricsService {
  constructor(
    private readonly songRepository: SongRepository,
    private readonly textContentRepository: TextContentRepository,
    private readonly audioProcessingService: AudioProcessingService
  ) {}
  
  async saveLRC(songId: string, lrcContent: string) {
    // Parsowanie LRC
    const parsedLRC = this.parseLRC(lrcContent)
    
    // Zapisanie jako TextContent
    await this.textContentRepository.create({
      songId,
      content: lrcContent,
      contentType: ContentType.LYRICS,
      language: parsedLRC.metadata.language || 'unknown'
    })
    
    // Zapisanie znaczników czasu
    for (const line of parsedLRC.lines) {
      await this.timeStampRepository.create({
        songId,
        textContentId: textContent.id,
        startTime: line.time,
        // Przybliżony czas końcowy (do następnej linii lub +5s)
        endTime: line.endTime || line.time + 5,
        text: line.text
      })
    }
    
    return { success: true }
  }
  
  async getLRC(songId: string) {
    const textContent = await this.textContentRepository.findOne({
      where: {
        songId,
        contentType: ContentType.LYRICS
      }
    })
    
    if (!textContent) {
      return { lrcContent: null }
    }
    
    // Sprawdź czy zawartość to już LRC
    if (textContent.content.includes('[00:')) {
      return { lrcContent: textContent.content }
    }
    
    // Jeśli to zwykły tekst, pobierz znaczniki czasu
    const timestamps = await this.timeStampRepository.find({
      where: { textContentId: textContent.id },
      orderBy: { startTime: 'ASC' }
    })
    
    // Generowanie LRC z tekstu i znaczników
    let lrcContent = `[ti:${textContent.song.title}]\n`
    lrcContent += `[ar:${textContent.song.artist}]\n\n`
    
    for (const timestamp of timestamps) {
      const minutes = Math.floor(timestamp.startTime / 60)
      const seconds = Math.floor(timestamp.startTime % 60)
      const ms = Math.floor((timestamp.startTime % 1) * 100)
      
      lrcContent += `[${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}]${timestamp.text}\n`
    }
    
    return { lrcContent }
  }
  
  async generateLRC(songId: string, method: 'auto' | 'even' | 'ml' = 'auto') {
    // Pobierz piosenkę i jej tekst
    const song = await this.songRepository.findOneWithRelations(songId, [
      'textContents', 'audioSources'
    ])
    
    if (!song) {
      throw new NotFoundException('Song not found')
    }
    
    // Znajdź teksty
    const textContent = song.textContents.find(
      tc => tc.contentType === ContentType.LYRICS
    )
    
    if (!textContent) {
      throw new NotFoundException('Lyrics not found for this song')
    }
    
    // Pobierz audio URL
    const mainAudioSource = song.audioSources.find(as => as.isMain) || 
                          song.audioSources[0]
    
    if (!mainAudioSource) {
      throw new NotFoundException('No audio source found for this song')
    }
    
    // Pobierz czas trwania
    const audioDuration = await this.audioProcessingService.getDuration(
      mainAudioSource.url
    )
    
    // Generuj LRC odpowiednią metodą
    let lrcContent = ''
    switch (method) {
      case 'ml':
        // Zaawansowana metoda z ML
        lrcContent = await this.generateLRCWithML(
          textContent.content, 
          mainAudioSource.url
        )
        break
        
      case 'auto':
        // Na podstawie struktury utworu
        lrcContent = await this.generateLRCWithStructure(
          textContent.content,
          mainAudioSource.url,
          audioDuration
        )
        break
        
      case 'even':
      default:
        // Prosta równomierna metoda
        lrcContent = this.generateEvenlySpacedLRC(
          textContent.content,
          audioDuration
        )
        break
    }
    
    // Zapisz wygenerowane LRC
    await this.saveLRC(songId, lrcContent)
    
    return { success: true, lrcContent }
  }
  
  // Metody pomocnicze...
}
```

## Interfejs użytkownika w aplikacji

### Komponent wyświetlania zsynchronizowanych tekstów

```vue
<template>
  <div class="lyrics-player">
    <!-- Pasek kontrolny -->
    <v-card-title class="d-flex align-center py-2">
      <v-icon>mdi-music-note</v-icon>
      <span class="ml-2">{{ title }}</span>
      <v-spacer></v-spacer>
      <v-btn-toggle v-model="displayMode" dense>
        <v-btn small value="scroll">
          <v-icon small>mdi-format-align-center</v-icon>
        </v-btn>
        <v-btn small value="karaoke">
          <v-icon small>mdi-progress-download</v-icon>
        </v-btn>
      </v-btn-toggle>
    </v-card-title>
    
    <v-divider></v-divider>
    
    <!-- Tryb karaoke -->
    <div v-if="displayMode === 'karaoke'" class="karaoke-mode pa-4">
      <div class="karaoke-container">
        <div class="current-line text-h5 text-center">
          <template v-if="currentLine">
            <span v-for="(word, i) in currentLineWords" :key="i"
                  :class="{ 'highlighted': isCurrentWord(word, i) }">
              {{ word.text }}
            </span>
          </template>
          <span v-else>&nbsp;</span>
        </div>
        
        <div class="next-line text-subtitle-1 text-center text--secondary">
          {{ nextLine ? nextLine.text : '' }}
        </div>
      </div>
    </div>
    
    <!-- Tryb przewijania -->
    <div v-else class="scroll-mode">
      <v-container class="lyrics-container">
        <div 
          v-for="(line, index) in lines" 
          :key="index"
          :class="{ 
            'lyrics-line': true,
            'current': currentLineIndex === index,
            'past': currentLineIndex > index,
            'future': currentLineIndex < index
          }"
          :ref="currentLineIndex === index ? 'currentLine' : null"
        >
          {{ line.text }}
        </div>
      </v-container>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    lines: {
      type: Array,
      required: true
      // Format: [{ time: 10.5, text: 'Line text', endTime: 15.2 }]
    },
    currentTime: {
      type: Number,
      default: 0
    },
    title: {
      type: String,
      default: 'Lyrics'
    }
  },
  
  data() {
    return {
      displayMode: 'scroll',
      currentLineIndex: -1,
      currentLine: null,
      nextLine: null,
      currentLineWords: [],
      currentWordIndex: -1
    }
  },
  
  watch: {
    currentTime: {
      immediate: true,
      handler(newTime) {
        this.updateCurrentLine(newTime)
      }
    },
    
    currentLineIndex: {
      handler() {
        this.scrollToCurrentLine()
      }
    }
  },
  
  methods: {
    updateCurrentLine(time) {
      // Znajdź aktualną linię
      let nextIndex = this.lines.findIndex(line => line.time > time)
      if (nextIndex === -1) {
        nextIndex = this.lines.length
      }
      
      const index = nextIndex > 0 ? nextIndex - 1 : 0
      if (index !== this.currentLineIndex) {
        this.currentLineIndex = index
        this.currentLine = this.lines[index]
        this.nextLine = this.lines[index + 1] || null
        
        // Podziel aktualną linię na słowa dla trybu karaoke
        if (this.currentLine) {
          this.currentLineWords = this.splitLineIntoWords(this.currentLine.text)
        } else {
          this.currentLineWords = []
        }
      }
      
      // Aktualizuj aktualnie wyświetlane słowo
      this.updateCurrentWord(time)
    },
    
    splitLineIntoWords(text) {
      return text.split(/\s+/).map(word => ({
        text: word + ' '
      }))
    },
    
    updateCurrentWord(time) {
      if (!this.currentLine || !this.nextLine) return
      
      const lineStartTime = this.currentLine.time
      const lineEndTime = this.nextLine ? this.nextLine.time : this.currentLine.time + 5
      const lineDuration = lineEndTime - lineStartTime
      
      const wordCount = this.currentLineWords.length
      const timePerWord = lineDuration / wordCount
      
      // Znajdź aktualnie wypowiadane słowo
      const elapsedInLine = time - lineStartTime
      const wordIndex = Math.min(Math.floor(elapsedInLine / timePerWord), wordCount - 1)
      
      if (wordIndex >= 0 && wordIndex !== this.currentWordIndex) {
        this.currentWordIndex = wordIndex
      }
    },
    
    isCurrentWord(word, index) {
      return index <= this.currentWordIndex
    },
    
    scrollToCurrentLine() {
      this.$nextTick(() => {
        if (this.$refs.currentLine && this.$refs.currentLine[0]) {
          this.$refs.currentLine[0].scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.lyrics-container {
  height: 300px;
  overflow-y: auto;
  padding: 16px;
}

.lyrics-line {
  padding: 8px 0;
  transition: all 0.3s ease;
  font-size: 16px;
  opacity: 0.6;
  text-align: center;
}

.lyrics-line.current {
  font-size: 20px;
  font-weight: bold;
  opacity: 1;
  color: var(--v-primary-base);
}

.lyrics-line.past {
  opacity: 0.4;
}

.karaoke-mode {
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.05);
}

.karaoke-container {
  text-align: center;
}

.current-line {
  margin-bottom: 16px;
  line-height: 1.5;
}

.next-line {
  opacity: 0.6;
}

.highlighted {
  color: var(--v-primary-base);
  font-weight: bold;
}
</style>
```

## Podsumowanie

Implementacja automatycznej konwersji zwykłego tekstu na format LRC w aplikacji LyraClipMAP obejmuje:

1. **Metody generowania LRC**:
   - Równomierne rozmieszczenie linii tekstu (najprostsze)
   - Analiza struktury utworu (średnio zaawansowane)
   - Zaawansowane metody ML (najbardziej precyzyjne, ale skomplikowane)

2. **Interfejs użytkownika**:
   - Edytor do półautomatycznej synchronizacji
   - Widok podglądu synchronizacji (tryb karaoke, tryb przewijania)
   - Eksport/import plików LRC

3. **Integracja z systemem**:
   - Generowanie LRC podczas dodawania piosenki
   - API do zarządzania plikami LRC
   - Automatyczna analiza struktury tekstu

Ta implementacja zapewni użytkownikom możliwość korzystania z zsynchronizowanych tekstów nawet gdy nie są one dostępne w źródłowym formacie LRC.