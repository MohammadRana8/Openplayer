export interface Song {
  id: number;
  mediaStoreId?: number;
  mediaStoreUri?: string;
  path: string;
  displayName: string;
  title?: string;
  artist?: string;
  artistId?: number;
  album?: string;
  albumId?: number;
  genre?: string;
  year?: number;
  trackNumber?: number;
  discNumber?: number;
  composer?: string;
  conductor?: string;
  grouping?: string;
  comment?: string;
  bpm?: number;
  duration: number;
  size: number;
  mimeType: string;
  dateAdded: number;
  dateModified: number;
  playCount: number;
  lastPlayed?: number;
  rating?: number;
  bookmarkPosition?: number;
  bookmarkLabel?: string;
  embeddedArt?: string;
  hasEmbeddedLyrics: number;
  lrcPath?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Queue {
  id: number;
  name: string;
  type: 'folder' | 'album' | 'artist' | 'playlist' | 'custom';
  sourceId?: number;
  currentIndex: number;
  currentPositionMs: number;
  createdAt: number;
  updatedAt: number;
}

export interface QueueItem {
  id: number;
  queueId: number;
  songId: number;
  position: number;
  addedAt: number;
}

export interface Playlist {
  id: number;
  name: string;
  type: 'user' | 'auto_recent' | 'auto_most_played' | 'auto_recently_added';
  autoRule?: string;
  createdAt: number;
  updatedAt: number;
}

export interface PlaylistItem {
  id: number;
  playlistId: number;
  songId: number;
  position: number;
  addedAt: number;
}

export interface Folder {
  id: number;
  path: string;
  name: string;
  parentPath?: string;
  depth: number;
  songCount: number;
  albumCount: number;
  artistCount: number;
  dateAdded: number;
  dateModified: number;
}

export interface EqPreset {
  id: number;
  name: string;
  bands: string;
  preamp: number;
  bassBoost: number;
  virtualizer: number;
  reverb: number;
  deviceProfile?: 'speaker' | 'headphone' | 'bluetooth' | 'wired';
  isSystem: number;
  createdAt: number;
  updatedAt: number;
}

export interface DeviceProfile {
  id: number;
  bluetoothMac?: string;
  name: string;
  type: 'bluetooth' | 'wired_headphone' | 'speaker' | 'usb' | 'hdmi';
  eqPresetId?: number;
  lastUsed: number;
  createdAt: number;
}

export interface Lyrics {
  id: number;
  songId: number;
  embeddedText?: string;
  lrcPath?: string;
  syncedLines?: string;
  language?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Backup {
  id: number;
  filePath: string;
  fileName: string;
  size: number;
  version: number;
  songCount: number;
  playlistCount: number;
  queueCount: number;
  playCountSum: number;
  isAuto: number;
  createdAt: number;
}

export interface Setting {
  key: string;
  value: string;
  updatedAt: number;
}

export interface ParsedLyricsLine {
  time: number;
  text: string;
}

export interface LrcData {
  lines: ParsedLyricsLine[];
  offset: number;
}

export interface AudioMetadata {
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  year?: number;
  track?: { no: number; of: number };
  disk?: { no: number; of: number };
  composer?: string;
  conductor?: string;
  grouping?: string;
  comment?: string;
  bpm?: number;
  duration?: number;
  picture?: { format: string; data: Uint8Array }[];
  lyrics?: string;
  synchronizedLyrics?: ParsedLyricsLine[];
}

export interface ScanResult {
  added: number;
  updated: number;
  removed: number;
}

export interface ScanProgress {
  total: number;
  processed: number;
  currentFile: string;
  phase: 'scanning' | 'indexing' | 'complete' | 'error';
  error?: string;
}

export interface PlaybackState {
  isPlaying: boolean;
  position: number;
  duration: number;
  bufferedPosition: number;
  speed: number;
  pitch: number;
  volume: number;
  isMuted: boolean;
  currentSong: Song | null;
  currentQueueId: number | null;
  currentIndex: number;
  repeatMode: 'off' | 'one' | 'all';
  shuffle: boolean;
  error: string | null;
}

export interface EqualizerSettings {
  enabled: boolean;
  bands: number[];
  preamp: number;
  bassBoost: boolean;
  virtualizer: boolean;
  reverb: boolean;
  presetId: number | null;
}

export interface SleepTimerConfig {
  enabled: boolean;
  type: 'time' | 'songs';
  timeMs: number;
  songsRemaining: number;
  endTime: number;
}

export interface BackupData {
  version: number;
  timestamp: number;
  settings: Record<string, unknown>;
  playlists: Playlist[];
  playlistItems: PlaylistItem[];
  queues: Queue[];
  queueItems: QueueItem[];
  playCounts: { songId: number; count: number; lastPlayed: number }[];
  equalizer: {
    presets: EqPreset[];
    deviceProfiles: DeviceProfile[];
  };
}

export type RootStackParamList = {
  Main: undefined;
  Player: { queueId?: number; songId?: number };
  QueueDetail: { queueId: number };
  FolderDetail: { folderPath: string };
  AlbumDetail: { albumId: number };
  ArtistDetail: { artistId: number };
  PlaylistDetail: { playlistId: number };
  TagEditor: { songIds: number[] };
  LyricsEditor: { songId: number };
  Equalizer: undefined;
  Settings: undefined;
  SleepTimer: undefined;
  BackupRestore: undefined;
  FileOperation: { operation: 'move' | 'copy' | 'rename'; sourcePaths: string[] };
};

export type BottomTabParamList = {
  Player: undefined;
  Queues: undefined;
  Folders: undefined;
  Albums: undefined;
  Artists: undefined;
  Playlists: undefined;
};

export const SUPPORTED_AUDIO_FORMATS = [
  'mp3', 'm4a', 'wma', 'flac', 'opus', 'aac', 'alac', 'ape', 'dsf', 'wav', 'ogg', 'aiff',
] as const;

export const AUDIO_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp4',
  'audio/x-ms-wma',
  'audio/flac',
  'audio/opus',
  'audio/aac',
  'audio/x-ape',
  'audio/x-dsf',
  'audio/wav',
  'audio/ogg',
  'audio/aiff',
] as const;

export const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000] as const;

export const REPEAT_MODES = ['off', 'one', 'all'] as const;
export const SHUFFLE_MODES = [false, true] as const;
export const THEME_MODES = ['light', 'dark', 'system'] as const;
export const DENSITY_MODES = ['compact', 'comfortable'] as const;
export const VIEW_MODES = ['linear', 'hierarchical'] as const;

export const SORT_OPTIONS = {
  songs: ['title', 'artist', 'album', 'year', 'trackNumber', 'duration', 'playCount', 'lastPlayed', 'dateAdded', 'dateModified'],
  albums: ['name', 'artist', 'year', 'songCount', 'dateAdded'],
  artists: ['name', 'albumCount', 'songCount', 'dateAdded'],
  playlists: ['name', 'songCount', 'duration', 'dateAdded', 'dateModified'],
  folders: ['name', 'songCount', 'albumCount', 'artistCount', 'dateAdded', 'dateModified'],
} as const;

export const QUEUE_TYPES = ['folder', 'album', 'artist', 'playlist', 'custom'] as const;
export const PLAYLIST_TYPES = ['user', 'auto_recent', 'auto_most_played', 'auto_recently_added'] as const;
export const DEVICE_TYPES = ['bluetooth', 'wired_headphone', 'speaker', 'usb', 'hdmi'] as const;
export const DEVICE_PROFILES = ['speaker', 'headphone', 'bluetooth', 'wired'] as const;

export const NOTIFICATION_ACTIONS = {
  PLAY_PAUSE: 'play_pause',
  NEXT: 'next',
  PREVIOUS: 'previous',
  FAST_FORWARD: 'fast_forward',
  REWIND: 'rewind',
  ADD_TO_PLAYLIST: 'add_to_playlist',
  SHOW_QUEUE: 'show_queue',
  DISMISS: 'dismiss',
} as const;

export const EARPHONE_ACTIONS = {
  SINGLE: 'play_pause',
  DOUBLE: 'next',
  TRIPLE: 'previous',
  QUAD: 'fast_forward',
} as const;

export const SLEEP_TIMER_TYPES = ['time', 'songs'] as const;

export const WIDGET_LAYOUTS = ['4x1', '4x2', '2x2'] as const;

export const BACKUP_STRATEGIES = ['merge', 'replace'] as const;
export const QUEUE_DUPLICATE_STRATEGIES = ['merge', 'replace'] as const;
export const PREV_BUTTON_BEHAVIORS = ['previous', 'restart'] as const;