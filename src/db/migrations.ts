/**
 * Versioned SQL migrations, applied on first launch and on app updates.
 * The schema version is tracked in SQLite's `PRAGMA user_version`.
 *
 * Rules:
 *  - Never edit a migration that has shipped; append a new one.
 *  - Keep column names in sync with `schema.ts` (Drizzle).
 */
export const MIGRATIONS: string[] = [
  // v1 — initial schema
  `
  CREATE TABLE IF NOT EXISTS songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    media_store_id INTEGER,
    media_store_uri TEXT,
    path TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    title TEXT,
    artist TEXT,
    artist_id INTEGER,
    album TEXT,
    album_id INTEGER,
    genre TEXT,
    year INTEGER,
    track_number INTEGER,
    disc_number INTEGER,
    composer TEXT,
    conductor TEXT,
    grouping TEXT,
    comment TEXT,
    bpm INTEGER,
    duration INTEGER NOT NULL,
    size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    date_added INTEGER NOT NULL,
    date_modified INTEGER NOT NULL,
    play_count INTEGER NOT NULL DEFAULT 0,
    last_played INTEGER,
    rating INTEGER,
    bookmark_position INTEGER,
    bookmark_label TEXT,
    embedded_art TEXT,
    has_embedded_lyrics INTEGER NOT NULL DEFAULT 0,
    lrc_path TEXT,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );
  CREATE INDEX IF NOT EXISTS idx_songs_artist_id ON songs (artist_id);
  CREATE INDEX IF NOT EXISTS idx_songs_album_id ON songs (album_id);
  CREATE INDEX IF NOT EXISTS idx_songs_folder_path ON songs (path);
  CREATE INDEX IF NOT EXISTS idx_songs_genre ON songs (genre);
  CREATE INDEX IF NOT EXISTS idx_songs_play_count ON songs (play_count);
  CREATE INDEX IF NOT EXISTS idx_songs_last_played ON songs (last_played);
  CREATE INDEX IF NOT EXISTS idx_songs_title ON songs (title);
  CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs (artist);
  CREATE INDEX IF NOT EXISTS idx_songs_album ON songs (album);

  CREATE TABLE IF NOT EXISTS queues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    source_id INTEGER,
    current_index INTEGER NOT NULL DEFAULT 0,
    current_position_ms INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );
  CREATE UNIQUE INDEX IF NOT EXISTS uq_queues_type_source ON queues (type, source_id);
  CREATE INDEX IF NOT EXISTS idx_queues_updated ON queues (updated_at);

  CREATE TABLE IF NOT EXISTS queue_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    queue_id INTEGER NOT NULL REFERENCES queues (id) ON DELETE CASCADE,
    song_id INTEGER NOT NULL REFERENCES songs (id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    added_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );
  CREATE UNIQUE INDEX IF NOT EXISTS uq_queue_items_queue_pos ON queue_items (queue_id, position);
  CREATE UNIQUE INDEX IF NOT EXISTS uq_queue_items_queue_song ON queue_items (queue_id, song_id);
  CREATE INDEX IF NOT EXISTS idx_queue_items_queue ON queue_items (queue_id);

  CREATE TABLE IF NOT EXISTS playlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    auto_rule TEXT,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );
  CREATE INDEX IF NOT EXISTS idx_playlists_type ON playlists (type);
  CREATE INDEX IF NOT EXISTS idx_playlists_name ON playlists (name);

  CREATE TABLE IF NOT EXISTS playlist_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    playlist_id INTEGER NOT NULL REFERENCES playlists (id) ON DELETE CASCADE,
    song_id INTEGER NOT NULL REFERENCES songs (id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    added_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );
  CREATE UNIQUE INDEX IF NOT EXISTS uq_playlist_items_playlist_pos ON playlist_items (playlist_id, position);
  CREATE UNIQUE INDEX IF NOT EXISTS uq_playlist_items_playlist_song ON playlist_items (playlist_id, song_id);
  CREATE INDEX IF NOT EXISTS idx_playlist_items_playlist ON playlist_items (playlist_id);

  CREATE TABLE IF NOT EXISTS folders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    parent_path TEXT,
    depth INTEGER NOT NULL DEFAULT 0,
    song_count INTEGER NOT NULL DEFAULT 0,
    album_count INTEGER NOT NULL DEFAULT 0,
    artist_count INTEGER NOT NULL DEFAULT 0,
    date_added INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    date_modified INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );
  CREATE INDEX IF NOT EXISTS idx_folders_parent ON folders (parent_path);
  CREATE INDEX IF NOT EXISTS idx_folders_depth ON folders (depth);

  CREATE TABLE IF NOT EXISTS eq_presets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    bands TEXT NOT NULL,
    preamp INTEGER NOT NULL DEFAULT 0,
    bass_boost INTEGER NOT NULL DEFAULT 0,
    virtualizer INTEGER NOT NULL DEFAULT 0,
    reverb INTEGER NOT NULL DEFAULT 0,
    device_profile TEXT,
    is_system INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );
  CREATE INDEX IF NOT EXISTS idx_eq_presets_device ON eq_presets (device_profile);
  CREATE INDEX IF NOT EXISTS idx_eq_presets_system ON eq_presets (is_system);

  CREATE TABLE IF NOT EXISTS device_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bluetooth_mac TEXT UNIQUE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    eq_preset_id INTEGER REFERENCES eq_presets (id) ON DELETE SET NULL,
    last_used INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );
  CREATE INDEX IF NOT EXISTS idx_device_profiles_type ON device_profiles (type);

  CREATE TABLE IF NOT EXISTS lyrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    song_id INTEGER NOT NULL UNIQUE REFERENCES songs (id) ON DELETE CASCADE,
    embedded_text TEXT,
    lrc_path TEXT,
    synced_lines TEXT,
    language TEXT,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );

  CREATE TABLE IF NOT EXISTS backups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    size INTEGER NOT NULL,
    version INTEGER NOT NULL,
    song_count INTEGER NOT NULL,
    playlist_count INTEGER NOT NULL,
    queue_count INTEGER NOT NULL,
    play_count_sum INTEGER NOT NULL,
    is_auto INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );
  CREATE INDEX IF NOT EXISTS idx_backups_created ON backups (created_at);

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );
  `,
];
