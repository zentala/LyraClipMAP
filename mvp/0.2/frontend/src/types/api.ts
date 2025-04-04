/**
 * Typy dla interfejsu API
 */
import {
  Song,
  Artist,
  TextContent,
  AudioSource,
  Playlist,
  User,
  ContentType,
  SourceType,
  WordTimestamp,
  LineTimestamp,
  PaginatedResponse,
  PaginationParams,
  YouTubeInfo
} from './index';

/**
 * Endpointy API
 */
export enum ApiEndpoints {
  SONGS = '/songs',
  ARTISTS = '/artists',
  TEXT_CONTENTS = '/text-contents',
  AUDIO_SOURCES = '/audio-sources',
  PLAYLISTS = '/playlists',
  USERS = '/users',
  AUTH = '/auth',
  LYRICS = '/lyrics',
  YOUTUBE = '/youtube',
  AUDIO_ANALYSIS = '/audio-analysis'
}

/**
 * Interfejsy dla żądań API
 */

/**
 * Request: Logowanie
 */
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Response: Logowanie
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
  expiresIn: number;
}

/**
 * Request: Rejestracja
 */
export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

/**
 * Request: Dodanie piosenki
 */
export interface CreateSongRequest {
  title: string;
  artist: string;
  description?: string;
  thumbnailUrl?: string;
  youtubeUrl?: string;
  lyrics?: string;
  language?: string;
}

/**
 * Response: Dodanie piosenki
 */
export interface CreateSongResponse {
  song: Song;
  lyricsProcessing?: {
    status: 'pending' | 'completed' | 'failed';
    message?: string;
  };
}

/**
 * Request: Aktualizacja piosenki
 */
export interface UpdateSongRequest {
  title?: string;
  artist?: string;
  description?: string;
  thumbnailUrl?: string;
}

/**
 * Request: Dodanie treści tekstowej
 */
export interface CreateTextContentRequest {
  songId: string;
  content: string;
  contentType: ContentType;
  language?: string;
  source?: string;
}

/**
 * Request: Wyszukiwanie piosenek
 */
export interface SearchSongsRequest extends PaginationParams {
  artist?: string;
  title?: string;
  lyrics?: string;
  tags?: string[];
}

/**
 * Response: Wyszukiwanie piosenek
 */
export interface SearchSongsResponse extends PaginatedResponse<Song> {
  facets?: {
    artists: Array<{ name: string; count: number }>;
    tags: Array<{ name: string; count: number }>;
  };
}

/**
 * Request: Wyszukiwanie tekstów
 */
export interface SearchLyricsRequest {
  artist: string;
  title: string;
  sources?: string[];
}

/**
 * Response: Wyszukiwanie tekstów
 */
export interface SearchLyricsResponse {
  lyrics?: string;
  source?: string;
  language?: string;
  confidence?: number;
  debug_log?: string;
}

/**
 * Request: Pobieranie informacji z YouTube
 */
export interface FetchYoutubeInfoRequest {
  url: string;
}

/**
 * Response: Pobieranie informacji z YouTube
 */
export interface FetchYoutubeInfoResponse {
  info: YouTubeInfo;
}

/**
 * Request: Tworzenie playlisty
 */
export interface CreatePlaylistRequest {
  name: string;
  description?: string;
  isPublic: boolean;
  songIds?: string[];
}

/**
 * Request: Dodanie piosenki do playlisty
 */
export interface AddSongToPlaylistRequest {
  songId: string;
  order?: number;
}

/**
 * Request: Generowanie LRC
 */
export interface GenerateLRCRequest {
  songId: string;
  method: 'auto' | 'even' | 'ml';
}

/**
 * Response: Generowanie LRC
 */
export interface GenerateLRCResponse {
  success: boolean;
  lrcContent?: string;
  status: 'completed' | 'processing' | 'failed';
  message?: string;
}

/**
 * Request: Zapisanie LRC
 */
export interface SaveLRCRequest {
  songId: string;
  lrcContent: string;
}

/**
 * Request: Tworzenie znaczników czasowych
 */
export interface CreateWordTimestampsRequest {
  textContentId: string;
  wordTimestamps: Array<Omit<WordTimestamp, 'id' | 'createdAt' | 'updatedAt'>>;
}

/**
 * Request: Tworzenie segmentów tekstu
 */
export interface CreateLineTimestampsRequest {
  textContentId: string;
  lineTimestamps: Array<Omit<LineTimestamp, 'id' | 'createdAt' | 'updatedAt'>>;
}

/**
 * Request: Polubienie piosenki
 */
export interface LikeSongRequest {
  songId: string;
}

/**
 * Request: Polubienie artysty
 */
export interface LikeArtistRequest {
  artistId: string;
}

/**
 * Response: Status analizy audio
 */
export interface AudioAnalysisStatusResponse {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  message?: string;
  estimatedTimeRemaining?: number;
}

/**
 * Request: Aktualizacja preferencji użytkownika
 */
export interface UpdateUserPreferencesRequest {
  darkMode?: boolean;
  preferredLanguage?: string;
  showLyrics?: boolean;
  autoPlayVideos?: boolean;
}

/**
 * Interfejsy dla obsługi błędów API
 */

/**
 * Standardowa odpowiedź błędu
 */
export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  code: string;
  timestamp: string;
  path?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Kody błędów API
 */
export enum ApiErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  BAD_REQUEST = 'BAD_REQUEST',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT'
}