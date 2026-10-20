export const APP_NAME = 'OpenPlayer';
export const APP_VERSION = '1.0.0';
export const APP_PACKAGE = 'com.openplayer.app';
export const APP_SCHEME = 'openplayer';

export const DATABASE_NAME = 'openplayer.db';
export const DATABASE_VERSION = 1;
export const BACKUP_VERSION = 1;

export const STORAGE_KEYS = {
  THEME: 'theme',
  DENSITY: 'density',
  ANIMATIONS: 'animations',
  REPEAT_MODE: 'player_repeat_mode',
  SHUFFLE: 'player_shuffle',
  SPEED: 'player_speed',
  PITCH: 'player_pitch',
  VOLUME: 'player_volume',
  VIEW_MODE: 'folders_view_mode',
  SORT_BY: 'sort_by',
  EQ_ENABLED: 'equalizer_enabled',
  EQ_PRESET: 'equalizer_preset_id',
  EQ_BANDS: 'equalizer_bands',
  EQ_PREAMP: 'equalizer_preamp',
  EQ_BASS_BOOST: 'equalizer_bass_boost',
  EQ_VIRTUALIZER: 'equalizer_virtualizer',
  EQ_REVERB: 'equalizer_reverb',
  EQ_DEVICE_PROFILE: 'equalizer_device_profile',
  SETTINGS: 'settings',
  QUEUES: 'queues',
  CURRENT_QUEUE: 'current_queue',
  CURRENT_INDEX: 'current_index',
  POSITION: 'position',
  SLEEP_TIMER: 'sleep_timer',
  LAST_FOLDER: 'last_folder',
  LAST_ALBUM: 'last_album',
  LAST_ARTIST: 'last_artist',
  LAST_PLAYLIST: 'last_playlist',
  DEVICE_PROFILES: 'device_profiles',
  BACKUP_AUTO: 'backup_auto_enabled',
  BACKUP_INTERVAL: 'backup_auto_interval_days',
  BACKUP_RETENTION: 'backup_auto_retention',
  NOTIFICATIONS: 'notifications_enabled',
  LOCKSCREEN: 'lockscreen_enabled',
  WIDGET_LAYOUT: 'widget_layout',
  AUTO_BACKUP: 'backup_auto_enabled',
} as const;

export const PERMISSIONS = {
  READ_MEDIA_AUDIO: 'android.permission.READ_MEDIA_AUDIO',
  READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
  WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE',
  MANAGE_EXTERNAL_STORAGE: 'android.permission.MANAGE_EXTERNAL_STORAGE',
  FOREGROUND_SERVICE: 'android.permission.FOREGROUND_SERVICE',
  FOREGROUND_SERVICE_MEDIA_PLAYBACK: 'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK',
  POST_NOTIFICATIONS: 'android.permission.POST_NOTIFICATIONS',
  BLUETOOTH_CONNECT: 'android.permission.BLUETOOTH_CONNECT',
  BLUETOOTH: 'android.permission.BLUETOOTH',
  WAKE_LOCK: 'android.permission.WAKE_LOCK',
  IGNORE_BATTERY_OPTIMIZATIONS: 'android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',
} as const;

export const NOTIFICATION_CHANNELS = {
  PLAYBACK: {
    id: 'playback',
    name: 'Playback',
    description: 'Media playback controls and status',
    importance: 'low',
  },
  DOWNLOAD: {
    id: 'download',
    name: 'Downloads',
    description: 'File operations and library scanning',
    importance: 'default',
  },
  BACKUP: {
    id: 'backup',
    name: 'Backups',
    description: 'Automatic and manual backup status',
    importance: 'default',
  },
} as const;

export const FOREGROUND_SERVICE_TYPES = {
  MEDIA_PLAYBACK: 'mediaPlayback',
  DATA_SYNC: 'dataSync',
} as const;

export const INTENT_ACTIONS = {
  MEDIA_BUTTON: 'android.intent.action.MEDIA_BUTTON',
  MEDIA_PLAY: 'android.media.PLAY',
  MEDIA_PAUSE: 'android.media.PAUSE',
  MEDIA_NEXT: 'android.media.NEXT',
  MEDIA_PREVIOUS: 'android.media.PREVIOUS',
  MEDIA_STOP: 'android.media.STOP',
} as const;

export const MEDIA_SESSION_ACTIONS = {
  PLAY: 'play',
  PAUSE: 'pause',
  PLAY_PAUSE: 'play_pause',
  NEXT: 'next',
  PREVIOUS: 'previous',
  FAST_FORWARD: 'fast_forward',
  REWIND: 'rewind',
  SEEK_TO: 'seek_to',
  SET_RATING: 'set_rating',
  STOP: 'stop',
} as const;

export const WIDGET_UPDATE_ACTION = 'com.openplayer.app.WIDGET_UPDATE';
export const PLAYBACK_STATE_CHANGED = 'com.openplayer.app.PLAYBACK_STATE_CHANGED';
export const QUEUE_CHANGED = 'com.openplayer.app.QUEUE_CHANGED';
export const LIBRARY_UPDATED = 'com.openplayer.app.LIBRARY_UPDATED';
export const SETTINGS_CHANGED = 'com.openplayer.app.SETTINGS_CHANGED';
export const EQUALIZER_CHANGED = 'com.openplayer.app.EQUALIZER_CHANGED';
export const SLEEP_TIMER_TICK = 'com.openplayer.app.SLEEP_TIMER_TICK';
export const SLEEP_TIMER_FINISHED = 'com.openplayer.app.SLEEP_TIMER_FINISHED';

export const DEFAULT_SETTINGS = {
  theme: 'system',
  theme_dynamic_color: true,
  player_speed: 1.0,
  player_pitch: 1.0,
  player_repeat_mode: 'all',
  player_shuffle: false,
  player_gapless: true,
  player_crossfade_ms: 0,
  player_prev_behavior: 'previous',
  queue_auto_create: true,
  queue_resume_position: true,
  queue_duplicate_strategy: 'merge',
  equalizer_enabled: true,
  equalizer_preset_id: 1,
  equalizer_bass_boost: false,
  equalizer_virtualizer: false,
  equalizer_reverb: false,
  notifications_enabled: true,
  notifications_style: 'expanded',
  notifications_ff_rw_enabled: true,
  notifications_ff_rw_interval_ms: 10000,
  lockscreen_enabled: true,
  lockscreen_show_queue: true,
  lockscreen_show_lyrics: true,
  widget_layout: '4x2',
  widget_show_artwork: true,
  widget_show_queue: true,
  library_scan_on_start: true,
  library_scan_interval_hours: 24,
  library_include_audiobooks: false,
  library_min_duration_ms: 30000,
  folders_view_mode: 'linear',
  folders_sort_by: 'name',
  albums_sort_by: 'name',
  artists_sort_by: 'name',
  playlists_sort_by: 'name',
  songs_sort_by: 'title',
  ui_density: 'comfortable',
  ui_animations: true,
  ui_show_song_count: true,
  ui_show_duration: true,
  sleep_timer_enabled: false,
  sleep_timer_type: 'time',
  sleep_timer_time_hours: 0,
  sleep_timer_time_minutes: 30,
  sleep_timer_songs: 10,
  backup_auto_enabled: true,
  backup_auto_interval_days: 7,
  backup_auto_retention: 5,
  backup_include_play_counts: true,
  earphone_single_click: 'play_pause',
  earphone_double_click: 'next',
  earphone_triple_click: 'previous',
  earphone_quad_click: 'fast_forward',
  android_auto_enabled: true,
  shortcuts_enabled: true,
  search_in_settings: true,
  fullscreen_art_zoom: true,
  share_screenshot_hashtag: '#OpenPlayer',
} as const;

export const SYSTEM_EQ_PRESETS = [
  { name: 'Flat', bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], preamp: 0, bassBoost: false, virtualizer: false, reverb: false },
  { name: 'Rock', bands: [4, 3, 2, 1, 0, -1, -2, -3, -4, -5], preamp: 0, bassBoost: true, virtualizer: false, reverb: false },
  { name: 'Pop', bands: [2, 2, 1, 0, -1, -1, 0, 1, 2, 3], preamp: 0, bassBoost: true, virtualizer: true, reverb: false },
  { name: 'Jazz', bands: [0, 1, 2, 3, 2, 1, 0, -1, -2, -3], preamp: 0, bassBoost: false, virtualizer: false, reverb: true },
  { name: 'Classical', bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], preamp: 0, bassBoost: false, virtualizer: false, reverb: true },
  { name: 'Electronic', bands: [5, 4, 3, 2, 1, 0, -1, -2, -3, -4], preamp: 0, bassBoost: true, virtualizer: true, reverb: false },
  { name: 'Bass Boost', bands: [6, 5, 4, 3, 2, 1, 0, 0, 0, 0], preamp: 0, bassBoost: true, virtualizer: false, reverb: false },
  { name: 'Treble Boost', bands: [0, 0, 0, 0, 0, 1, 2, 3, 4, 5], preamp: 0, bassBoost: false, virtualizer: false, reverb: false },
  { name: 'Vocal', bands: [0, -1, -2, -1, 0, 2, 3, 2, 1, 0], preamp: 0, bassBoost: false, virtualizer: false, reverb: false },
  { name: 'Acoustic', bands: [1, 2, 3, 2, 1, 0, -1, -2, -2, -3], preamp: 0, bassBoost: false, virtualizer: false, reverb: true },
] as const;

export const EQ_FREQUENCY_LABELS = ['32', '64', '125', '250', '500', '1K', '2K', '4K', '8K', '16K'] as const;
export const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000] as const;

export const MIN_SEEK_INTERVAL = 1000;
export const DEFAULT_FF_RW_INTERVAL = 10000;
export const MAX_QUEUE_COUNT = 20;
export const MAX_PLAYLIST_COUNT = 100;
export const MAX_SONGS_PER_PLAYLIST = 10000;
export const LIBRARY_SCAN_BATCH_SIZE = 100;
export const LIBRARY_MIN_DURATION_MS = 30000;
export const AUDIOBOOK_MAX_DURATION_MS = 3600000;

export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 200,
  slow: 300,
  slower: 500,
} as const;

export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  modal: 1200,
  popover: 1300,
  tooltip: 1400,
  toast: 1500,
  player: 100,
  bottomNav: 200,
} as const;

export const LAYOUT = {
  headerHeight: 64,
  bottomNavHeight: 72,
  playerMinHeight: 96,
  playerMaxHeight: '100%',
  contentMaxWidth: 1280,
  sidebarWidth: 280,
  listItemHeight: 56,
  listItemHeightDense: 48,
  cardGap: 12,
  sectionGap: 24,
} as const;

export const TOUCH_TARGET_MIN = 48;
export const ICON_SIZE = 24;
export const ICON_SIZE_LARGE = 32;
export const AVATAR_SIZE_SMALL = 32;
export const AVATAR_SIZE_MEDIUM = 40;
export const AVATAR_SIZE_LARGE = 56;
export const ARTWORK_SIZE_SMALL = 40;
export const ARTWORK_SIZE_MEDIUM = 56;
export const ARTWORK_SIZE_LARGE = 80;
export const ARTWORK_SIZE_XL = 120;

export const REGEX = {
  LRC_TIMESTAMP: /^\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)$/,
  LRC_METADATA: /^\[(ti|ar|al|au|length|by|offset):([^\]]+)\]$/,
  FILENAME_CLEAN: /\.[^/.]+$/,
  WHITESPACE: /\s+/g,
} as const;

export const ERROR_MESSAGES = {
  PERMISSION_DENIED: 'Storage permission is required to access your music library.',
  NO_MEDIA_FILES: 'No audio files found in the selected location.',
  PLAYBACK_FAILED: 'Failed to play the selected song.',
  QUEUE_EMPTY: 'The queue is empty.',
  PLAYLIST_EMPTY: 'This playlist has no songs.',
  TAG_EDIT_FAILED: 'Failed to edit tags. The file may be read-only.',
  BACKUP_FAILED: 'Failed to create backup.',
  RESTORE_FAILED: 'Failed to restore backup.',
  EXPORT_FAILED: 'Failed to export data.',
  IMPORT_FAILED: 'Failed to import data.',
  FILE_OPERATION_FAILED: 'File operation failed.',
  SCAN_FAILED: 'Library scan failed.',
  DATABASE_ERROR: 'Database operation failed.',
  UNKNOWN_ERROR: 'An unknown error occurred.',
} as const;

export const SUCCESS_MESSAGES = {
  SCAN_COMPLETE: 'Library scan completed.',
  BACKUP_CREATED: 'Backup created successfully.',
  BACKUP_RESTORED: 'Backup restored successfully.',
  SETTINGS_SAVED: 'Settings saved.',
  PLAYLIST_CREATED: 'Playlist created.',
  PLAYLIST_UPDATED: 'Playlist updated.',
  QUEUE_CREATED: 'Queue created.',
  TAGS_UPDATED: 'Tags updated successfully.',
  LYRICS_SAVED: 'Lyrics saved.',
  FILES_MOVED: 'Files moved successfully.',
  FILES_COPIED: 'Files copied successfully.',
  FOLDER_RENAMED: 'Folder renamed.',
} as const;