/**
 * Typy dla komponentów Vue
 */
import { PropType } from 'vue';
import {
  Song,
  Artist,
  TextContent,
  AudioSource,
  Playlist,
  ContentType,
  SourceType,
  WordTimestamp,
  LineTimestamp,
  LRCLine,
  WaveformOptions,
  LyricsDisplayOptions,
  IntensityData
} from './index';

/**
 * Props dla komponentu SongCard
 */
export interface SongCardProps {
  song: PropType<Song>;
  showArtist?: PropType<boolean>;
  showControls?: PropType<boolean>;
  compact?: PropType<boolean>;
  clickable?: PropType<boolean>;
}

/**
 * Props dla komponentu ArtistCard
 */
export interface ArtistCardProps {
  artist: PropType<Artist>;
  showSongCount?: PropType<boolean>;
  clickable?: PropType<boolean>;
}

/**
 * Props dla komponentu PlaylistCard
 */
export interface PlaylistCardProps {
  playlist: PropType<Playlist>;
  showOwner?: PropType<boolean>;
  clickable?: PropType<boolean>;
}

/**
 * Props dla komponentu YoutubeEmbed
 */
export interface YoutubeEmbedProps {
  videoId: PropType<string>;
  autoplay?: PropType<boolean>;
  controls?: PropType<boolean>;
  showInfo?: PropType<boolean>;
  startTime?: PropType<number>;
  width?: PropType<string>;
  height?: PropType<string>;
  allowFullscreen?: PropType<boolean>;
}

/**
 * Props dla komponentu AudioPlayer
 */
export interface AudioPlayerProps {
  audioUrl: PropType<string>;
  showWaveform?: PropType<boolean>;
  waveformOptions?: PropType<WaveformOptions>;
  showControls?: PropType<boolean>;
  autoplay?: PropType<boolean>;
  loop?: PropType<boolean>;
  startTime?: PropType<number>;
}

/**
 * Emity dla komponentu AudioPlayer
 */
export interface AudioPlayerEmits {
  (e: 'play'): void;
  (e: 'pause'): void;
  (e: 'timeupdate', time: number): void;
  (e: 'ended'): void;
  (e: 'durationchange', duration: number): void;
  (e: 'volumechange', volume: number): void;
  (e: 'ready'): void;
  (e: 'error', error: Error): void;
}

/**
 * Props dla komponentu WavePlayer
 */
export interface WavePlayerProps {
  audioUrl: PropType<string>;
  peaks?: PropType<number[]>;
  waveformData?: PropType<string>;
  options?: PropType<WaveformOptions>;
  showControls?: PropType<boolean>;
  showTimeline?: PropType<boolean>;
  regions?: PropType<Array<{
    start: number;
    end: number;
    color: string;
    id: string;
  }>>;
  markers?: PropType<Array<{
    time: number;
    label: string;
    color: string;
    id: string;
  }>>;
}

/**
 * Emity dla komponentu WavePlayer
 */
export interface WavePlayerEmits {
  (e: 'play'): void;
  (e: 'pause'): void;
  (e: 'seek', time: number): void;
  (e: 'ready'): void;
  (e: 'timeupdate', time: number): void;
  (e: 'region-click', regionId: string): void;
  (e: 'marker-click', markerId: string): void;
}

/**
 * Props dla komponentu LyricsDisplay
 */
export interface LyricsDisplayProps {
  lines: PropType<LRCLine[]>;
  currentTime: PropType<number>;
  options?: PropType<LyricsDisplayOptions>;
  translation?: PropType<LRCLine[]>;
}

/**
 * Emity dla komponentu LyricsDisplay
 */
export interface LyricsDisplayEmits {
  (e: 'line-click', line: LRCLine): void;
  (e: 'word-click', word: string, time: number): void;
}

/**
 * Props dla komponentu IntensityMap
 */
export interface IntensityMapProps {
  intensityData: PropType<IntensityData[]>;
  totalDuration: PropType<number>;
  currentTime?: PropType<number>;
  height?: PropType<string>;
  colorScale?: PropType<Array<{
    intensity: number;
    color: string;
  }>>;
  clickable?: PropType<boolean>;
}

/**
 * Emity dla komponentu IntensityMap
 */
export interface IntensityMapEmits {
  (e: 'click', time: number): void;
}

/**
 * Props dla komponentu AudioSegmentEditor
 */
export interface AudioSegmentEditorProps {
  audioUrl: PropType<string>;
  segments: PropType<Array<{
    id: string;
    startTime: number;
    endTime: number;
    type: string;
    color?: string;
  }>>;
  currentSegment?: PropType<string>;
  showLabels?: PropType<boolean>;
  editable?: PropType<boolean>;
}

/**
 * Emity dla komponentu AudioSegmentEditor
 */
export interface AudioSegmentEditorEmits {
  (e: 'segment-update', segment: { id: string; startTime: number; endTime: number }): void;
  (e: 'segment-click', segmentId: string): void;
  (e: 'create-segment', segment: { startTime: number; endTime: number }): void;
  (e: 'delete-segment', segmentId: string): void;
}

/**
 * Props dla komponentu LyricsTimestampEditor
 */
export interface LyricsTimestampEditorProps {
  lyrics: PropType<string>;
  audioUrl: PropType<string>;
  existingTimestamps?: PropType<LRCLine[]>;
  timestampFormat?: PropType<'lrc' | 'json'>;
  enableWordLevel?: PropType<boolean>;
  autoSplitLines?: PropType<boolean>;
}

/**
 * Emity dla komponentu LyricsTimestampEditor
 */
export interface LyricsTimestampEditorEmits {
  (e: 'save', data: { lrcContent: string; lineTimestamps: LRCLine[] }): void;
  (e: 'preview', data: { lrcContent: string; lineTimestamps: LRCLine[] }): void;
  (e: 'cancel'): void;
}

/**
 * Props dla komponentu SearchBar
 */
export interface SearchBarProps {
  placeholder?: PropType<string>;
  value?: PropType<string>;
  autofocus?: PropType<boolean>;
  showFilterButton?: PropType<boolean>;
  filterOptions?: PropType<Array<{
    text: string;
    value: string;
  }>>;
  debounce?: PropType<number>;
}

/**
 * Emity dla komponentu SearchBar
 */
export interface SearchBarEmits {
  (e: 'update:value', value: string): void;
  (e: 'search', value: string): void;
  (e: 'filter-change', filter: string): void;
  (e: 'clear'): void;
}

/**
 * Props dla komponentu AutocompleteSearch
 */
export interface AutocompleteSearchProps {
  placeholder?: PropType<string>;
  value?: PropType<string>;
  minLength?: PropType<number>;
  debounce?: PropType<number>;
  loadingText?: PropType<string>;
  noResultsText?: PropType<string>;
  itemValue?: PropType<string>;
  itemText?: PropType<string>;
  itemIcon?: PropType<string>;
}

/**
 * Emity dla komponentu AutocompleteSearch
 */
export interface AutocompleteSearchEmits {
  (e: 'update:value', value: string): void;
  (e: 'search', value: string): void;
  (e: 'select', item: any): void;
  (e: 'clear'): void;
}

/**
 * Props dla komponentu SongList
 */
export interface SongListProps {
  songs: PropType<Song[]>;
  loading?: PropType<boolean>;
  showArtist?: PropType<boolean>;
  showDuration?: PropType<boolean>;
  showAddedDate?: PropType<boolean>;
  showActions?: PropType<boolean>;
  selectable?: PropType<boolean>;
  selectedSongs?: PropType<string[]>;
}

/**
 * Emity dla komponentu SongList
 */
export interface SongListEmits {
  (e: 'select', songId: string): void;
  (e: 'select-all', selected: boolean): void;
  (e: 'play', song: Song): void;
  (e: 'edit', song: Song): void;
  (e: 'delete', song: Song): void;
  (e: 'add-to-playlist', song: Song): void;
}

/**
 * Props dla komponentu SongForm
 */
export interface SongFormProps {
  initialValues?: {
    title?: string;
    artist?: string;
    youtubeUrl?: string;
    lyrics?: string;
    description?: string;
  };
  submitText?: string;
  showCancel?: boolean;
  loading?: boolean;
}

/**
 * Emity dla komponentu SongForm
 */
export interface SongFormEmits {
  (e: 'submit', formData: {
    title: string;
    artist: string;
    youtubeUrl: string;
    lyrics?: string;
    description?: string;
  }): void;
  (e: 'cancel'): void;
  (e: 'youtube-preview', info: any): void;
}

/**
 * Props dla komponentu SubtitleOverlay
 */
export interface SubtitleOverlayProps {
  videoElement: PropType<HTMLElement>;
  linesData: PropType<LRCLine[]>;
  translationData?: PropType<LRCLine[]>;
  showSubtitles?: PropType<boolean>;
  showTranslation?: PropType<boolean>;
  position?: PropType<'top' | 'bottom' | 'middle'>;
  fontSize?: PropType<string>;
  backgroundColor?: PropType<string>;
  textColor?: PropType<string>;
}

/**
 * Emity dla komponentu SubtitleOverlay
 */
export interface SubtitleOverlayEmits {
  (e: 'toggle', visible: boolean): void;
  (e: 'toggle-translation', visible: boolean): void;
}