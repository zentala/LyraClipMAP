<template>
  <div class="home">
    <!-- Hero Section -->
    <v-card class="mb-6" elevation="3" rounded="lg">
      <v-img src="/assets/music-banner.jpg" height="200" cover>
        <template v-slot:placeholder>
          <v-row class="fill-height" align="center" justify="center">
            <v-progress-circular indeterminate color="primary" />
          </v-row>
        </template>
        <div class="d-flex flex-column fill-height justify-end align-start pa-6 bg-black bg-opacity-50">
          <h1 class="text-h4 text-white font-weight-bold">Welcome to LyraClipMAP</h1>
          <p class="text-subtitle-1 text-white">Your personal music library with synchronized lyrics</p>
        </div>
      </v-img>
      <v-card-actions>
        <v-btn color="primary" variant="elevated" prepend-icon="mdi-music-note-plus" @click="navigateTo('/songs/add')">Add Song</v-btn>
        <v-btn color="secondary" variant="text" prepend-icon="mdi-magnify" @click="focusSearch">Search Library</v-btn>
      </v-card-actions>
    </v-card>
    
    <!-- Recently Added Section -->
    <v-sheet class="mb-6" rounded="lg" elevation="1">
      <v-card-title class="d-flex align-center">
        <v-icon start icon="mdi-clock-outline" />
        Recently Added
        <v-spacer />
        <v-btn variant="text" size="small" @click="navigateTo('/songs?sort=recent')">View All</v-btn>
      </v-card-title>
      <v-divider />
      <v-row>
        <v-col v-for="(song, index) in recentSongs" :key="song.id" cols="12" sm="6" md="4" lg="3">
          <v-card @click="navigateTo(`/songs/${song.id}`)" class="h-100">
            <v-img :src="song.thumbnailUrl || '/assets/default-thumbnail.jpg'" height="160" cover>
              <template v-slot:placeholder>
                <v-row class="fill-height" align="center" justify="center">
                  <v-progress-circular indeterminate color="primary" />
                </v-row>
              </template>
            </v-img>
            <v-card-title class="text-subtitle-1 text-truncate">{{ song.title }}</v-card-title>
            <v-card-subtitle class="text-caption text-truncate">{{ song.artist.name }}</v-card-subtitle>
            <v-card-actions>
              <v-btn icon="mdi-play" variant="text" @click.stop="playSong(song)" />
              <v-spacer />
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props" />
                </template>
                <v-list>
                  <v-list-item prepend-icon="mdi-pencil" title="Edit" @click.stop="navigateTo(`/songs/${song.id}/edit`)" />
                  <v-list-item prepend-icon="mdi-playlist-plus" title="Add to Playlist" @click.stop="addToPlaylist(song.id)" />
                </v-list>
              </v-menu>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-sheet>
    
    <!-- Playlists Section -->
    <v-sheet class="mb-6" rounded="lg" elevation="1" v-if="isLoggedIn">
      <v-card-title class="d-flex align-center">
        <v-icon start icon="mdi-playlist-star" />
        Your Playlists
        <v-spacer />
        <v-btn variant="text" size="small" @click="navigateTo('/playlists')">View All</v-btn>
      </v-card-title>
      <v-divider />
      <v-row>
        <v-col v-for="(playlist, index) in userPlaylists" :key="playlist.id" cols="12" sm="6" md="4" lg="3">
          <v-card @click="navigateTo(`/playlists/${playlist.id}`)" class="h-100">
            <div class="playlist-card-image d-flex align-center justify-center bg-grey-darken-2" style="height: 160px;">
              <v-icon size="64">mdi-playlist-music</v-icon>
            </div>
            <v-card-title class="text-subtitle-1 text-truncate">{{ playlist.name }}</v-card-title>
            <v-card-subtitle class="text-caption">{{ playlist.songCount }} songs</v-card-subtitle>
            <v-card-actions>
              <v-btn icon="mdi-play" variant="text" @click.stop="playPlaylist(playlist)" />
              <v-spacer />
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props" />
                </template>
                <v-list>
                  <v-list-item prepend-icon="mdi-pencil" title="Edit" @click.stop="navigateTo(`/playlists/${playlist.id}/edit`)" />
                  <v-list-item prepend-icon="mdi-delete" title="Delete" @click.stop="confirmDelete(playlist.id, 'playlist')" color="error" />
                </v-list>
              </v-menu>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-sheet>
    
    <!-- Popular Songs Section -->
    <v-sheet rounded="lg" elevation="1">
      <v-card-title class="d-flex align-center">
        <v-icon start icon="mdi-trending-up" />
        Popular Songs
        <v-spacer />
        <v-btn variant="text" size="small" @click="navigateTo('/songs?sort=popular')">View All</v-btn>
      </v-card-title>
      <v-divider />
      <v-row>
        <v-col v-for="(song, index) in popularSongs" :key="song.id" cols="12" sm="6" md="4" lg="3">
          <v-card @click="navigateTo(`/songs/${song.id}`)" class="h-100">
            <v-img :src="song.thumbnailUrl || '/assets/default-thumbnail.jpg'" height="160" cover>
              <template v-slot:placeholder>
                <v-row class="fill-height" align="center" justify="center">
                  <v-progress-circular indeterminate color="primary" />
                </v-row>
              </template>
            </v-img>
            <v-card-title class="text-subtitle-1 text-truncate">{{ song.title }}</v-card-title>
            <v-card-subtitle class="text-caption text-truncate">{{ song.artist.name }}</v-card-subtitle>
            <v-card-actions>
              <v-btn icon="mdi-play" variant="text" @click.stop="playSong(song)" />
              <v-spacer />
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props" />
                </template>
                <v-list>
                  <v-list-item prepend-icon="mdi-pencil" title="Edit" @click.stop="navigateTo(`/songs/${song.id}/edit`)" />
                  <v-list-item prepend-icon="mdi-playlist-plus" title="Add to Playlist" @click.stop="addToPlaylist(song.id)" />
                </v-list>
              </v-menu>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-sheet>
    
    <!-- Add to playlist dialog -->
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
    
    <!-- Confirm Delete Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title>Delete {{ deleteItemType }}</v-card-title>
        <v-card-text>
          Are you sure you want to delete this {{ deleteItemType.toLowerCase() }}? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePlayerStore } from '@/stores/player';
import { Song, Playlist } from '@/types/index';
import axios from 'axios';

// Router
const router = useRouter();

// Store
const playerStore = usePlayerStore();

// Refs for data
const recentSongs = ref<Song[]>([]);
const popularSongs = ref<Song[]>([]);
const userPlaylists = ref<Playlist[]>([]);
const loading = ref(false);
const isLoggedIn = ref(false);
const addToPlaylistDialog = ref(false);
const selectedPlaylist = ref<string | null>(null);
const newPlaylistName = ref('');
const playlists = ref<Array<{ id: string; name: string }>>([]);
const songToAddToPlaylist = ref<string | null>(null);
const deleteDialog = ref(false);
const deleteItemId = ref<string | null>(null);
const deleteItemType = ref<string>('Item');

// Methods
const fetchData = async () => {
  loading.value = true;
  
  try {
    // In a real implementation, this would call your API
    // For this example, we'll simulate API calls
    
    // Fetch recent songs
    const recentResponse = await axios.get('/api/songs?sort=recent&limit=8');
    recentSongs.value = recentResponse.data.data || [];
    
    // Fetch popular songs
    const popularResponse = await axios.get('/api/songs?sort=popular&limit=8');
    popularSongs.value = popularResponse.data.data || [];
    
    // Fetch user playlists if logged in
    if (isLoggedIn.value) {
      const playlistsResponse = await axios.get('/api/playlists?limit=4');
      userPlaylists.value = playlistsResponse.data.data || [];
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
};

const navigateTo = (path: string) => {
  router.push(path);
};

const playSong = (song: Song) => {
  playerStore.playSong(song);
};

const playPlaylist = (playlist: Playlist) => {
  if (!playlist.songs?.length) return;
  
  // Add all songs to queue
  playlist.songs.forEach(song => {
    playerStore.addToQueue(song);
  });
  
  // Play the first song
  playerStore.next();
};

const addToPlaylist = async (songId: string) => {
  songToAddToPlaylist.value = songId;
  
  // Fetch playlists
  try {
    const response = await axios.get('/api/playlists');
    playlists.value = response.data.data || [];
  } catch (error) {
    console.error('Error fetching playlists:', error);
  }
  
  addToPlaylistDialog.value = true;
};

const confirmAddToPlaylist = async () => {
  if (!songToAddToPlaylist.value) return;
  
  try {
    if (newPlaylistName.value) {
      // Create a new playlist first
      const newPlaylist = await axios.post('/api/playlists', {
        name: newPlaylistName.value,
        isPublic: false,
        songIds: [songToAddToPlaylist.value]
      });
      
      // Close dialog
      addToPlaylistDialog.value = false;
      newPlaylistName.value = '';
      songToAddToPlaylist.value = null;
      
      // Refresh playlists
      fetchData();
      return;
    }
    
    if (selectedPlaylist.value) {
      // Add song to existing playlist
      await axios.post(`/api/playlists/${selectedPlaylist.value}/songs`, {
        songId: songToAddToPlaylist.value
      });
      
      // Close dialog
      addToPlaylistDialog.value = false;
      selectedPlaylist.value = null;
      songToAddToPlaylist.value = null;
    }
  } catch (error) {
    console.error('Error adding to playlist:', error);
  }
};

const confirmDelete = async (id?: string, type?: string) => {
  if (id && type) {
    // Opening the confirmation dialog
    deleteItemId.value = id;
    deleteItemType.value = type.charAt(0).toUpperCase() + type.slice(1);
    deleteDialog.value = true;
    return;
  }
  
  // Performing the actual delete
  if (!deleteItemId.value) {
    deleteDialog.value = false;
    return;
  }
  
  try {
    if (deleteItemType.value.toLowerCase() === 'playlist') {
      await axios.delete(`/api/playlists/${deleteItemId.value}`);
    } else if (deleteItemType.value.toLowerCase() === 'song') {
      await axios.delete(`/api/songs/${deleteItemId.value}`);
    }
    
    // Refresh data
    fetchData();
    
    // Close dialog
    deleteDialog.value = false;
    deleteItemId.value = null;
  } catch (error) {
    console.error(`Error deleting ${deleteItemType.value.toLowerCase()}:`, error);
  }
};

const focusSearch = () => {
  // Focus the search input in the app bar
  const searchInput = document.querySelector('.v-autocomplete input') as HTMLInputElement;
  if (searchInput) {
    searchInput.focus();
  }
};

// Lifecycle hooks
onMounted(async () => {
  // Simulate checking if user is logged in
  isLoggedIn.value = localStorage.getItem('isLoggedIn') === 'true';
  
  // Fetch data
  await fetchData();
});
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

.playlist-card-image {
  background-color: rgba(0, 0, 0, 0.1);
}
</style>