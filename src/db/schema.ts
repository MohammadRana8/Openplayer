import { sqliteTable, integer, text, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const songs = sqliteTable('songs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  mediaStoreId: integer('media_store_id'),
  mediaStoreUri: text('media_store_uri'),
  path: text('path').notNull().unique(),
  displayName: text('display_name').notNull(),
  title: text('title'),
  artist: text('artist'),
  artistId: integer('artist_id'),
  album: text('album'),
  albumId: integer('album_id'),
  genre: text('genre'),
  year: integer('year'),
  trackNumber: integer('track_number'),
  discNumber: integer('disc_number'),
  composer: text('composer'),
  conductor: text('conductor'),
  grouping: text('grouping'),
  comment: text('comment'),
  bpm: integer('bpm'),
  duration: integer('duration').notNull(),
  size: integer('size').notNull(),
  mimeType: text('mime_type').notNull(),
  dateAdded: integer('date_added').notNull(),
  dateModified: integer('date_modified').notNull(),
  playCount: integer('play_count').notNull().default(0),
  lastPlayed: integer('last_played'),
  rating: integer('rating'),
  bookmarkPosition: integer('bookmark_position'),
  bookmarkLabel: text('bookmark_label'),
  embeddedArt: text('embedded_art'),
  hasEmbeddedLyrics: integer('has_embedded_lyrics').notNull().default(0),
  lrcPath: text('lrc_path'),
  createdAt: integer('created_at').notNull().default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').notNull().default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
  artistIdx: index('idx_songs_artist_id').on(table.artistId),
  albumIdx: index('idx_songs_album_id').on(table.albumId),
  folderPathIdx: index('idx_songs_folder_path').on(table.path),
  genreIdx: index('idx_songs_genre').on(table.genre),
  playCountIdx: index('idx_songs_play_count').on(table.playCount),
  lastPlayedIdx: index('idx_songs_last_played').on(table.lastPlayed),
  titleIdx: index('idx_songs_title').on(table.title),
  artistNameIdx: index('idx_songs_artist').on(table.artist),
  albumNameIdx: index('idx_songs_album').on(table.album),
}));

export const queues = sqliteTable('queues', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type', { enum: ['folder', 'album', 'artist', 'playlist', 'custom'] }).notNull(),
  sourceId: integer('source_id'),
  currentIndex: integer('current_index').notNull().default(0),
  currentPositionMs: integer('current_position_ms').notNull().default(0),
  createdAt: integer('created_at').notNull().default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').notNull().default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
  typeSourceUnique: uniqueIndex('uq_queues_type_source').on(table.type, table.sourceId),
  updatedIdx: index('idx_queues_updated').on(table.updatedAt),
}));

export const queueItems = sqliteTable('queue_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  queueId: integer('queue_id').notNull().references(() => queues.id, { onDelete: 'cascade' }),
  songId: integer('song_id').notNull().references(() => songs.id, { onDelete: 'cascade' }),
  position: integer('position').notNull(),
  addedAt: integer('added_at').notNull().default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
  queuePositionUnique: uniqueIndex('uq_queue_items_queue_pos').on(table.queueId, table.position),
  queueSongUnique: uniqueIndex('uq_queue_items_queue_song').on(table.queueId, table.songId),
  queueIdx: index('idx_queue_items_queue').on(table.queueId),
}));

export const playlists = sqliteTable('playlists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type', { enum: ['user', 'auto_recent', 'auto_most_played', 'auto_recently_added'] }).notNull(),
  autoRule: text('auto_rule'),
  createdAt: integer('created_at').notNull().default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').notNull().default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
  typeIdx: index('idx_playlists_type').on(table.type),
  nameIdx: index('idx_playlists_name').on(table.name),
}));

export const playlistItems = sqliteTable('playlist_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  playlistId: integer('playlist_id').notNull().references(() => playlists.id, { onDelete: 'cascade' }),
  songId: integer('song_id').notNull().references(() => songs.id, { onDelete: 'cascade' }),
  position: integer('position').notNull(),
  addedAt: integer('added_at').notNull().default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
  playlistPositionUnique: uniqueIndex('uq_playlist_items_playlist_pos').on(table.playlistId, table.position),
  playlistSongUnique: uniqueIndex('uq_playlist_items_playlist_song').on(table.playlistId, table.songId),
  playlistIdx: index('idx_playlist_items_playlist').on(table.playlistId),
}));

export const folders = sqliteTable('folders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  path: text('path').notNull().unique(),
  name: text('name').notNull(),
  parentPath: text('parent_path'),
  depth: integer('depth').notNull().default(0),
  songCount: integer('song_count').notNull().default(0),
  albumCount: integer('album_count').notNull().default(0),
  artistCount: integer('artist_count').notNull().default(0),
  dateAdded: integer('date_added').notNull().default(sql`(strftime('%s', 'now'))`),
  dateModified: integer('date_modified').notNull().default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
  parentIdx: index('idx_folders_parent').on(table.parentPath),
  depthIdx: index('idx_folders_depth').on(table.depth),
}));

export const eqPresets = sqliteTable('eq_presets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  bands: text('bands').notNull(),
  preamp: integer('preamp').notNull().default(0),
  bassBoost: integer('bass_boost').notNull().default(0),
  virtualizer: integer('virtualizer').notNull().default(0),
  reverb: integer('reverb').notNull().default(0),
  deviceProfile: text('device_profile', { enum: ['speaker', 'headphone', 'bluetooth', 'wired'] }),
  isSystem: integer('is_system').notNull().default(0),
  createdAt: integer('created_at').notNull().default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').notNull().default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
  deviceIdx: index('idx_eq_presets_device').on(table.deviceProfile),
  systemIdx: index('idx_eq_presets_system').on(table.isSystem),
}));

export const deviceProfiles = sqliteTable('device_profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bluetoothMac: text('bluetooth_mac').unique(),
  name: text('name').notNull(),
  type: text('type', { enum: ['bluetooth', 'wired_headphone', 'speaker', 'usb', 'hdmi'] }).notNull(),
  eqPresetId: integer('eq_preset_id').references(() => eqPresets.id, { onDelete: 'set null' }),
  lastUsed: integer('last_used').notNull().default(sql`(strftime('%s', 'now'))`),
  createdAt: integer('created_at').notNull().default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
  typeIdx: index('idx_device_profiles_type').on(table.type),
}));

export const lyrics = sqliteTable('lyrics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  songId: integer('song_id').notNull().unique().references(() => songs.id, { onDelete: 'cascade' }),
  embeddedText: text('embedded_text'),
  lrcPath: text('lrc_path'),
  syncedLines: text('synced_lines'),
  language: text('language'),
  createdAt: integer('created_at').notNull().default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').notNull().default(sql`(strftime('%s', 'now'))`),
});

export const backups = sqliteTable('backups', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  filePath: text('file_path').notNull(),
  fileName: text('file_name').notNull(),
  size: integer('size').notNull(),
  version: integer('version').notNull(),
  songCount: integer('song_count').notNull(),
  playlistCount: integer('playlist_count').notNull(),
  queueCount: integer('queue_count').notNull(),
  playCountSum: integer('play_count_sum').notNull(),
  isAuto: integer('is_auto').notNull().default(0),
  createdAt: integer('created_at').notNull().default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
  createdIdx: index('idx_backups_created').on(table.createdAt),
}));

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at').notNull().default(sql`(strftime('%s', 'now'))`),
});

export type Song = typeof songs.$inferSelect;
export type NewSong = typeof songs.$inferInsert;
export type Queue = typeof queues.$inferSelect;
export type NewQueue = typeof queues.$inferInsert;
export type QueueItem = typeof queueItems.$inferSelect;
export type NewQueueItem = typeof queueItems.$inferInsert;
export type Playlist = typeof playlists.$inferSelect;
export type NewPlaylist = typeof playlists.$inferInsert;
export type PlaylistItem = typeof playlistItems.$inferSelect;
export type NewPlaylistItem = typeof playlistItems.$inferInsert;
export type Folder = typeof folders.$inferSelect;
export type NewFolder = typeof folders.$inferInsert;
export type EqPreset = typeof eqPresets.$inferSelect;
export type NewEqPreset = typeof eqPresets.$inferInsert;
export type DeviceProfile = typeof deviceProfiles.$inferSelect;
export type NewDeviceProfile = typeof deviceProfiles.$inferInsert;
export type Lyrics = typeof lyrics.$inferSelect;
export type NewLyrics = typeof lyrics.$inferInsert;
export type Backup = typeof backups.$inferSelect;
export type NewBackup = typeof backups.$inferInsert;
export type Setting = typeof settings.$inferSelect;