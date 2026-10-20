import { z } from 'zod';

export const CreateSongSchema = z.object({
  path: z.string().min(1, 'Path is required'),
  displayName: z.string().min(1, 'Display name is required'),
  title: z.string().optional(),
  artist: z.string().optional(),
  artistId: z.number().int().positive().optional(),
  album: z.string().optional(),
  albumId: z.number().int().positive().optional(),
  genre: z.string().optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  trackNumber: z.number().int().positive().optional(),
  discNumber: z.number().int().positive().optional(),
  composer: z.string().optional(),
  conductor: z.string().optional(),
  grouping: z.string().optional(),
  comment: z.string().optional(),
  bpm: z.number().int().min(1).max(300).optional(),
  duration: z.number().int().min(0, 'Duration cannot be negative'),
  size: z.number().int().min(0, 'Size cannot be negative'),
  mimeType: z.string().min(1, 'MIME type is required'),
  dateAdded: z.number().int().positive(),
  dateModified: z.number().int().positive(),
  mediaStoreId: z.number().optional(),
  mediaStoreUri: z.string().optional(),
  embeddedArt: z.string().optional(),
  hasEmbeddedLyrics: z.number().int().min(0).max(1).default(0),
  lrcPath: z.string().optional(),
});

export const UpdateSongSchema = z.object({
  title: z.string().optional(),
  artist: z.string().optional(),
  artistId: z.number().int().positive().optional(),
  album: z.string().optional(),
  albumId: z.number().int().positive().optional(),
  genre: z.string().optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  trackNumber: z.number().int().positive().optional(),
  discNumber: z.number().int().positive().optional(),
  composer: z.string().optional(),
  conductor: z.string().optional(),
  grouping: z.string().optional(),
  comment: z.string().optional(),
  bpm: z.number().int().min(1).max(300).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  bookmarkPosition: z.number().int().min(0).optional(),
  bookmarkLabel: z.string().optional(),
  embeddedArt: z.string().optional(),
  hasEmbeddedLyrics: z.number().int().min(0).max(1).optional(),
  lrcPath: z.string().optional(),
});

export const SongFilterSchema = z.object({
  artistId: z.number().int().positive().optional(),
  albumId: z.number().int().positive().optional(),
  folderPath: z.string().optional(),
  genre: z.string().optional(),
  query: z.string().optional(),
  sortBy: z.enum(['title', 'artist', 'album', 'year', 'trackNumber', 'duration', 'playCount', 'lastPlayed', 'dateAdded', 'dateModified']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().min(0).optional(),
});

export const CreateQueueSchema = z.object({
  name: z.string().min(1, 'Queue name is required').max(255),
  type: z.enum(['folder', 'album', 'artist', 'playlist', 'custom']),
  sourceId: z.number().int().positive().optional(),
  currentIndex: z.number().int().min(0).default(0),
  currentPositionMs: z.number().int().min(0).default(0),
});

export const UpdateQueueSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  type: z.enum(['folder', 'album', 'artist', 'playlist', 'custom']).optional(),
  sourceId: z.number().int().positive().optional(),
  currentIndex: z.number().int().min(0).optional(),
  currentPositionMs: z.number().int().min(0).optional(),
});

export const MergeQueueSchema = z.object({
  name: z.string().min(1, 'Queue name is required').max(255),
  songIds: z.array(z.number().int().positive()).min(1, 'At least one song required'),
  strategy: z.enum(['merge', 'replace']).default('merge'),
});

export const CreatePlaylistSchema = z.object({
  name: z.string().min(1, 'Playlist name is required').max(255),
  type: z.enum(['user', 'auto_recent', 'auto_most_played', 'auto_recently_added']).default('user'),
  autoRule: z.string().optional(),
});

export const UpdatePlaylistSchema = z.object({
  name: z.string().min(1).max(255).optional(),
});

export const AddToPlaylistSchema = z.object({
  playlistId: z.number().int().positive(),
  songIds: z.array(z.number().int().positive()).min(1, 'At least one song required'),
});

export const MovePlaylistItemSchema = z.object({
  playlistId: z.number().int().positive(),
  songId: z.number().int().positive(),
  newPosition: z.number().int().min(0),
});

export const CreateEqPresetSchema = z.object({
  name: z.string().min(1, 'Preset name is required').max(100),
  bands: z.array(z.number().min(-15).max(15)).length(10, 'Exactly 10 bands required'),
  preamp: z.number().min(-15).max(15).default(0),
  bassBoost: z.number().int().min(0).max(1).default(0),
  virtualizer: z.number().int().min(0).max(1).default(0),
  reverb: z.number().int().min(0).max(1).default(0),
  deviceProfile: z.enum(['speaker', 'headphone', 'bluetooth', 'wired']).optional(),
  isSystem: z.number().int().min(0).max(1).default(0),
});

export const CreateDeviceProfileSchema = z.object({
  bluetoothMac: z.string().regex(/^([0-9A-F]{2}:){5}[0-9A-F]{2}$/i, 'Invalid MAC address').optional(),
  name: z.string().min(1, 'Device name is required').max(255),
  type: z.enum(['bluetooth', 'wired_headphone', 'speaker', 'usb', 'hdmi']),
  eqPresetId: z.number().int().positive().optional(),
});

export const SaveLyricsSchema = z.object({
  songId: z.number().int().positive(),
  embeddedText: z.string().optional(),
  lrcPath: z.string().optional(),
  syncedLines: z.string().optional(),
  language: z.string().length(2).optional(),
  lines: z.array(z.object({
    time: z.number().int().min(0),
    text: z.string(),
  })).optional(),
});

export const CreateBackupSchema = z.object({
  filePath: z.string().min(1),
  fileName: z.string().min(1).max(255),
  size: z.number().int().positive(),
  version: z.number().int().positive(),
  songCount: z.number().int().min(0),
  playlistCount: z.number().int().min(0),
  queueCount: z.number().int().min(0),
  playCountSum: z.number().int().min(0),
  isAuto: z.number().int().min(0).max(1).default(0),
});

export const PlaybackSettingsSchema = z.object({
  speed: z.number().min(0.5).max(2.0).default(1.0),
  pitch: z.number().min(0.5).max(2.0).default(1.0),
  repeatMode: z.enum(['off', 'one', 'all']).default('all'),
  shuffle: z.boolean().default(false),
  gapless: z.boolean().default(true),
  crossfadeMs: z.number().int().min(0).default(0),
  prevBehavior: z.enum(['previous', 'restart']).default('previous'),
});

export const SleepTimerSchema = z.object({
  enabled: z.boolean().default(false),
  type: z.enum(['time', 'songs']).default('time'),
  timeMs: z.number().int().min(0).default(0),
  songsRemaining: z.number().int().min(0).default(0),
  endTime: z.number().int().min(0).default(0),
});

export const FileOperationSchema = z.object({
  operation: z.enum(['move', 'copy', 'rename']),
  sourcePaths: z.array(z.string().min(1)).min(1),
  targetFolder: z.string().optional(),
  newName: z.string().optional(),
});

export const SearchQuerySchema = z.object({
  query: z.string().max(255),
  scope: z.enum(['all', 'songs', 'artists', 'albums', 'playlists', 'folders']).default('all'),
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

export type SongFilters = z.infer<typeof SongFilterSchema>;
export type CreateSongInput = z.infer<typeof CreateSongSchema>;
export type UpdateSongInput = z.infer<typeof UpdateSongSchema>;
export type CreateQueueInput = z.infer<typeof CreateQueueSchema>;
export type UpdateQueueInput = z.infer<typeof UpdateQueueSchema>;
export type MergeQueueInput = z.infer<typeof MergeQueueSchema>;
export type CreatePlaylistInput = z.infer<typeof CreatePlaylistSchema>;
export type UpdatePlaylistInput = z.infer<typeof UpdatePlaylistSchema>;
export type AddToPlaylistInput = z.infer<typeof AddToPlaylistSchema>;
export type MovePlaylistItemInput = z.infer<typeof MovePlaylistItemSchema>;
export type CreateEqPresetInput = z.infer<typeof CreateEqPresetSchema>;
export type CreateDeviceProfileInput = z.infer<typeof CreateDeviceProfileSchema>;
export type SaveLyricsInput = z.infer<typeof SaveLyricsSchema>;
export type CreateBackupInput = z.infer<typeof CreateBackupSchema>;
export type PlaybackSettings = z.infer<typeof PlaybackSettingsSchema>;
export type SleepTimerConfig = z.infer<typeof SleepTimerSchema>;
export type FileOperation = z.infer<typeof FileOperationSchema>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;