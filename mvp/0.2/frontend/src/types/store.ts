/**
 * Typy dla state management (Pinia)
 */
import {
  Song,
  Artist,
  User,
  UserPreference,
  TextContent,
  Playlist,
  AudioAnalysis,
  LyricsDisplayOptions
} from './index';

/**
 * Store użytkownika
 */
export interface UserStore {
  // State
  user: User | null;
  preferences: UserPreference | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  
  // Getters
  isLoggedIn: boolean;
  username: string | null;
  avatar: string | null;
  isDarkMode: boolean;
  preferredLanguage: string;
  
  // Actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  updateUserPreferences: (preferences: Partial<UserPreference>) => Promise<void>;
  checkAuth: () => Promise<boolean>;
  clearAuthError: () => void;
}

/**
 * Store piosenek
 */
export interface SongStore {
  // State
  recentSongs: Song[];
  popularSongs: Song[];
  currentSong: Song | null;
  songLoading: boolean;
  songError: string | null;
  songDetail: Song | null;
  searchResults: {
    songs: Song[];
    total: number;
    page: number;
    totalPages: number;
  };
  searchQuery: string;
  searchLoading: boolean;
  
  // Getters
  hasSongs: boolean;
  songsByArtist: (artistId: string) => Song[];
  
  // Actions
  fetchRecentSongs: () => Promise<void>;
  fetchPopularSongs: () => Promise<void>;
  fetchSong: (id: string) => Promise<Song>;
  searchSongs: (query: string, page?: number) => Promise<void>;
  addSong: (songData: {
    title: string;
    artist: string;
    youtubeUrl: string;
    lyrics?: string;
  }) => Promise<Song>;
  updateSong: (id: string, songData: Partial<Song>) => Promise<Song>;
  deleteSong: (id: string) => Promise<void>;
  likeSong: (id: string) => Promise<void>;
  unlikeSong: (id: string) => Promise<void>;
  clearSearchResults: () => void;
}

/**
 * Store artystów
 */
export interface ArtistStore {
  // State
  artists: Artist[];
  artistsLoading: boolean;
  artistsError: string | null;
  artistDetail: Artist | null;
  
  // Getters
  artistCount: number;
  
  // Actions
  fetchArtists: () => Promise<void>;
  fetchArtist: (id: string) => Promise<Artist>;
  fetchArtistWithSongs: (id: string) => Promise<{
    artist: Artist;
    songs: Song[];
  }>;
  likeArtist: (id: string) => Promise<void>;
  unlikeArtist: (id: string) => Promise<void>;
}

/**
 * Store playlist
 */
export interface PlaylistStore {
  // State
  playlists: Playlist[];
  playlistsLoading: boolean;
  playlistsError: string | null;
  currentPlaylist: Playlist | null;
  
  // Getters
  userPlaylists: Playlist[];
  publicPlaylists: Playlist[];
  
  // Actions
  fetchPlaylists: () => Promise<void>;
  fetchPlaylist: (id: string) => Promise<Playlist>;
  createPlaylist: (playlistData: {
    name: string;
    description?: string;
    isPublic: boolean;
    songIds?: string[];
  }) => Promise<Playlist>;
  updatePlaylist: (id: string, playlistData: Partial<Playlist>) => Promise<Playlist>;
  deletePlaylist: (id: string) => Promise<void>;
  addSongToPlaylist: (playlistId: string, songId: string) => Promise<void>;
  removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
  reorderPlaylistSongs: (playlistId: string, songIds: string[]) => Promise<void>;
}

/**
 * Store odtwarzacza
 */
export interface PlayerStore {
  // State
  currentSong: Song | null;
  currentLyrics: TextContent | null;
  currentTranslation: TextContent | null;
  audioElement: HTMLAudioElement | null;
  youtubePlayer: any | null; // YouTubePlayer
  playbackState: 'playing' | 'paused' | 'stopped' | 'loading' | 'error';
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  lyricsVisible: boolean;
  translationVisible: boolean;
  displayMode: 'scroll' | 'karaoke';
  lyricsOptions: LyricsDisplayOptions;
  queue: Song[];
  history: Song[];
  repeatMode: 'none' | 'one' | 'all';
  shuffleMode: boolean;
  waveformData: number[] | null;
  audioAnalysis: AudioAnalysis | null;
  
  // Getters
  isPlaying: boolean;
  progress: number;
  formattedCurrentTime: string;
  formattedDuration: string;
  parsedLyrics: Array<{
    time: number;
    text: string;
    endTime?: number;
  }> | null;
  parsedTranslation: Array<{
    time: number;
    text: string;
    endTime?: number;
  }> | null;
  currentLyricLine: {
    text: string;
    time: number;
    endTime?: number;
  } | null;
  currentTranslationLine: {
    text: string;
    time: number;
    endTime?: number;
  } | null;
  nextInQueue: Song | null;
  
  // Actions
  playSong: (song: Song) => Promise<void>;
  playYouTube: (videoId: string) => Promise<void>;
  togglePlay: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  next: () => void;
  previous: () => void;
  toggleLyrics: () => void;
  toggleTranslation: () => void;
  setLyricsDisplayMode: (mode: 'scroll' | 'karaoke') => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  fetchLyrics: (songId: string) => Promise<void>;
  fetchWaveformData: (songId: string) => Promise<void>;
  fetchAudioAnalysis: (songId: string) => Promise<void>;
}

/**
 * Store UI
 */
export interface UIStore {
  // State
  darkMode: boolean;
  sidebarOpen: boolean;
  currentDialog: string | null;
  dialogs: {
    [key: string]: boolean;
  };
  snackbar: {
    show: boolean;
    text: string;
    color: string;
    timeout: number;
  };
  isLoading: boolean;
  searchDrawerOpen: boolean;
  
  // Getters
  isDarkMode: boolean;
  isDialogOpen: (name: string) => boolean;
  
  // Actions
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (value: boolean) => void;
  openDialog: (name: string) => void;
  closeDialog: (name: string) => void;
  closeAllDialogs: () => void;
  showSnackbar: (text: string, color?: string, timeout?: number) => void;
  hideSnackbar: () => void;
  setLoading: (value: boolean) => void;
  toggleSearchDrawer: () => void;
}

/**
 * Store treści tekstowych
 */
export interface TextContentStore {
  // State
  textContents: Record<string, TextContent[]>;
  contentLoading: boolean;
  contentError: string | null;
  
  // Getters
  getSongLyrics: (songId: string) => TextContent | null;
  getSongTranslation: (songId: string, language?: string) => TextContent | null;
  
  // Actions
  fetchTextContents: (songId: string) => Promise<TextContent[]>;
  addTextContent: (textContent: {
    songId: string;
    content: string;
    contentType: string;
    language?: string;
    source?: string;
  }) => Promise<TextContent>;
  updateTextContent: (id: string, content: string) => Promise<TextContent>;
  deleteTextContent: (id: string) => Promise<void>;
  searchLyrics: (artist: string, title: string) => Promise<string | null>;
  generateLRC: (songId: string, method: 'auto' | 'even' | 'ml') => Promise<string | null>;
  saveLRC: (songId: string, lrcContent: string) => Promise<void>;
}

/**
 * Root store
 */
export interface RootStore {
  user: UserStore;
  songs: SongStore;
  artists: ArtistStore;
  playlists: PlaylistStore;
  player: PlayerStore;
  ui: UIStore;
  textContents: TextContentStore;
}