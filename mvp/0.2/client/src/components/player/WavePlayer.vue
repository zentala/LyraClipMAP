<template>
  <div class="wave-player">
    <div class="wave-container" ref="waveContainer"></div>
    
    <div v-if="showControls" class="player-controls d-flex align-center mt-2">
      <v-btn 
        icon 
        :color="isPlaying ? 'primary' : undefined"
        @click="togglePlay"
      >
        <v-icon>{{ isPlaying ? 'mdi-pause' : 'mdi-play' }}</v-icon>
      </v-btn>
      
      <div class="time-display text-caption mx-2">
        {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
      </div>
      
      <v-slider
        v-model="sliderPosition"
        class="mx-2 flex-grow-1"
        hide-details
        density="compact"
        color="primary"
        @update:modelValue="onSliderChange"
        @mousedown="onSliderMouseDown"
        @mouseup="onSliderMouseUp"
      ></v-slider>
      
      <v-btn
        icon
        @click="toggleMute"
      >
        <v-icon>
          {{ isMuted ? 'mdi-volume-off' : volume > 0.5 ? 'mdi-volume-high' : 'mdi-volume-medium' }}
        </v-icon>
      </v-btn>
      
      <v-slider
        v-model="volume"
        class="mx-2"
        max="1"
        step="0.01"
        hide-details
        density="compact"
        color="primary"
        style="max-width: 100px"
        @update:modelValue="onVolumeChange"
      ></v-slider>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, watch, computed, nextTick } from 'vue';
import { WavePlayerProps, WavePlayerEmits } from '@/types/components';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions';
import MarkersPlugin from 'wavesurfer.js/dist/plugins/markers';

const props = defineProps<WavePlayerProps>();
const emit = defineEmits<WavePlayerEmits>();

// Refs
const waveContainer = ref<HTMLElement | null>(null);
const wavesurfer = ref<any>(null);
const isReady = ref(false);
const isPlaying = ref(false);
const isMuted = ref(false);
const volume = ref(0.8);
const currentTime = ref(0);
const duration = ref(0);
const sliderPosition = ref(0);
const isSliderDragging = ref(false);

// Initialize WaveSurfer instance
const initWaveSurfer = async () => {
  if (!waveContainer.value) return;
  
  const plugins = [
    RegionsPlugin.create(),
    MarkersPlugin.create()
  ];
  
  // Default options for WaveSurfer
  const defaultOptions = {
    waveColor: '#A0AEC0',
    progressColor: '#6200EA',
    cursorColor: '#03DAC6',
    cursorWidth: 2,
    responsive: true,
    fillParent: true,
    scrollParent: false,
    height: 80,
    normalize: true,
    plugins
  };
  
  // Create WaveSurfer instance with merged options
  wavesurfer.value = WaveSurfer.create({
    container: waveContainer.value,
    ...defaultOptions,
    ...(props.options || {})
  });
  
  // Load audio file
  if (props.audioUrl) {
    await loadAudio();
  }
  
  // Set up event listeners
  setupEventListeners();
};

// Load audio from URL or pre-loaded peaks data
const loadAudio = async () => {
  if (!wavesurfer.value || !props.audioUrl) return;
  
  try {
    if (props.waveformData) {
      // Load pre-generated waveform data if available
      await wavesurfer.value.load(props.audioUrl, props.peaks || [], 'auto');
    } else {
      // Load audio from URL and generate waveform
      await wavesurfer.value.load(props.audioUrl);
    }
    
    // Set initial volume
    wavesurfer.value.setVolume(volume.value);
    
    // Add regions if provided
    addRegions();
    
    // Add markers if provided
    addMarkers();
    
    isReady.value = true;
    emit('ready');
  } catch (error) {
    console.error('Error loading audio:', error);
  }
};

// Set up event listeners for WaveSurfer
const setupEventListeners = () => {
  if (!wavesurfer.value) return;
  
  wavesurfer.value.on('play', () => {
    isPlaying.value = true;
    emit('play');
  });
  
  wavesurfer.value.on('pause', () => {
    isPlaying.value = false;
    emit('pause');
  });
  
  wavesurfer.value.on('timeupdate', (currentTimeValue: number) => {
    if (!isSliderDragging.value) {
      currentTime.value = currentTimeValue;
      sliderPosition.value = (currentTimeValue / duration.value) * 100;
      emit('timeupdate', currentTimeValue);
    }
  });
  
  wavesurfer.value.on('ready', () => {
    duration.value = wavesurfer.value.getDuration();
  });
  
  wavesurfer.value.on('region-click', (region: any) => {
    emit('region-click', region.id);
  });
  
  wavesurfer.value.on('marker-click', (marker: any) => {
    emit('marker-click', marker.id);
  });
};

// Add regions to the waveform
const addRegions = () => {
  if (!wavesurfer.value || !props.regions) return;
  
  const regionsPlugin = wavesurfer.value.getPlugin('regions');
  
  props.regions.forEach(region => {
    regionsPlugin.addRegion({
      id: region.id,
      start: region.start,
      end: region.end,
      color: region.color,
      data: region.data
    });
  });
};

// Add markers to the waveform
const addMarkers = () => {
  if (!wavesurfer.value || !props.markers) return;
  
  const markersPlugin = wavesurfer.value.getPlugin('markers');
  
  props.markers.forEach(marker => {
    markersPlugin.add([{
      time: marker.time,
      label: marker.label,
      color: marker.color,
      id: marker.id
    }]);
  });
};

// Format time to MM:SS
const formatTime = (timeInSeconds: number): string => {
  if (isNaN(timeInSeconds)) return '00:00';
  
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Player control methods
const togglePlay = () => {
  if (!wavesurfer.value) return;
  wavesurfer.value.playPause();
};

const toggleMute = () => {
  if (!wavesurfer.value) return;
  
  isMuted.value = !isMuted.value;
  wavesurfer.value.setMuted(isMuted.value);
};

const onVolumeChange = (newVolume: number) => {
  if (!wavesurfer.value) return;
  
  volume.value = newVolume;
  wavesurfer.value.setVolume(newVolume);
  
  if (newVolume > 0 && isMuted.value) {
    isMuted.value = false;
    wavesurfer.value.setMuted(false);
  }
};

const onSliderMouseDown = () => {
  isSliderDragging.value = true;
};

const onSliderMouseUp = () => {
  isSliderDragging.value = false;
};

const onSliderChange = (newPosition: number) => {
  if (!wavesurfer.value || !duration.value) return;
  
  const timeValue = (newPosition / 100) * duration.value;
  currentTime.value = timeValue;
  
  if (wavesurfer.value.isReady) {
    wavesurfer.value.seekTo(newPosition / 100);
    emit('seek', timeValue);
  }
};

// Watch for prop changes
watch(() => props.audioUrl, async (newUrl) => {
  if (newUrl && wavesurfer.value) {
    await loadAudio();
  }
});

// Lifecycle hooks
onMounted(async () => {
  await nextTick();
  await initWaveSurfer();
});

onBeforeUnmount(() => {
  if (wavesurfer.value) {
    wavesurfer.value.destroy();
  }
});
</script>

<style scoped>
.wave-player {
  width: 100%;
}

.wave-container {
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 8px;
}

.player-controls {
  min-height: 40px;
}

.time-display {
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
</style>