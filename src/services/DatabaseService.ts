import { db, schema } from '@/db';
import type { AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
import { eq, and, desc, asc, or, inArray, sql, count, not, exists } from 'drizzle-orm';
import type { NewSong, NewQueue, NewQueueItem, NewPlaylist, NewPlaylistItem, NewFolder, NewEqPreset, NewDeviceProfile, NewLyrics, NewBackup, Setting } from '@/db/schema';
import type { Song, Queue, QueueItem, Playlist, PlaylistItem, Folder, EqPreset, DeviceProfile, Lyrics, Backup } from '@/db/schema';
import { withErrorHandling, DatabaseError, NotFoundError, ConflictError, ValidationError } from '@/utils/errors';
import {
  CreateSongSchema,
  SongFilterSchema,
  CreateQueueSchema,
  MergeQueueSchema,
  CreatePlaylistSchema,
  AddToPlaylistSchema,
  MovePlaylistItemSchema,
  CreateEqPresetSchema,
  CreateDeviceProfileSchema,
  SaveLyricsSchema,
  CreateBackupSchema,
  type CreateSongInput,
  type SongFilters,
  type CreateQueueInput,
  type MergeQueueInput,
  type CreatePlaylistInput,
  type AddToPlaylistInput,
  type MovePlaylistItemInput,
  type CreateEqPresetInput,
  type CreateDeviceProfileInput,
  type SaveLyricsInput,
  type CreateBackupInput,
} from '@/utils/validation';

/** Escapes `%`, `_` and `\` so user input is matched literally by LIKE ... ESCAPE '\'. */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

/** `column LIKE pattern ESCAPE '\'` */
function likeEscaped(column: AnySQLiteColumn, pattern: string) {
  return sql`${column} LIKE ${pattern} ESCAPE '\\'`;
}

/** Matches every path inside `folderPath` (and below), but not siblings such as `/Music/AB` for `/Music/A`. */
function insideFolder(column: AnySQLiteColumn, folderPath: string) {
  const base = folderPath.replace(/\/+$/, '');
  return likeEscaped(column, `${escapeLike(base)}/%`);
}

/** Unix time in seconds, matching the `strftime('%s')` column defaults. */
function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

const INSERT_CHUNK_SIZE = 200; // keeps bound variables well below SQLite's limit

class DatabaseService {
  private static instance: DatabaseService;
  private db = db;
  private initialized: boolean = false;

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    await withErrorHandling(async () => {
      await this.seedSystemPresets();
      await this.seedDefaultSettings();
    }, 'DatabaseService.initialize');
    this.initialized = true;
  }

  private async seedSystemPresets(): Promise<void> {
    const existing = await this.db.select().from(schema.eqPresets).where(eq(schema.eqPresets.isSystem, 1)).limit(1);
    if (existing.length > 0) return;

    const presets: NewEqPreset[] = [
      { name: 'Flat', bands: '[0,0,0,0,0,0,0,0,0,0]', preamp: 0, bassBoost: 0, virtualizer: 0, reverb: 0, isSystem: 1, deviceProfile: null },
      { name: 'Rock', bands: '[4,3,2,1,0,-1,-2,-3,-4,-5]', preamp: 0, bassBoost: 1, virtualizer: 0, reverb: 0, isSystem: 1, deviceProfile: null },
      { name: 'Pop', bands: '[2,2,1,0,-1,-1,0,1,2,3]', preamp: 0, bassBoost: 1, virtualizer: 1, reverb: 0, isSystem: 1, deviceProfile: null },
      { name: 'Jazz', bands: '[0,1,2,3,2,1,0,-1,-2,-3]', preamp: 0, bassBoost: 0, virtualizer: 0, reverb: 1, isSystem: 1, deviceProfile: null },
      { name: 'Classical', bands: '[0,0,0,0,0,0,0,0,0,0]', preamp: 0, bassBoost: 0, virtualizer: 0, reverb: 1, isSystem: 1, deviceProfile: null },
      { name: 'Electronic', bands: '[5,4,3,2,1,0,-1,-2,-3,-4]', preamp: 0, bassBoost: 1, virtualizer: 1, reverb: 0, isSystem: 1, deviceProfile: null },
      { name: 'Bass Boost', bands: '[6,5,4,3,2,1,0,0,0,0]', preamp: 0, bassBoost: 1, virtualizer: 0, reverb: 0, isSystem: 1, deviceProfile: null },
      { name: 'Treble Boost', bands: '[0,0,0,0,0,1,2,3,4,5]', preamp: 0, bassBoost: 0, virtualizer: 0, reverb: 0, isSystem: 1, deviceProfile: null },
      { name: 'Vocal', bands: '[0,-1,-2,-1,0,2,3,2,1,0]', preamp: 0, bassBoost: 0, virtualizer: 0, reverb: 0, isSystem: 1, deviceProfile: null },
      { name: 'Acoustic', bands: '[1,2,3,2,1,0,-1,-2,-2,-3]', preamp: 0, bassBoost: 0, virtualizer: 0, reverb: 1, isSystem: 1, deviceProfile: null },
    ];

    await this.db.insert(schema.eqPresets).values(presets);
  }

  private async seedDefaultSettings(): Promise<void> {
    const defaults: Setting[] = [
      { key: 'theme', value: '"system"' },
      { key: 'theme_dynamic_color', value: 'true' },
      { key: 'player_speed', value: '1.0' },
      { key: 'player_pitch', value: '1.0' },
      { key: 'player_repeat_mode', value: '"all"' },
      { key: 'player_shuffle', value: 'false' },
      { key: 'player_gapless', value: 'true' },
      { key: 'player_crossfade_ms', value: '0' },
      { key: 'player_prev_behavior', value: '"previous"' },
      { key: 'queue_auto_create', value: 'true' },
      { key: 'queue_resume_position', value: 'true' },
      { key: 'queue_duplicate_strategy', value: '"merge"' },
      { key: 'equalizer_enabled', value: 'true' },
      { key: 'equalizer_preset_id', value: '1' },
      { key: 'equalizer_bass_boost', value: 'false' },
      { key: 'equalizer_virtualizer', value: 'false' },
      { key: 'equalizer_reverb', value: 'false' },
      { key: 'notifications_enabled', value: 'true' },
      { key: 'notifications_style', value: '"expanded"' },
      { key: 'notifications_ff_rw_enabled', value: 'true' },
      { key: 'notifications_ff_rw_interval_ms', value: '10000' },
      { key: 'lockscreen_enabled', value: 'true' },
      { key: 'lockscreen_show_queue', value: 'true' },
      { key: 'lockscreen_show_lyrics', value: 'true' },
      { key: 'widget_layout', value: '"4x2"' },
      { key: 'widget_show_artwork', value: 'true' },
      { key: 'widget_show_queue', value: 'true' },
      { key: 'library_scan_on_start', value: 'true' },
      { key: 'library_scan_interval_hours', value: '24' },
      { key: 'library_include_audiobooks', value: 'false' },
      { key: 'library_min_duration_ms', value: '30000' },
      { key: 'folders_view_mode', value: '"linear"' },
      { key: 'folders_sort_by', value: '"name"' },
      { key: 'albums_sort_by', value: '"name"' },
      { key: 'artists_sort_by', value: '"name"' },
      { key: 'playlists_sort_by', value: '"name"' },
      { key: 'songs_sort_by', value: '"title"' },
      { key: 'ui_density', value: '"comfortable"' },
      { key: 'ui_animations', value: 'true' },
      { key: 'ui_show_song_count', value: 'true' },
      { key: 'ui_show_duration', value: 'true' },
      { key: 'sleep_timer_enabled', value: 'false' },
      { key: 'sleep_timer_type', value: '"time"' },
      { key: 'sleep_timer_time_hours', value: '0' },
      { key: 'sleep_timer_time_minutes', value: '30' },
      { key: 'sleep_timer_songs', value: '10' },
      { key: 'backup_auto_enabled', value: 'true' },
      { key: 'backup_auto_interval_days', value: '7' },
      { key: 'backup_auto_retention', value: '5' },
      { key: 'backup_include_play_counts', value: 'true' },
      { key: 'earphone_single_click', value: '"play_pause"' },
      { key: 'earphone_double_click', value: '"next"' },
      { key: 'earphone_triple_click', value: '"previous"' },
      { key: 'earphone_quad_click', value: '"fast_forward"' },
      { key: 'android_auto_enabled', value: 'true' },
      { key: 'shortcuts_enabled', value: 'true' },
      { key: 'search_in_settings', value: 'true' },
      { key: 'fullscreen_art_zoom', value: 'true' },
      { key: 'share_screenshot_hashtag', value: '"#OpenPlayer"' },
    ];

    for (const setting of defaults) {
      const existing = await this.db.select().from(schema.settings).where(eq(schema.settings.key, setting.key)).limit(1);
      if (existing.length === 0) {
        await this.db.insert(schema.settings).values(setting);
      }
    }
  }

  // ===== Settings =====
  async getSetting<T>(key: string): Promise<T | null> {
    const result = await this.db.select().from(schema.settings).where(eq(schema.settings.key, key)).limit(1);
    if (result.length === 0) return null;
    try {
      return JSON.parse(result[0].value) as T;
    } catch {
      return result[0].value as unknown as T;
    }
  }

  async setSetting(key: string, value: unknown): Promise<void> {
    const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
    await this.db
      .insert(schema.settings)
      .values({ key, value: jsonValue })
      .onConflictDoUpdate({
        target: schema.settings.key,
        set: { value: jsonValue, updatedAt: nowSeconds() },
      });
  }

  async getAllSettings(): Promise<Record<string, unknown>> {
    const results = await this.db.select().from(schema.settings);
    const settings: Record<string, unknown> = {};
    for (const row of results) {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch {
        settings[row.key] = row.value;
      }
    }
    return settings;
  }

  // ===== Songs =====
  async insertSongs(songs: CreateSongInput[]): Promise<void> {
    if (songs.length === 0) return;

    // One malformed file must not abort the whole scan: skip it and keep going.
    const validated: NewSong[] = [];
    for (const song of songs) {
      const parsed = CreateSongSchema.safeParse(song);
      if (parsed.success) validated.push(parsed.data as NewSong);
      else console.warn(`Skipping invalid song "${song.path}":`, parsed.error.issues[0]?.message);
    }
    if (validated.length === 0) return;

    // One statement per chunk: a single INSERT with thousands of rows exceeds SQLite's variable limit.
    for (let i = 0; i < validated.length; i += INSERT_CHUNK_SIZE) {
      await this.db
        .insert(schema.songs)
        .values(validated.slice(i, i + INSERT_CHUNK_SIZE))
        .onConflictDoUpdate({
          target: schema.songs.path,
          set: {
            mediaStoreId: sql`excluded.media_store_id`,
            mediaStoreUri: sql`excluded.media_store_uri`,
            displayName: sql`excluded.display_name`,
            title: sql`excluded.title`,
            artist: sql`excluded.artist`,
            artistId: sql`excluded.artist_id`,
            album: sql`excluded.album`,
            albumId: sql`excluded.album_id`,
            genre: sql`excluded.genre`,
            year: sql`excluded.year`,
            trackNumber: sql`excluded.track_number`,
            discNumber: sql`excluded.disc_number`,
            composer: sql`excluded.composer`,
            conductor: sql`excluded.conductor`,
            grouping: sql`excluded.grouping`,
            comment: sql`excluded.comment`,
            bpm: sql`excluded.bpm`,
            duration: sql`excluded.duration`,
            size: sql`excluded.size`,
            mimeType: sql`excluded.mime_type`,
            dateAdded: sql`excluded.date_added`,
            dateModified: sql`excluded.date_modified`,
            updatedAt: nowSeconds(),
          },
        });
    }
  }

  /** Every stored song path, used by scans to tell new songs from existing ones. */
  async getAllSongPaths(): Promise<Set<string>> {
    const rows = await this.db.select({ path: schema.songs.path }).from(schema.songs).all();
    return new Set(rows.map((r) => r.path));
  }

  /**
   * Removes songs whose files are gone. Queue/playlist entries and lyrics are removed by
   * ON DELETE CASCADE. Returns how many songs were deleted.
   */
  async deleteSongsNotIn(keepPaths: Set<string>): Promise<number> {
    const existing = await this.getAllSongPaths();
    const stale = [...existing].filter((p) => !keepPaths.has(p));
    for (let i = 0; i < stale.length; i += INSERT_CHUNK_SIZE) {
      await this.db.delete(schema.songs).where(inArray(schema.songs.path, stale.slice(i, i + INSERT_CHUNK_SIZE)));
    }
    return stale.length;
  }

  /** Removes folder rows that no longer exist on disk. */
  async deleteFoldersNotIn(keepPaths: Set<string>): Promise<void> {
    const rows = await this.db.select({ path: schema.folders.path }).from(schema.folders).all();
    const stale = rows.map((r) => r.path).filter((p) => !keepPaths.has(p));
    for (let i = 0; i < stale.length; i += INSERT_CHUNK_SIZE) {
      await this.db.delete(schema.folders).where(inArray(schema.folders.path, stale.slice(i, i + INSERT_CHUNK_SIZE)));
    }
  }

  async getSongById(id: number): Promise<Song | null> {
    const result = await this.db.select().from(schema.songs).where(eq(schema.songs.id, id)).limit(1);
    return result[0] || null;
  }

  async getSongByPath(path: string): Promise<Song | null> {
    const result = await this.db.select().from(schema.songs).where(eq(schema.songs.path, path)).limit(1);
    return result[0] || null;
  }

  async getSongs(filters: SongFilters): Promise<Song[]> {
    const validated = SongFilterSchema.parse(filters);
    const conditions: any[] = [];

    if (validated.artistId) conditions.push(eq(schema.songs.artistId, validated.artistId));
    if (validated.albumId) conditions.push(eq(schema.songs.albumId, validated.albumId));
    if (validated.folderPath) conditions.push(insideFolder(schema.songs.path, validated.folderPath));
    if (validated.genre) conditions.push(eq(schema.songs.genre, validated.genre));
    if (validated.query) {
      const q = `%${escapeLike(validated.query)}%`;
      conditions.push(or(
        likeEscaped(schema.songs.title, q),
        likeEscaped(schema.songs.artist, q),
        likeEscaped(schema.songs.album, q)
      ));
    }

    const allowedSort = ['title', 'artist', 'album', 'year', 'trackNumber', 'duration', 'playCount', 'lastPlayed', 'dateAdded', 'dateModified'];
    let query = this.db.select().from(schema.songs);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    if (validated.sortBy && allowedSort.includes(validated.sortBy)) {
      query = query.orderBy(validated.sortOrder === 'desc' ? desc(schema.songs[validated.sortBy]) : asc(schema.songs[validated.sortBy]));
    } else {
      query = query.orderBy(asc(schema.songs.title));
    }

    if (validated.limit) query = query.limit(validated.limit);
    if (validated.offset) query = query.offset(validated.offset);

    return await query.all();
  }

  async getSongsByIds(ids: number[]): Promise<Song[]> {
    if (ids.length === 0) return [];
    return await this.db.select().from(schema.songs).where(inArray(schema.songs.id, ids)).all();
  }

  async incrementPlayCount(songId: number): Promise<void> {
    await this.db
      .update(schema.songs)
      .set({ playCount: sql`${schema.songs.playCount} + 1`, lastPlayed: nowSeconds() })
      .where(eq(schema.songs.id, songId));
  }

  async updateSongMetadata(songId: number, data: Partial<NewSong>): Promise<Song | null> {
    await this.db
      .update(schema.songs)
      .set({ ...data, updatedAt: nowSeconds() })
      .where(eq(schema.songs.id, songId));
    return await this.getSongById(songId);
  }

  async deleteSongs(songIds: number[]): Promise<{ deleted: number; errors: string[] }> {
    if (songIds.length === 0) return { deleted: 0, errors: [] };
    const errors: string[] = [];
    let deleted = 0;

    // Queue items, playlist items and lyrics go away through ON DELETE CASCADE (foreign_keys = ON).
    for (let i = 0; i < songIds.length; i += INSERT_CHUNK_SIZE) {
      const chunk = songIds.slice(i, i + INSERT_CHUNK_SIZE);
      try {
        await this.db.delete(schema.songs).where(inArray(schema.songs.id, chunk));
        deleted += chunk.length;
      } catch (error) {
        errors.push(`Failed to delete songs: ${(error as Error).message}`);
      }
    }

    return { deleted, errors };
  }

  async getSongCount(filters: Partial<Record<'artistId' | 'albumId' | 'folderPath' | 'genre', number | string>>): Promise<number> {
    const conditions: any[] = [];
    if (filters.artistId) conditions.push(eq(schema.songs.artistId, filters.artistId as number));
    if (filters.albumId) conditions.push(eq(schema.songs.albumId, filters.albumId as number));
    if (filters.folderPath) conditions.push(insideFolder(schema.songs.path, String(filters.folderPath)));
    if (filters.genre) conditions.push(eq(schema.songs.genre, filters.genre as string));

    let query = this.db.select({ count: count() }).from(schema.songs);
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    const result = await query;
    return result[0]?.count || 0;
  }

  // ===== Queues =====
  async createQueue(data: CreateQueueInput): Promise<Queue> {
    const validated = CreateQueueSchema.parse(data);
    const result = await this.db.insert(schema.queues).values(validated).returning();
    return result[0];
  }

  async getQueue(id: number): Promise<Queue | null> {
    const result = await this.db.select().from(schema.queues).where(eq(schema.queues.id, id)).limit(1);
    return result[0] || null;
  }

  async getQueueBySource(type: string, sourceId: number): Promise<Queue | null> {
    const result = await this.db.select().from(schema.queues)
      .where(and(eq(schema.queues.type, type), eq(schema.queues.sourceId, sourceId)))
      .limit(1);
    return result[0] || null;
  }

  async getAllQueues(): Promise<Queue[]> {
    return await this.db.select().from(schema.queues).orderBy(desc(schema.queues.updatedAt)).all();
  }

  async getQueuesWithSongCounts(): Promise<Array<Queue & { songCount: number }>> {
    const query = this.db
      .select({
        id: schema.queues.id,
        name: schema.queues.name,
        type: schema.queues.type,
        sourceId: schema.queues.sourceId,
        currentIndex: schema.queues.currentIndex,
        currentPositionMs: schema.queues.currentPositionMs,
        createdAt: schema.queues.createdAt,
        updatedAt: schema.queues.updatedAt,
        songCount: count(schema.queueItems.id),
      })
      .from(schema.queues)
      .leftJoin(schema.queueItems, eq(schema.queueItems.queueId, schema.queues.id))
      .groupBy(schema.queues.id)
      .orderBy(desc(schema.queues.updatedAt));

    return await query.all();
  }

  async updateQueue(id: number, data: Partial<NewQueue>): Promise<void> {
    await this.db.update(schema.queues).set({ ...data, updatedAt: nowSeconds() }).where(eq(schema.queues.id, id));
  }

  async setQueuePosition(queueId: number, index: number, positionMs: number): Promise<void> {
    await this.db
      .update(schema.queues)
      .set({ currentIndex: index, currentPositionMs: positionMs, updatedAt: nowSeconds() })
      .where(eq(schema.queues.id, queueId));
  }

  async deleteQueue(id: number): Promise<void> {
    await this.db.delete(schema.queues).where(eq(schema.queues.id, id));
  }

  async mergeOrReplaceQueue(data: MergeQueueInput): Promise<Queue> {
    const validated = MergeQueueSchema.parse(data);
    const existing = await this.db.select().from(schema.queues).where(eq(schema.queues.name, validated.name)).limit(1);
    
    if (existing.length > 0) {
      const queue = existing[0];
      if (validated.strategy === 'replace') {
        await this.db.delete(schema.queueItems).where(eq(schema.queueItems.queueId, queue.id));
        const items = validated.songIds.map((songId, index) => ({ queueId: queue.id, songId, position: index }));
        await this.db.insert(schema.queueItems).values(items);
        await this.updateQueue(queue.id, { currentIndex: 0, currentPositionMs: 0 });
        return queue;
      } else {
        const existingItems = await this.getQueueItems(queue.id);
        const existingSongIds = new Set(existingItems.map(i => i.songId));
        const newItems = validated.songIds.filter(id => !existingSongIds.has(id));
        if (newItems.length > 0) {
          const maxPos = Math.max(...existingItems.map(i => i.position), -1);
          const items = newItems.map((songId, index) => ({ queueId: queue.id, songId, position: maxPos + 1 + index }));
          await this.db.insert(schema.queueItems).values(items);
        }
        return queue;
      }
    } else {
      const queue = await this.createQueue({ name: validated.name, type: 'custom', sourceId: null });
      const items = validated.songIds.map((songId, index) => ({ queueId: queue.id, songId, position: index }));
      await this.db.insert(schema.queueItems).values(items);
      return queue;
    }
  }

  // ===== Queue Items =====
  async getQueueItems(queueId: number): Promise<QueueItem[]> {
    return await this.db.select().from(schema.queueItems)
      .where(eq(schema.queueItems.queueId, queueId))
      .orderBy(asc(schema.queueItems.position))
      .all();
  }

  async getQueueWithSongs(queueId: number): Promise<Queue & { songs: Song[] } | null> {
    const queue = await this.getQueue(queueId);
    if (!queue) return null;
    const items = await this.getQueueItems(queueId);
    const songIds = items.map(i => i.songId);
    const songs = songIds.length > 0 ? await this.getSongsByIds(songIds) : [];
    const songMap = new Map(songs.map(s => [s.id, s]));
    const orderedSongs = items.map(i => songMap.get(i.songId)).filter((s): s is Song => s !== undefined);
    return { ...queue, songs: orderedSongs };
  }

  async addQueueItems(queueId: number, songIds: number[]): Promise<void> {
    const existingItems = await this.getQueueItems(queueId);
    const maxPos = Math.max(...existingItems.map(i => i.position), -1);
    const items = songIds.map((songId, index) => ({ queueId, songId, position: maxPos + 1 + index }));
    await this.db.insert(schema.queueItems).values(items).onConflictDoNothing({ target: [schema.queueItems.queueId, schema.queueItems.songId] });
  }

  async removeQueueItems(queueId: number, songIds: number[]): Promise<{ removed: number; updated: number }> {
    if (songIds.length === 0) return { removed: 0, updated: 0 };
    await this.db.delete(schema.queueItems).where(and(eq(schema.queueItems.queueId, queueId), inArray(schema.queueItems.songId, songIds)));
    await this.reindexQueuePositions(queueId);
    
    // Keep the resume index inside the shortened queue.
    const remaining = (await this.getQueueItems(queueId)).length;
    const queue = await this.db.select().from(schema.queues).where(eq(schema.queues.id, queueId)).get();
    if (queue && queue.currentIndex >= remaining) {
      await this.updateQueue(queueId, { currentIndex: Math.max(0, remaining - 1) });
    }
    return { removed: songIds.length, updated: remaining };
  }

  async moveQueueItem(queueId: number, songId: number, newPosition: number): Promise<void> {
    const items = await this.getQueueItems(queueId);
    const itemIndex = items.findIndex(i => i.songId === songId);
    if (itemIndex === -1) return;
    
    const [removed] = items.splice(itemIndex, 1);
    items.splice(newPosition, 0, removed);
    
    for (let i = 0; i < items.length; i++) {
      await this.db.update(schema.queueItems)
        .set({ position: i })
        .where(and(eq(schema.queueItems.queueId, queueId), eq(schema.queueItems.songId, items[i].songId)));
    }
  }

  async clearQueue(queueId: number): Promise<void> {
    await this.db.delete(schema.queueItems).where(eq(schema.queueItems.queueId, queueId));
  }

  async reindexQueuePositions(queueId: number): Promise<void> {
    const items = await this.getQueueItems(queueId);
    for (let i = 0; i < items.length; i++) {
      await this.db.update(schema.queueItems)
        .set({ position: i })
        .where(and(eq(schema.queueItems.queueId, queueId), eq(schema.queueItems.songId, items[i].songId)));
    }
  }

  // ===== Playlists =====
  async createPlaylist(data: CreatePlaylistInput): Promise<Playlist> {
    const validated = CreatePlaylistSchema.parse(data);
    const result = await this.db.insert(schema.playlists).values(validated).returning();
    return result[0];
  }

  async getPlaylist(id: number): Promise<Playlist | null> {
    const result = await this.db.select().from(schema.playlists).where(eq(schema.playlists.id, id)).limit(1);
    return result[0] || null;
  }

  async getPlaylists(includeAuto = true): Promise<Playlist[]> {
    let query = this.db.select().from(schema.playlists);
    if (!includeAuto) {
      query = query.where(eq(schema.playlists.type, 'user'));
    }
    return await query.orderBy(asc(schema.playlists.name)).all();
  }

  async getPlaylistsWithCounts(): Promise<Array<Playlist & { songCount: number }>> {
    return await this.db
      .select({
        id: schema.playlists.id,
        name: schema.playlists.name,
        type: schema.playlists.type,
        autoRule: schema.playlists.autoRule,
        createdAt: schema.playlists.createdAt,
        updatedAt: schema.playlists.updatedAt,
        songCount: count(schema.playlistItems.id),
      })
      .from(schema.playlists)
      .leftJoin(schema.playlistItems, eq(schema.playlistItems.playlistId, schema.playlists.id))
      .groupBy(schema.playlists.id)
      .orderBy(asc(schema.playlists.name))
      .all();
  }

  async updatePlaylist(id: number, data: Partial<NewPlaylist>): Promise<void> {
    await this.db.update(schema.playlists).set({ ...data, updatedAt: nowSeconds() }).where(eq(schema.playlists.id, id));
  }

  async deletePlaylist(id: number): Promise<void> {
    await this.db.delete(schema.playlists).where(eq(schema.playlists.id, id));
  }

  async getPlaylistItems(playlistId: number): Promise<PlaylistItem[]> {
    return await this.db.select().from(schema.playlistItems)
      .where(eq(schema.playlistItems.playlistId, playlistId))
      .orderBy(asc(schema.playlistItems.position))
      .all();
  }

  async getPlaylistWithSongs(playlistId: number): Promise<Playlist & { songs: Song[] } | null> {
    const playlist = await this.getPlaylist(playlistId);
    if (!playlist) return null;
    const items = await this.getPlaylistItems(playlistId);
    const songIds = items.map(i => i.songId);
    const songs = songIds.length > 0 ? await this.getSongsByIds(songIds) : [];
    const songMap = new Map(songs.map(s => [s.id, s]));
    const orderedSongs = items.map(i => songMap.get(i.songId)).filter((s): s is Song => s !== undefined);
    return { ...playlist, songs: orderedSongs };
  }

  async addToPlaylist(data: AddToPlaylistInput): Promise<void> {
    const validated = AddToPlaylistSchema.parse(data);
    const existingItems = await this.getPlaylistItems(validated.playlistId);
    const existingSongIds = new Set(existingItems.map(i => i.songId));
    const maxPos = Math.max(...existingItems.map(i => i.position), -1);
    const newItems = validated.songIds.filter(id => !existingSongIds.has(id));
    if (newItems.length > 0) {
      const items = newItems.map((songId, index) => ({ playlistId: validated.playlistId, songId, position: maxPos + 1 + index }));
      await this.db.insert(schema.playlistItems).values(items);
    }
  }

  async removeFromPlaylist(playlistId: number, songIds: number[]): Promise<void> {
    if (songIds.length === 0) return;
    await this.db.delete(schema.playlistItems)
      .where(and(eq(schema.playlistItems.playlistId, playlistId), inArray(schema.playlistItems.songId, songIds)));
    await this.reindexPlaylistPositions(playlistId);
  }

  async movePlaylistItem(data: MovePlaylistItemInput): Promise<void> {
    const validated = MovePlaylistItemSchema.parse(data);
    const items = await this.getPlaylistItems(validated.playlistId);
    const itemIndex = items.findIndex(i => i.songId === validated.songId);
    if (itemIndex === -1) return;
    
    const [removed] = items.splice(itemIndex, 1);
    items.splice(validated.newPosition, 0, removed);
    
    for (let i = 0; i < items.length; i++) {
      await this.db.update(schema.playlistItems)
        .set({ position: i })
        .where(and(eq(schema.playlistItems.playlistId, validated.playlistId), eq(schema.playlistItems.songId, items[i].songId)));
    }
  }

  async reindexPlaylistPositions(playlistId: number): Promise<void> {
    const items = await this.getPlaylistItems(playlistId);
    for (let i = 0; i < items.length; i++) {
      await this.db.update(schema.playlistItems)
        .set({ position: i })
        .where(and(eq(schema.playlistItems.playlistId, playlistId), eq(schema.playlistItems.songId, items[i].songId)));
    }
  }

  async refreshAutoPlaylists(): Promise<void> {
    const recentSongs = await this.db.select({ id: schema.songs.id }).from(schema.songs).orderBy(desc(schema.songs.dateAdded)).limit(100);
    const mostPlayed = await this.db.select({ id: schema.songs.id }).from(schema.songs).orderBy(desc(schema.songs.playCount)).limit(100);
    const recentlyPlayed = await this.db.select({ id: schema.songs.id }).from(schema.songs).where(sql`${schema.songs.lastPlayed} IS NOT NULL`).orderBy(desc(schema.songs.lastPlayed)).limit(100);

    const autoPlaylists = [
      { name: 'Recently Added', type: 'auto_recently_added' as const, songIds: recentSongs.map(s => s.id) },
      { name: 'Most Played', type: 'auto_most_played' as const, songIds: mostPlayed.map(s => s.id) },
      { name: 'Recently Played', type: 'auto_recent' as const, songIds: recentlyPlayed.map(s => s.id) },
    ];

    for (const ap of autoPlaylists) {
      const existing = await this.db.select().from(schema.playlists).where(eq(schema.playlists.name, ap.name)).limit(1);
      if (existing.length > 0) {
        await this.db.delete(schema.playlistItems).where(eq(schema.playlistItems.playlistId, existing[0].id));
        const items = ap.songIds.map((songId, index) => ({ playlistId: existing[0].id, songId, position: index }));
        if (items.length > 0) await this.db.insert(schema.playlistItems).values(items);
      } else {
        const playlist = await this.createPlaylist({ name: ap.name, type: ap.type });
        const items = ap.songIds.map((songId, index) => ({ playlistId: playlist.id, songId, position: index }));
        if (items.length > 0) await this.db.insert(schema.playlistItems).values(items);
      }
    }
  }

  // ===== Folders =====
  async upsertFolders(folders: NewFolder[]): Promise<void> {
    if (folders.length === 0) return;
    await this.db.insert(schema.folders).values(folders).onConflictDoUpdate({
      target: schema.folders.path,
      set: {
        name: sql`excluded.name`,
        parentPath: sql`excluded.parent_path`,
        depth: sql`excluded.depth`,
        songCount: sql`excluded.song_count`,
        albumCount: sql`excluded.album_count`,
        artistCount: sql`excluded.artist_count`,
        dateModified: sql`excluded.date_modified`,
      },
    });
  }

  async getFolders(parentPath?: string, linear = true): Promise<Folder[]> {
    if (linear) {
      return await this.db.select().from(schema.folders).orderBy(asc(schema.folders.path)).all();
    }
    if (parentPath) {
      return await this.db.select().from(schema.folders)
        .where(eq(schema.folders.parentPath, parentPath))
        .orderBy(asc(schema.folders.name))
        .all();
    }
    return await this.db.select().from(schema.folders)
      .where(sql`${schema.folders.parentPath} IS NULL`)
      .orderBy(asc(schema.folders.name))
      .all();
  }

  async getFolderByPath(path: string): Promise<Folder | null> {
    const result = await this.db.select().from(schema.folders).where(eq(schema.folders.path, path)).limit(1);
    return result[0] || null;
  }

  async renameFolder(oldPath: string, newPath: string): Promise<void> {
    const folder = await this.getFolderByPath(oldPath);
    if (!folder) throw new NotFoundError('Folder', oldPath);
    
    await this.db.update(schema.folders).set({
      path: newPath,
      name: newPath.split('/').pop() || newPath,
      dateModified: nowSeconds(),
    }).where(eq(schema.folders.path, oldPath));
    
    await this.db.update(schema.folders).set({
      parentPath: sql`REPLACE(${schema.folders.parentPath}, ${oldPath}, ${newPath})`,
      dateModified: nowSeconds(),
    }).where(sql`${schema.folders.parentPath} = ${oldPath} OR ${insideFolder(schema.folders.parentPath, oldPath)}`);
    
    await this.db.update(schema.songs).set({
      path: sql`REPLACE(${schema.songs.path}, ${oldPath}, ${newPath})`,
    }).where(insideFolder(schema.songs.path, oldPath));
  }

  async deleteEmptyFolders(): Promise<number> {
    const result = await this.db.delete(schema.folders).where(eq(schema.folders.songCount, 0));
    return result.changes || 0;
  }

  // ===== Equalizer =====
  async getEqPresets(deviceProfile?: string): Promise<EqPreset[]> {
    if (deviceProfile) {
      return await this.db.select().from(schema.eqPresets)
        .where(eq(schema.eqPresets.deviceProfile, deviceProfile))
        .orderBy(desc(schema.eqPresets.isSystem), asc(schema.eqPresets.name))
        .all();
    }
    return await this.db.select().from(schema.eqPresets)
      .orderBy(desc(schema.eqPresets.isSystem), asc(schema.eqPresets.name))
      .all();
  }

  async getEqPreset(id: number): Promise<EqPreset | null> {
    const result = await this.db.select().from(schema.eqPresets).where(eq(schema.eqPresets.id, id)).limit(1);
    return result[0] || null;
  }

  async createEqPreset(data: CreateEqPresetInput): Promise<EqPreset> {
    const validated = CreateEqPresetSchema.parse(data);
    const presetData: NewEqPreset = {
      ...validated,
      bands: JSON.stringify(validated.bands),
      bassBoost: validated.bassBoost ? 1 : 0,
      virtualizer: validated.virtualizer ? 1 : 0,
      reverb: validated.reverb ? 1 : 0,
      isSystem: validated.isSystem ?? 0,
    };
    const result = await this.db.insert(schema.eqPresets).values(presetData).returning();
    return result[0];
  }

  async updateEqPreset(id: number, data: Partial<NewEqPreset>): Promise<void> {
    await this.db.update(schema.eqPresets).set({ ...data, updatedAt: nowSeconds() }).where(eq(schema.eqPresets.id, id));
  }

  async deleteEqPreset(id: number): Promise<void> {
    const result = await this.db.select().from(schema.eqPresets).where(eq(schema.eqPresets.id, id)).limit(1);
    if (result.length === 0) throw new NotFoundError('EQ Preset', id);
    if (result[0].isSystem) throw new ValidationError('Cannot delete system preset');
    
    await this.db.delete(schema.eqPresets).where(eq(schema.eqPresets.id, id));
  }

  // ===== Device Profiles =====
  async getDeviceProfiles(): Promise<DeviceProfile[]> {
    return await this.db.select().from(schema.deviceProfiles).orderBy(desc(schema.deviceProfiles.lastUsed)).all();
  }

  async getDeviceProfileByMac(mac: string): Promise<DeviceProfile | null> {
    const result = await this.db.select().from(schema.deviceProfiles)
      .where(eq(schema.deviceProfiles.bluetoothMac, mac.toUpperCase()))
      .limit(1);
    return result[0] || null;
  }

  async upsertDeviceProfile(data: NewDeviceProfile): Promise<DeviceProfile> {
    const validated = CreateDeviceProfileSchema.parse({
      ...data,
      bluetoothMac: data.bluetoothMac,
    });
    
    const existing = await this.getDeviceProfileByMac(validated.bluetoothMac || '');
    if (existing) {
      const result = await this.db.update(schema.deviceProfiles)
        .set({ ...validated, lastUsed: nowSeconds() })
        .where(eq(schema.deviceProfiles.id, existing.id))
        .returning();
      return result[0];
    }
    const result = await this.db.insert(schema.deviceProfiles).values(validated).returning();
    return result[0];
  }

  async updateDeviceProfileLastUsed(id: number): Promise<void> {
    await this.db.update(schema.deviceProfiles).set({ lastUsed: nowSeconds() }).where(eq(schema.deviceProfiles.id, id));
  }

  // ===== Lyrics =====
  async getLyrics(songId: number): Promise<Lyrics | null> {
    const result = await this.db.select().from(schema.lyrics).where(eq(schema.lyrics.songId, songId)).limit(1);
    return result[0] || null;
  }

  async upsertLyrics(data: SaveLyricsInput): Promise<Lyrics> {
    const validated = SaveLyricsSchema.parse(data);
    
    let syncedLines: string | undefined;
    if (validated.lines) {
      syncedLines = JSON.stringify(validated.lines);
    }
    
    const existing = await this.getLyrics(validated.songId);
    const lyricsData: NewLyrics = {
      songId: validated.songId,
      embeddedText: validated.embeddedText,
      lrcPath: validated.lrcPath,
      syncedLines: syncedLines,
      language: validated.language,
      updatedAt: nowSeconds(),
    };
    
    if (existing) {
      await this.db.update(schema.lyrics)
        .set(lyricsData)
        .where(eq(schema.lyrics.songId, validated.songId));
      return { ...existing, ...lyricsData };
    }
    
    const result = await this.db.insert(schema.lyrics).values(lyricsData).returning();
    return result[0];
  }

  // ===== Backups =====
  async createBackup(data: CreateBackupInput): Promise<Backup> {
    const validated = CreateBackupSchema.parse(data);
    const result = await this.db.insert(schema.backups).values(validated).returning();
    return result[0];
  }

  async getBackups(): Promise<Backup[]> {
    return await this.db.select().from(schema.backups).orderBy(desc(schema.backups.createdAt)).all();
  }

  async deleteBackup(id: number): Promise<void> {
    const result = await this.db.select().from(schema.backups).where(eq(schema.backups.id, id)).limit(1);
    if (result.length === 0) throw new NotFoundError('Backup', id);
    await this.db.delete(schema.backups).where(eq(schema.backups.id, id));
  }

  async cleanupOldBackups(retention: number): Promise<number> {
    const backups = await this.getBackups();
    if (backups.length <= retention) return 0;
    
    const toDelete = backups.slice(retention);
    for (const backup of toDelete) {
      await this.db.delete(schema.backups).where(eq(schema.backups.id, backup.id));
    }
    return toDelete.length;
  }

  // ===== Statistics =====
  async getLibraryStats(): Promise<{
    songs: number;
    artists: number;
    albums: number;
    folders: number;
    playlists: number;
    queues: number;
    totalDuration: number;
    totalSize: number;
  }> {
    const [
      songsCount,
      artistsCount,
      albumsCount,
      foldersCount,
      playlistsCount,
      queuesCount,
      durationSum,
      sizeSum,
    ] = await Promise.all([
      this.db.select({ count: count() }).from(schema.songs),
      this.db.select({ count: count() }).from(schema.songs).where(sql`${schema.songs.artist} IS NOT NULL AND ${schema.songs.artist} != ''`),
      this.db.select({ count: count() }).from(schema.songs).where(sql`${schema.songs.album} IS NOT NULL AND ${schema.songs.album} != ''`),
      this.db.select({ count: count() }).from(schema.folders),
      this.db.select({ count: count() }).from(schema.playlists),
      this.db.select({ count: count() }).from(schema.queues),
      this.db.select({ sum: sql`COALESCE(SUM(${schema.songs.duration}), 0)` }).from(schema.songs),
      this.db.select({ sum: sql`COALESCE(SUM(${schema.songs.size}), 0)` }).from(schema.songs),
    ]);

    return {
      songs: songsCount[0]?.count || 0,
      artists: artistsCount[0]?.count || 0,
      albums: albumsCount[0]?.count || 0,
      folders: foldersCount[0]?.count || 0,
      playlists: playlistsCount[0]?.count || 0,
      queues: queuesCount[0]?.count || 0,
      totalDuration: Number(durationSum[0]?.sum) || 0,
      totalSize: Number(sizeSum[0]?.sum) || 0,
    };
  }

  // ===== Search =====
  async search(query: string, limit = 50): Promise<{
    songs: Song[];
    albums: Array<{ name: string; artist: string; id: number }>;
    artists: Array<{ name: string; id: number }>;
    playlists: Array<{ name: string; id: number }>;
  }> {
    if (!query || query.trim().length === 0) {
      return { songs: [], albums: [], artists: [], playlists: [] };
    }

    const q = `%${escapeLike(query)}%`;
    const songs = await this.db.select().from(schema.songs)
      .where(or(
        likeEscaped(schema.songs.title, q),
        likeEscaped(schema.songs.artist, q),
        likeEscaped(schema.songs.album, q)
      ))
      .limit(limit)
      .all();

    const albums = await this.db.select({
      id: schema.songs.albumId,
      name: schema.songs.album,
      artist: schema.songs.artist,
    })
      .from(schema.songs)
      .where(likeEscaped(schema.songs.album, q))
      .groupBy(schema.songs.albumId, schema.songs.album, schema.songs.artist)
      .limit(limit)
      .all();

    const artists = await this.db.select({
      id: schema.songs.artistId,
      name: schema.songs.artist,
    })
      .from(schema.songs)
      .where(likeEscaped(schema.songs.artist, q))
      .groupBy(schema.songs.artistId, schema.songs.artist)
      .limit(limit)
      .all() as Array<{ id: number; name: string }>;

    const playlists = await this.db.select({
      id: schema.playlists.id,
      name: schema.playlists.name,
    })
      .from(schema.playlists)
      .where(likeEscaped(schema.playlists.name, q))
      .limit(limit)
      .all();

    return { songs, albums, artists, playlists };
  }

  // ===== Cache =====
  async cacheSongArtwork(songId: number, artwork: string): Promise<void> {
    await this.db.update(schema.songs)
      .set({ embeddedArt: artwork, updatedAt: nowSeconds() })
      .where(eq(schema.songs.id, songId));
  }

  async getSongsNeedingArtwork(): Promise<Song[]> {
    return await this.db.select().from(schema.songs)
      .where(sql`${schema.songs.embeddedArt} IS NULL`)
      .orderBy(desc(schema.songs.dateAdded))
      .limit(100)
      .all();
  }

  async cleanupOrphanedRecords(): Promise<number> {
    const result = await this.db.delete(schema.queueItems)
      .where(not(exists(
        this.db.select().from(schema.queues).where(eq(schema.queues.id, schema.queueItems.queueId))
      )));
    return result.changes || 0;
  }
}

export const databaseService = DatabaseService.getInstance();
export default databaseService;