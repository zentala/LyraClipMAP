/**
 * Główne typy dla aplikacji LyraClipMAP
 */

/**
 * Typy źródeł audio
 */
export enum SourceType {
  YOUTUBE = 'YOUTUBE',
  SPOTIFY = 'SPOTIFY',
  SOUNDCLOUD = 'SOUNDCLOUD',
  MP3 = 'MP3',
  OTHER = 'OTHER'
}

/**
 * Typy treści tekstowych
 */
export enum ContentType {
  LYRICS = 'LYRICS',
  TRANSLATION = 'TRANSLATION',
  TRANSCRIPTION = 'TRANSCRIPTION',
  DESCRIPTION = 'DESCRIPTION',
  CHORDS = 'CHORDS',
  SHEET_MUSIC = 'SHEET_MUSIC'
}

/**
 * Typy segmentów utworu (dla analizy audio)
 */
export enum SegmentType {
  INTRO = 'INTRO',
  VERSE = 'VERSE',
  CHORUS = 'CHORUS',
  BRIDGE = 'BRIDGE',
  OUTRO = 'OUTRO',
  INSTRUMENTAL = 'INSTRUMENTAL',
  SOLO = 'SOLO',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Podstawowe interfejsy modeli
 */

/**
 * Interfejs użytkownika
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interfejs preferencji użytkownika
 */
export interface UserPreference {
  id: string;
  userId: string;
  darkMode: boolean;
  preferredLanguage?: string;
  showLyrics: boolean;
  autoPlayVideos: boolean;
}

/**
 * Interfejs artysty
 */
export interface Artist {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  songCount?: number; // Dla widoków listy
}

/**
 * Interfejs artysty z polubionymi
 */
export interface ArtistWithLikes extends Artist {
  isLiked?: boolean;
  likeCount?: number;
}

/**
 * Interfejs piosenki
 */
export interface Song {
  id: string;
  title: string;
  artistId: string;
  description?: string;
  duration?: number;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relacje
  artist?: Artist;
  audioSources?: AudioSource[];
  textContents?: TextContent[];
}

/**
 * Interfejs piosenki z rozszerzonymi danymi
 */
export interface SongWithDetails extends Song {
  isLiked?: boolean;
  likeCount?: number;
  inPlaylists?: { id: string; name: string }[];
  hasLyrics?: boolean;
  hasTranslation?: boolean;
  wordTimestampsCount?: number;
}

/**
 * Interfejs źródła audio
 */
export interface AudioSource {
  id: string;
  songId: string;
  url: string;
  sourceType: SourceType;
  isMain: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interfejs treści tekstowej
 */
export interface TextContent {
  id: string;
  songId: string;
  content: string;
  contentType: ContentType;
  language?: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interfejs znacznika czasowego słowa
 */
export interface WordTimestamp {
  id: string;
  songId: string;
  textContentId: string;
  word: string;
  startTime: number;
  endTime: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interfejs znacznika czasowego linii
 */
export interface LineTimestamp {
  id: string;
  songId: string;
  textContentId: string;
  lineNumber: number;
  text: string;
  startTime: number;
  endTime: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interfejs playlisty
 */
export interface Playlist {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  
  // Dodatkowe pola
  songCount?: number;
  user?: User;
  songs?: Song[];
}

/**
 * Interfejs połączenia playlisty z piosenką
 */
export interface PlaylistSong {
  id: string;
  playlistId: string;
  songId: string;
  order: number;
  addedAt: string;
  
  // Relacje
  playlist?: Playlist;
  song?: Song;
}

/**
 * Interfejs analizy audio
 */
export interface AudioAnalysis {
  id: string;
  songId: string;
  waveformData: string; // JSON string
  loudnessData: string; // JSON string
  beatsData?: string;   // JSON string
  duration: number;
  sampleRate: number;
  createdAt: string;
  updatedAt: string;
  
  // Relacje
  segments?: AudioSegment[];
}

/**
 * Interfejs segmentu audio
 */
export interface AudioSegment {
  id: string;
  analysisId: string;
  startTime: number;
  endTime: number;
  loudness: number;
  type: SegmentType;
  confidence: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interfejs tagu
 */
export interface Tag {
  id: string;
  name: string;
}

/**
 * Interfejs połączenia tagu z piosenką
 */
export interface SongTag {
  songId: string;
  tagId: string;
  addedAt: string;
  
  // Relacje
  tag?: Tag;
}

/**
 * Interfejsy dla API i komponentów
 */

/**
 * Interfejs odpowiedzi z paginacją
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Interfejs parametrów paginacji
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Interfejs dla informacji z YouTube
 */
export interface YouTubeInfo {
  videoId: string;
  title: string;
  description?: string;
  thumbnail?: string;
  channelName?: string;
  artist?: string;
  songTitle?: string;
}

/**
 * Interfejs do tworzenia nowej piosenki
 */
export interface CreateSongDto {
  title: string;
  artist: string;
  description?: string;
  thumbnailUrl?: string;
  audioSources: Pick<AudioSource, 'url' | 'sourceType' | 'isMain'>[];
  textContents?: Pick<TextContent, 'content' | 'contentType' | 'language'>[];
}

/**
 * Interfejs do aktualizacji piosenki
 */
export interface UpdateSongDto {
  title?: string;
  artist?: string;
  description?: string;
  thumbnailUrl?: string;
}

/**
 * Interfejs do tworzenia treści tekstowej
 */
export interface CreateTextContentDto {
  songId: string;
  content: string;
  contentType: ContentType;
  language?: string;
  source?: string;
}

/**
 * Interfejs do wyszukiwania tekstów
 */
export interface SearchLyricsDto {
  artist: string;
  title: string;
}

/**
 * Interfejs do pobierania informacji z YouTube
 */
export interface FetchYoutubeInfoDto {
  url: string;
}

/**
 * Interfejs do tworzenia playlisty
 */
export interface CreatePlaylistDto {
  name: string;
  description?: string;
  isPublic: boolean;
  songIds?: string[];
}

/**
 * Interfejs dla generowania LRC
 */
export interface GenerateLRCDto {
  songId: string;
  method: 'auto' | 'even' | 'ml';
}

/**
 * Interfejs dla mapy głośności
 */
export interface IntensityData {
  startTime: number;
  duration: number;
  intensity: number; // 0-1
}

/**
 * Interfejs dla linii LRC
 */
export interface LRCLine {
  time: number;
  text: string;
  endTime?: number;
}

/**
 * Interfejs dla parsowanego LRC z metadanymi
 */
export interface ParsedLRC {
  metadata: {
    title?: string;
    artist?: string;
    album?: string;
    language?: string;
  };
  lines: LRCLine[];
}

/**
 * Interfejs dla struktury utworu
 */
export interface SongStructure {
  sections: {
    name: string; // np. "verse1", "chorus"
    startTime: number;
    endTime: number;
    lines: string[];
  }[];
}

/**
 * Interfejs dla komponentu wyświetlania tekstu
 */
export interface LyricsDisplayOptions {
  displayMode: 'scroll' | 'karaoke';
  highlightColor?: string;
  fontSize?: {
    normal: number;
    highlight: number;
  };
  autoScroll: boolean;
  showTranslation: boolean;
}

/**
 * Interfejs dla komponentu wyświetlania waveformy
 */
export interface WaveformOptions {
  waveColor: string;
  progressColor: string;
  cursorColor: string;
  barWidth: number;
  responsive: boolean;
  showTimeline: boolean;
  interact: boolean;
  normalize: boolean;
}

/**
 * Interfejs dla odpowiedzi błędu API
 */
export interface ApiError {
  statusCode: number;
  message: string;
  code: string;
  timestamp: string;
}

/**
 * Typy dla stanu aplikacji w Pinia
 */

/**
 * Interfejs stanu użytkownika
 */
export interface UserState {
  currentUser: User | null;
  preferences: UserPreference | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Interfejs stanu odtwarzacza
 */
export interface PlayerState {
  currentSong: Song | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  currentLyrics: TextContent | null;
  currentTranslation: TextContent | null;
  showLyrics: boolean;
  showTranslation: boolean;
  displayMode: 'scroll' | 'karaoke';
  queue: Song[];
  history: Song[];
  repeatMode: 'none' | 'one' | 'all';
  shuffleMode: boolean;
}