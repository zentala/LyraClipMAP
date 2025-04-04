<template>
  <div class="song-detail">
    <!-- Song Header -->
    <v-card class="mb-4">
      <v-row no-gutters>
        <v-col cols="12" sm="7" md="8">
          <div class="pa-4">
            <v-btn icon="mdi-arrow-left" variant="text" @click="goBack" class="mb-2" />
            <h1 class="text-h4 font-weight-bold">{{ song?.title }}</h1>
            <h2 class="text-h6 text-grey">{{ song?.artist?.name }}</h2>
            
            <v-chip-group class="mt-4">
              <v-chip color="primary" variant="elevated" size="small">
                {{ getSourceTypeName(song?.audioSources?.[0]?.sourceType) }}
              </v-chip>
              <v-chip variant="outlined" size="small" v-if="hasLyrics">Has Lyrics</v-chip>
              <v-chip variant="outlined" size="small" v-if="hasTranslation">Has Translation</v-chip>
            </v-chip-group>
            
            <v-divider class="my-4" />
            
            <v-row>
              <v-col cols="12" sm="6">
                <v-btn block color="primary" prepend-icon="mdi-pencil" @click="navigateToEdit">
                  Edit Song
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6">
                <v-btn block color="primary" variant="outlined" prepend-icon="mdi-playlist-plus" @click="addToPlaylist">
                  Add to Playlist
                </v-btn>
              </v-col>
            </v-row>
          </div>
        </v-col>
        <v-col cols="12" sm="5" md="4">
          <v-img :src="song?.thumbnailUrl || '/assets/default-thumbnail.jpg'" 
                height="100%" cover class="rounded-e-lg" />
        </v-col>
      </v-row>
    </v-card>
    
    <!-- Tabs Navigation -->
    <v-tabs v-model="activeTab" class="mb-4" bg-color="background">
      <v-tab value="player">
        <v-icon start>mdi-play</v-icon>
        Player
      </v-tab>
      <v-tab value="lyrics" :disabled="!hasLyrics">
        <v-icon start>mdi-text</v-icon>
        Lyrics
      </v-tab>
      <v-tab value="synchronized" :disabled="!hasSynchronizedLyrics">
        <v-icon start>mdi-music-note</v-icon>
        Karaoke
      </v-tab>
      <v-tab value="info">
        <v-icon start>mdi-information</v-icon>
        Info
      </v-tab>
    </v-tabs>
    
    <!-- Tab Content -->
    <v-window v-model="activeTab">
      <!-- Player Tab -->
      <v-window-item value="player">
        <v-card>
          <template v-if="isYouTubeSource">
            <v-responsive :aspect-ratio="16/9">
              <div id="youtube-player" ref="youtubePlayerRef"></div>
            </v-responsive>
          </template>
          <template v-else-if="audioSource">
            <WavePlayer 
              :audio-url="audioSource.url"
              :waveform-data="playerStore.waveformData"
              :options="{
                waveColor: '#A0AEC0',
                progressColor: '#6200EA',
                cursorColor: '#03DAC6',
                cursorWidth: 2,
                responsive: true,
                height: 80
              }"
              :show-controls="true"
              :show-timeline="true"
              @play="onPlayerPlay"
              @pause="onPlayerPause"
              @timeupdate="onPlayerTimeUpdate"
            />
          </template>
          <template v-else>
            <v-alert type="warning" text="No audio source available for this song" />
          </template>
        </v-card>
      </v-window-item>
      
      <!-- Lyrics Tab -->
      <v-window-item value="lyrics">
        <v-card>
          <v-card-title class="d-flex align-center">
            <span>Lyrics</span>
            <v-spacer />
            <v-btn-group variant="outlined">
              <v-btn prepend-icon="mdi-sync" :loading="fetchingLyrics" @click="refreshLyrics">Refresh</v-btn>
              <v-btn prepend-icon="mdi-pencil" @click="editLyrics">Edit</v-btn>
            </v-btn-group>
          </v-card-title>
          <v-divider />
          <v-card-text>
            <div v-if="song?.textContents?.length && lyrics" class="lyrics-display pa-4" style="white-space: pre-wrap; font-size: 1.1rem; line-height: 1.6">
              {{ lyrics }}
            </div>
            <v-alert v-else type="info" text="No lyrics available for this song" />
          </v-card-text>
        </v-card>
      </v-window-item>
      
      <!-- Synchronized Lyrics Tab -->
      <v-window-item value="synchronized">
        <v-card>
          <v-card-title class="d-flex align-center">
            <span>Synchronized Lyrics</span>
            <v-spacer />
            <v-btn-group variant="outlined">
              <v-btn-toggle v-model="lyricsDisplayMode" mandatory>
                <v-btn value="scroll" prepend-icon="mdi-format-list-text">Scroll</v-btn>
                <v-btn value="karaoke" prepend-icon="mdi-music-note">Karaoke</v-btn>
              </v-btn-toggle>
            </v-btn-group>
            <v-btn icon="mdi-translate" :color="showTranslation ? 'primary' : undefined" @click="toggleTranslation" class="ml-2" />
          </v-card-title>
          <v-divider />
          <v-card-text>
            <div style="height: 400px">
              <LyricsDisplay
                :lines="playerStore.parsedLyrics || []"
                :current-time="playerStore.currentTime"
                :options="{
                  displayMode: lyricsDisplayMode,
                  highlightColor: '#6200EA',
                  fontSize: {
                    normal: 16,
                    highlight: 18
                  },
                  autoScroll: true,
                  showTranslation: showTranslation
                }"
                :translation="playerStore.parsedTranslation"
                @line-click="onLyricLineClick"
                @word-click="onLyricWordClick"
              />
            </div>
          </v-card-text>
        </v-card>
      </v-window-item>
      
      <!-- Info Tab -->
      <v-window-item value="info">
        <v-card>
          <v-card-title>Song Information</v-card-title>
          <v-divider />
          <v-card-text>
            <v-list>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-music" />
                </template>
                <v-list-item-title>Title</v-list-item-title>
                <v-list-item-subtitle>{{ song?.title }}</v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-account-music" />
                </template>
                <v-list-item-title>Artist</v-list-item-title>
                <v-list-item-subtitle>{{ song?.artist?.name }}</v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item v-if="audioSource">
                <template v-slot:prepend>
                  <v-icon :icon="sourceTypeIcon" />
                </template>
                <v-list-item-title>Source</v-list-item-title>
                <v-list-item-subtitle>
                  <a :href="audioSource.url" target="_blank" rel="noopener noreferrer">
                    {{ audioSource.url }}
                  </a>
                </v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-calendar" />
                </template>
                <v-list-item-title>Added on</v-list-item-title>
                <v-list-item-subtitle>{{ formatDate(song?.createdAt) }}</v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item v-if="song?.description">
                <template v-slot:prepend>
                  <v-icon icon="mdi-text" />
                </template>
                <v-list-item-title>Description</v-list-item-title>
                <v-list-item-subtitle>{{ song?.description }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-window-item>
    </v-window>
    
    <!-- Add to Playlist Dialog -->
    <v-dialog v-model="addToPlaylistDialog" max-width="500px">
      <v-card>
        <v-card-title>Add to Playlist</v-card-title>
        <v-card-text>
          <v-select v-if="playlists.length > 0" v-model="selectedPlaylist" 
                   :items="playlists" item-title="name" item-value="id" label="Select Playlist" />
          <v-alert v-else type="info" text="You don't have any playlists yet" />
          
          <v-divider class="my-4" />
          
          <v-text-field v-model="newPlaylistName" label="Or create a new playlist" 
                      prepend-inner-icon="mdi-playlist-plus" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="addToPlaylistDialog = false">Cancel</v-btn>
          <v-btn color="primary" :disabled="!selectedPlaylist && !newPlaylistName" @click="confirmAddToPlaylist">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Edit Lyrics Dialog -->
    <v-dialog v-model="editLyricsDialog" max-width="800px" fullscreen>
      <v-card>
        <v-toolbar color="primary" dark>
          <v-btn icon @click="editLyricsDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Edit Lyrics</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn text @click="saveLyrics" :loading="savingLyrics">
            Save
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-textarea 
            v-model="editedLyrics" 
            auto-grow 
            hide-details 
            placeholder="Enter lyrics here..." 
            rows="25"
            class="mt-4"
          ></v-textarea>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePlayerStore } from '@/stores/player';
import WavePlayer from '@/components/player/WavePlayer.vue';
import LyricsDisplay from '@/components/lyrics/LyricsDisplay.vue';
import { Song, SourceType } from '@/types/index';
import axios from 'axios';

// Router and route
const route = useRoute();
const router = useRouter();

// Store
const playerStore = usePlayerStore();

// Refs for data
const song = ref<Song | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const activeTab = ref('player');
const lyricsDisplayMode = ref<'scroll' | 'karaoke'>('scroll');
const showTranslation = ref(false);
const fetchingLyrics = ref(false);
const youtubePlayerRef = ref<HTMLElement | null>(null);
const editLyricsDialog = ref(false);
const editedLyrics = ref('');
const savingLyrics = ref(false);
const addToPlaylistDialog = ref(false);
const selectedPlaylist = ref<string | null>(null);
const newPlaylistName = ref('');
const playlists = ref<Array<{ id: string; name: string }>>([]);

// Computed properties
const songId = computed(() => route.params.id as string);

const audioSource = computed(() => {
  if (!song.value?.audioSources?.length) return null;
  // Find main audio source or first available
  return song.value.audioSources.find(source => source.isMain) || song.value.audioSources[0];
});

const isYouTubeSource = computed(() => {
  return audioSource.value?.sourceType === 'YOUTUBE';
});

const sourceTypeIcon = computed(() => {
  if (!audioSource.value) return 'mdi-help-circle';
  
  switch (audioSource.value.sourceType) {
    case 'YOUTUBE': return 'mdi-youtube';
    case 'SPOTIFY': return 'mdi-spotify';
    case 'SOUNDCLOUD': return 'mdi-soundcloud';
    case 'MP3': return 'mdi-file-music';
    default: return 'mdi-music';
  }
});

const hasLyrics = computed(() => {
  return song.value?.textContents?.some(content => content.contentType === 'LYRICS');
});

const hasSynchronizedLyrics = computed(() => {
  if (!song.value?.textContents) return false;
  
  // Check if any lyrics content starts with '[' (LRC format)
  const lyricsContent = song.value.textContents.find(content => content.contentType === 'LYRICS')?.content;
  return !!lyricsContent && lyricsContent.trim().startsWith('[');
});

const hasTranslation = computed(() => {
  return song.value?.textContents?.some(content => content.contentType === 'TRANSLATION');
});

const lyrics = computed(() => {
  if (!song.value?.textContents) return null;
  
  const lyricsContent = song.value.textContents.find(content => content.contentType === 'LYRICS');
  return lyricsContent?.content || null;
});

// Methods
const fetchSong = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // In a real implementation, this would call your API
    // For this example, we'll simulate the API call
    const response = await axios.get(`/api/songs/${songId.value}`);
    song.value = response.data;
    
    // Load the song into the player store
    if (song.value) {
      playerStore.playSong(song.value);
    }
  } catch (err) {
    console.error('Error fetching song:', err);
    error.value = 'Failed to load song details';
  } finally {
    loading.value = false;
  }
};

const fetchPlaylists = async () => {
  try {
    // In a real implementation, this would call your API
    // For this example, we'll simulate the API call
    const response = await axios.get('/api/playlists');
    playlists.value = response.data;
  } catch (err) {
    console.error('Error fetching playlists:', err);
  }
};

const refreshLyrics = async () => {
  if (!song.value) return;
  
  fetchingLyrics.value = true;
  
  try {
    // In a real implementation, this would call your API
    // For this example, we'll simulate the API call
    await playerStore.fetchLyrics(song.value.id);
  } catch (err) {
    console.error('Error refreshing lyrics:', err);
  } finally {
    fetchingLyrics.value = false;
  }
};

const editLyrics = () => {
  editedLyrics.value = lyrics.value || '';
  editLyricsDialog.value = true;
};

const saveLyrics = async () => {
  if (!song.value) return;
  
  savingLyrics.value = true;
  
  try {
    // In a real implementation, this would call your API
    // For this example, we'll simulate the API call
    const lyricsContent = song.value.textContents?.find(content => content.contentType === 'LYRICS');
    
    if (lyricsContent) {
      // Update existing lyrics
      await axios.put(`/api/text-contents/${lyricsContent.id}`, {
        content: editedLyrics.value
      });
    } else {
      // Create new lyrics
      await axios.post(`/api/text-contents`, {
        songId: song.value.id,
        contentType: 'LYRICS',
        content: editedLyrics.value,
        language: 'EN' // Default language
      });
    }
    
    // Refresh song data
    await fetchSong();
    editLyricsDialog.value = false;
  } catch (err) {
    console.error('Error saving lyrics:', err);
  } finally {
    savingLyrics.value = false;
  }
};

const addToPlaylist = async () => {
  await fetchPlaylists();
  addToPlaylistDialog.value = true;
};

const confirmAddToPlaylist = async () => {
  if (!song.value) return;
  
  try {
    if (newPlaylistName.value) {
      // Create a new playlist first
      const newPlaylist = await axios.post('/api/playlists', {
        name: newPlaylistName.value,
        isPublic: false,
        songIds: [song.value.id]
      });
      
      // Close dialog
      addToPlaylistDialog.value = false;
      newPlaylistName.value = '';
      return;
    }
    
    if (selectedPlaylist.value) {
      // Add song to existing playlist
      await axios.post(`/api/playlists/${selectedPlaylist.value}/songs`, {
        songId: song.value.id
      });
      
      // Close dialog
      addToPlaylistDialog.value = false;
      selectedPlaylist.value = null;
    }
  } catch (err) {
    console.error('Error adding to playlist:', err);
  }
};

const onPlayerPlay = () => {
  console.log('Player started playing');
};

const onPlayerPause = () => {
  console.log('Player paused');
};

const onPlayerTimeUpdate = (time: number) => {
  // Time updates are handled by the player store
};

const onLyricLineClick = (line: { time: number; text: string }) => {
  // Seek to the time of the clicked line
  playerStore.seek(line.time);
};

const onLyricWordClick = (word: string, time: number) => {
  // Seek to the time of the clicked word
  playerStore.seek(time);
};

const toggleTranslation = () => {
  showTranslation.value = !showTranslation.value;
  playerStore.toggleTranslation();
};

const goBack = () => {
  router.back();
};

const navigateToEdit = () => {
  router.push(`/songs/${songId.value}/edit`);
};

// Utility methods
const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const getSourceTypeName = (type?: SourceType | string): string => {
  if (!type) return 'Unknown';
  
  return type.toString();
};

// Watchers
watch(lyricsDisplayMode, (newMode) => {
  playerStore.setLyricsDisplayMode(newMode);
});

// Lifecycle hooks
onMounted(async () => {
  await fetchSong();
});
</script>

<style scoped>
.song-detail {
  max-width: 1200px;
  margin: 0 auto;
}

#youtube-player {
  width: 100%;
  height: 100%;
}
</style>