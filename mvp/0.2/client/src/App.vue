<template>
  <v-app :theme="theme">
    <v-app-bar app position="fixed" elevation="2" color="primary" prominent>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      
      <v-app-bar-title class="text-uppercase">
        <router-link to="/" class="text-decoration-none text-white">
          LyraClipMAP
        </router-link>
      </v-app-bar-title>
      
      <v-autocomplete
        v-model="searchModel"
        v-model:search="searchQuery"
        placeholder="Search songs, artists, or lyrics..."
        prepend-inner-icon="mdi-magnify"
        clearable
        hide-details
        variant="solo-filled"
        rounded
        bg-color="surface-variant"
        return-object
        no-filter
        auto-select-first
        :loading="searching"
        :items="searchResults"
        item-title="title"
        item-value="id"
        @update:search="debouncedSearch"
        @update:model-value="handleSearchSelection"
        class="mx-4 hidden-sm-and-down"
        style="max-width: 500px"
      >
        <template v-slot:item="{ item, props }">
          <v-list-item v-bind="props">
            <template v-slot:prepend>
              <v-icon :icon="getSearchResultIcon(item.raw)" color="primary" />
            </template>
            <v-list-item-title>{{ item.raw.title }}</v-list-item-title>
            <v-list-item-subtitle>{{ item.raw.subtitle }}</v-list-item-subtitle>
          </v-list-item>
        </template>
        
        <template v-slot:no-data>
          <v-list-item>
            <v-list-item-title>
              Start typing to search
            </v-list-item-title>
          </v-list-item>
        </template>
      </v-autocomplete>
      
      <v-spacer />
      
      <v-btn icon @click="toggleTheme">
        <v-icon>{{ theme === 'dark' ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>
      
      <v-menu v-if="isLoggedIn">
        <template v-slot:activator="{ props }">
          <v-avatar class="ml-4" v-bind="props">
            <v-img :src="user.avatarUrl || '/assets/default-avatar.jpg'" />
          </v-avatar>
        </template>
        <v-list>
          <v-list-item prepend-icon="mdi-account" title="Profile" @click="navigateTo('/profile')" />
          <v-list-item prepend-icon="mdi-playlist-music" title="My Playlists" @click="navigateTo('/playlists')" />
          <v-list-item prepend-icon="mdi-cog" title="Settings" @click="navigateTo('/settings')" />
          <v-divider />
          <v-list-item prepend-icon="mdi-logout" title="Logout" @click="logout" />
        </v-list>
      </v-menu>
      <v-btn v-else text="Login" prepend-icon="mdi-login" variant="text" @click="showLoginDialog" />
    </v-app-bar>
    
    <v-navigation-drawer v-model="drawer" app temporary>
      <v-list>
        <v-list-item prepend-icon="mdi-home" title="Home" value="home" @click="navigateTo('/')" />
        <v-list-item prepend-icon="mdi-music-note" title="Songs" value="songs" @click="navigateTo('/songs')" />
        <v-list-item prepend-icon="mdi-playlist-music" title="Playlists" value="playlists" @click="navigateTo('/playlists')" />
        <v-list-item prepend-icon="mdi-account-music" title="Artists" value="artists" @click="navigateTo('/artists')" />
        <v-list-item prepend-icon="mdi-history" title="Recent" value="recent" @click="navigateTo('/songs?sort=recent')" />
      </v-list>
      <template v-slot:append>
        <v-list>
          <v-list-item prepend-icon="mdi-music-note-plus" title="Add Song" value="add" @click="navigateTo('/songs/add')" />
        </v-list>
      </template>
    </v-navigation-drawer>
    
    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
    
    <v-footer app padless>
      <v-divider />
      <v-container>
        <v-row no-gutters>
          <v-col cols="12" sm="6">
            <div class="text-caption">© {{ new Date().getFullYear() }} LyraClipMAP</div>
          </v-col>
          <v-col cols="12" sm="6" class="text-right">
            <v-btn icon="mdi-github" variant="text" href="https://github.com/yourusername/LyraClipMAP" target="_blank" />
            <v-btn icon="mdi-help-circle" variant="text" @click="showHelpDialog" />
          </v-col>
        </v-row>
      </v-container>
    </v-footer>
    
    <!-- Player Mini -->
    <v-footer app class="pa-0" v-if="playerStore.currentSong" style="z-index: 5">
      <v-card width="100%" elevation="4">
        <div class="d-flex align-center pa-2">
          <v-img
            :src="playerStore.currentSong.thumbnailUrl || '/assets/default-thumbnail.jpg'"
            width="50"
            height="50"
            cover
            class="rounded mr-3"
          ></v-img>
          
          <div class="flex-grow-1">
            <div class="text-subtitle-2 text-truncate">{{ playerStore.currentSong.title }}</div>
            <div class="text-caption text-truncate">{{ playerStore.currentSong.artist?.name }}</div>
          </div>
          
          <v-btn icon @click="playerStore.previous">
            <v-icon>mdi-skip-previous</v-icon>
          </v-btn>
          
          <v-btn icon @click="playerStore.togglePlay" color="primary">
            <v-icon>{{ playerStore.isPlaying ? 'mdi-pause' : 'mdi-play' }}</v-icon>
          </v-btn>
          
          <v-btn icon @click="playerStore.next">
            <v-icon>mdi-skip-next</v-icon>
          </v-btn>
          
          <v-btn icon @click="playerStore.toggleLyrics">
            <v-icon>mdi-text</v-icon>
          </v-btn>
          
          <v-btn icon @click="navigateTo(`/songs/${playerStore.currentSong.id}`)">
            <v-icon>mdi-arrow-expand</v-icon>
          </v-btn>
        </div>
        <v-progress-linear 
          v-model="playerStore.progress" 
          height="2"
          color="primary" 
          @click="onProgressClick"
        ></v-progress-linear>
      </v-card>
    </v-footer>
    
    <!-- Login Dialog -->
    <v-dialog v-model="loginDialog" max-width="400">
      <v-card>
        <v-card-title>Login</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="login">
            <v-text-field
              v-model="loginForm.email"
              label="Email"
              prepend-inner-icon="mdi-email"
              type="email"
              required
            />
            <v-text-field
              v-model="loginForm.password"
              label="Password"
              prepend-inner-icon="mdi-lock"
              type="password"
              required
            />
            <v-checkbox
              v-model="loginForm.rememberMe"
              label="Remember me"
              hide-details
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="loginDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="login" :loading="loggingIn">Login</v-btn>
        </v-card-actions>
        <v-divider />
        <v-card-text class="text-center">
          <p>Don't have an account?</p>
          <v-btn variant="text" color="primary" @click="showRegisterDialog">Register</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
    
    <!-- Help Dialog -->
    <v-dialog v-model="helpDialog" max-width="600px">
      <v-card>
        <v-card-title>Help</v-card-title>
        <v-divider />
        <v-card-text>
          <h3 class="text-h6 mb-2">Getting Started</h3>
          <p>LyraClipMAP helps you manage your music collection with synchronized lyrics. Here's how to use it:</p>
          
          <v-list>
            <v-list-item prepend-icon="mdi-music-note-plus">
              <v-list-item-title>Adding Songs</v-list-item-title>
              <v-list-item-subtitle>
                Add songs by providing a YouTube URL. The app will automatically extract information.
              </v-list-item-subtitle>
            </v-list-item>
            
            <v-list-item prepend-icon="mdi-text">
              <v-list-item-title>Finding Lyrics</v-list-item-title>
              <v-list-item-subtitle>
                Lyrics are fetched automatically from multiple sources, or you can add them manually.
              </v-list-item-subtitle>
            </v-list-item>
            
            <v-list-item prepend-icon="mdi-playlist-music">
              <v-list-item-title>Creating Playlists</v-list-item-title>
              <v-list-item-subtitle>
                Organize your music by creating playlists and adding songs to them.
              </v-list-item-subtitle>
            </v-list-item>
            
            <v-list-item prepend-icon="mdi-magnify">
              <v-list-item-title>Searching</v-list-item-title>
              <v-list-item-subtitle>
                Search for songs by title, artist, or lyrics content.
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="helpDialog = false">Got it</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePlayerStore } from '@/stores/player';
import { useTheme } from 'vuetify';
import { debounce } from '@vueuse/core';
import axios from 'axios';

// Router
const router = useRouter();

// Vuetify theme
const vuetifyTheme = useTheme();
const theme = ref(localStorage.getItem('theme') || 'light');

// Store
const playerStore = usePlayerStore();

// Refs for UI state
const drawer = ref(false);
const searchQuery = ref('');
const searchResults = ref([]);
const searchModel = ref(null);
const searching = ref(false);
const loginDialog = ref(false);
const helpDialog = ref(false);
const loggingIn = ref(false);

// Mock user state (would come from auth store in real app)
const isLoggedIn = ref(false);
const user = ref({
  id: '123',
  name: 'User',
  email: 'user@example.com',
  avatarUrl: ''
});

// Form state
const loginForm = ref({
  email: '',
  password: '',
  rememberMe: false
});

// Methods
const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  vuetifyTheme.global.name.value = theme.value;
  localStorage.setItem('theme', theme.value);
};

const navigateTo = (path: string) => {
  router.push(path);
  drawer.value = false;
};

const showLoginDialog = () => {
  loginDialog.value = true;
};

const showRegisterDialog = () => {
  // Would show register dialog
  loginDialog.value = false;
};

const showHelpDialog = () => {
  helpDialog.value = true;
};

const login = async () => {
  loggingIn.value = true;
  
  try {
    // In a real app, this would call your auth API
    // For demo purposes, we'll just simulate success
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    isLoggedIn.value = true;
    loginDialog.value = false;
    
    // Reset form
    loginForm.value = {
      email: '',
      password: '',
      rememberMe: false
    };
  } catch (err) {
    console.error('Login failed:', err);
  } finally {
    loggingIn.value = false;
  }
};

const logout = async () => {
  // In a real app, this would call your auth API
  // For demo purposes, we'll just simulate logout
  isLoggedIn.value = false;
};

const debouncedSearch = debounce(async (query: string) => {
  if (!query || query.length < 2) {
    searchResults.value = [];
    return;
  }
  
  searching.value = true;
  
  try {
    // In a real app, this would call your search API
    // For demo purposes, we'll simulate search results
    await new Promise(resolve => setTimeout(resolve, 300));
    
    searchResults.value = [
      {
        id: '1',
        title: 'Example Song',
        subtitle: 'Example Artist',
        type: 'song'
      },
      {
        id: '2',
        title: 'Another Song',
        subtitle: 'Another Artist',
        type: 'song'
      },
      {
        id: '3',
        title: 'Example Artist',
        subtitle: '5 songs',
        type: 'artist'
      },
      {
        id: '4',
        title: 'Lyrics Match',
        subtitle: 'Found in "Example Song"',
        type: 'lyrics',
        songId: '1'
      }
    ];
  } catch (err) {
    console.error('Search failed:', err);
    searchResults.value = [];
  } finally {
    searching.value = false;
  }
}, 300);

const handleSearchSelection = (selected: any) => {
  if (!selected) return;
  
  // Navigate based on type
  switch (selected.type) {
    case 'song':
      navigateTo(`/songs/${selected.id}`);
      break;
    case 'artist':
      navigateTo(`/artists/${selected.id}`);
      break;
    case 'lyrics':
      navigateTo(`/songs/${selected.songId}`);
      break;
    default:
      navigateTo(`/search?q=${searchQuery.value}`);
  }
  
  // Reset search
  searchQuery.value = '';
  searchModel.value = null;
};

const getSearchResultIcon = (item: any): string => {
  switch (item.type) {
    case 'song':
      return 'mdi-music-note';
    case 'artist':
      return 'mdi-account-music';
    case 'lyrics':
      return 'mdi-text';
    default:
      return 'mdi-magnify';
  }
};

const onProgressClick = (event: MouseEvent) => {
  const element = event.target as HTMLElement;
  const rect = element.getBoundingClientRect();
  const clickPosition = event.clientX - rect.left;
  const percentage = (clickPosition / rect.width) * 100;
  
  // Calculate time and seek
  const seekTime = (percentage / 100) * playerStore.duration;
  playerStore.seek(seekTime);
};

// Watchers
watch(theme, (newTheme) => {
  vuetifyTheme.global.name.value = newTheme;
});

// Lifecycle hooks
onMounted(() => {
  // Set the theme from localStorage
  vuetifyTheme.global.name.value = theme.value;
});
</script>

<style>
.v-app-bar-title a {
  color: inherit;
}

.v-progress-linear {
  cursor: pointer;
}
</style>