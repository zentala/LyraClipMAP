<template>
  <div class="lyrics-display">
    <div 
      class="lyrics-container"
      :class="{ 'karaoke-mode': displayMode === 'karaoke' }"
      ref="lyricsContainer"
    >
      <div v-if="lines.length === 0" class="no-lyrics text-center py-8">
        <v-icon size="x-large" class="mb-2">mdi-text</v-icon>
        <div>No synchronized lyrics available</div>
      </div>
      
      <template v-else>
        <div 
          v-for="(line, index) in lines" 
          :key="index"
          class="lyric-line"
          :class="{
            'active': currentLineIndex === index,
            'past': index < currentLineIndex
          }"
          :id="`line-${index}`"
          @click="onLineClick(line)"
        >
          <div class="line-text" v-if="displayMode === 'scroll' || index !== currentLineIndex">
            {{ line.text }}
          </div>
          
          <div v-else-if="displayMode === 'karaoke'" class="karaoke-line">
            <span 
              v-for="(word, wordIndex) in lineSplitWords" 
              :key="wordIndex"
              class="karaoke-word"
              :class="{ 'highlighted': isWordHighlighted(wordIndex) }"
              @click.stop="onWordClick(word.text, word.time)"
            >
              {{ word.text }}
            </span>
          </div>
          
          <div 
            v-if="showTranslation && getTranslationForLine(index)"
            class="translation-line"
          >
            {{ getTranslationForLine(index) }}
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { LyricsDisplayProps, LyricsDisplayEmits } from '@/types/components';
import { LRCLine } from '@/types/index';

const props = defineProps<LyricsDisplayProps>();
const emit = defineEmits<LyricsDisplayEmits>();

// Refs
const lyricsContainer = ref<HTMLElement | null>(null);
const currentLineIndex = ref(-1);
const currentWordIndex = ref(-1);

// Default options
const defaultOptions = {
  displayMode: 'scroll' as 'scroll' | 'karaoke',
  highlightColor: '#6200EA',
  fontSize: {
    normal: 16,
    highlight: 18
  },
  autoScroll: true,
  showTranslation: false
};

// Computed
const options = computed(() => ({
  ...defaultOptions,
  ...props.options
}));

const displayMode = computed(() => options.value.displayMode);
const showTranslation = computed(() => options.value.showTranslation && props.translation?.length);

// Find the current line based on the current time
const findCurrentLineIndex = (time: number) => {
  if (!props.lines?.length) return -1;
  
  for (let i = props.lines.length - 1; i >= 0; i--) {
    const line = props.lines[i];
    if (line.time <= time) {
      // Check if we're still in this line's time range
      const nextLine = props.lines[i + 1];
      if (!nextLine || time < nextLine.time) {
        return i;
      }
    }
  }
  
  return -1;
};

// Find the current word in karaoke mode
const findCurrentWordIndex = (lineIndex: number, time: number) => {
  if (lineIndex === -1 || !props.lines || !props.lines[lineIndex]) return -1;
  
  const line = props.lines[lineIndex];
  const words = getKaraokeWords(line);
  
  for (let i = words.length - 1; i >= 0; i--) {
    if (words[i].time <= time) {
      return i;
    }
  }
  
  return -1;
};

// Get translation text for a line
const getTranslationForLine = (index: number): string | undefined => {
  if (!props.translation || !props.translation[index]) return undefined;
  return props.translation[index].text;
};

// Split a line into words with timing information
const getKaraokeWords = (line: LRCLine) => {
  // Simple implementation - split by spaces
  // In a real app, you would use more sophisticated word-level timing data
  const words = line.text.split(' ');
  const totalDuration = (line.endTime || 0) - line.time;
  const wordDuration = totalDuration / words.length;
  
  return words.map((word, index) => ({
    text: word,
    time: line.time + (index * wordDuration),
    endTime: line.time + ((index + 1) * wordDuration)
  }));
};

// Get the words of the current line for karaoke display
const lineSplitWords = computed(() => {
  if (currentLineIndex.value === -1 || !props.lines[currentLineIndex.value]) {
    return [];
  }
  
  return getKaraokeWords(props.lines[currentLineIndex.value]);
});

// Check if a word should be highlighted in karaoke mode
const isWordHighlighted = (wordIndex: number) => {
  return wordIndex <= currentWordIndex.value;
};

// Scroll the lyrics container to keep the active line visible
const scrollToActiveLine = async () => {
  if (!options.value.autoScroll || currentLineIndex.value === -1) return;
  
  await nextTick();
  
  const activeElement = document.getElementById(`line-${currentLineIndex.value}`);
  if (!activeElement || !lyricsContainer.value) return;
  
  const containerRect = lyricsContainer.value.getBoundingClientRect();
  const elementRect = activeElement.getBoundingClientRect();
  
  // Scroll the element to the center of the container
  const scrollOffset = (elementRect.top + elementRect.height / 2) - 
                       (containerRect.top + containerRect.height / 2);
  
  lyricsContainer.value.scrollBy({
    top: scrollOffset,
    behavior: 'smooth'
  });
};

// Event handlers
const onLineClick = (line: LRCLine) => {
  emit('line-click', line);
};

const onWordClick = (word: string, time: number) => {
  emit('word-click', word, time);
};

// Update highlighting based on current time
watch(() => props.currentTime, (newTime) => {
  if (newTime === undefined || !props.lines?.length) return;
  
  const newLineIndex = findCurrentLineIndex(newTime);
  if (newLineIndex !== currentLineIndex.value) {
    currentLineIndex.value = newLineIndex;
    scrollToActiveLine();
  }
  
  if (displayMode.value === 'karaoke' && newLineIndex !== -1) {
    currentWordIndex.value = findCurrentWordIndex(newLineIndex, newTime);
  }
}, { immediate: true });

// Lifecycle hooks
onMounted(() => {
  scrollToActiveLine();
});
</script>

<style scoped>
.lyrics-display {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.lyrics-container {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
  line-height: 1.5;
}

.lyric-line {
  margin-bottom: 16px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.lyric-line:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.lyric-line.active {
  font-weight: bold;
  font-size: v-bind('`${options.fontSize.highlight}px`');
  background-color: rgba(98, 0, 234, 0.1);
}

.karaoke-mode .lyric-line:not(.active) {
  opacity: 0.6;
}

.karaoke-line {
  display: inline;
}

.karaoke-word {
  display: inline-block;
  margin-right: 4px;
  transition: color 0.1s ease, font-weight 0.1s ease;
}

.karaoke-word.highlighted {
  color: v-bind('options.highlightColor');
  font-weight: bold;
}

.past {
  opacity: 0.6;
}

.translation-line {
  margin-top: 4px;
  font-size: 0.9em;
  font-style: italic;
  opacity: 0.7;
}

.no-lyrics {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(0, 0, 0, 0.5);
}
</style>