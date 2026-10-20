import * as MediaLibrary from 'expo-media-library';
import { databaseService } from '@/services/DatabaseService';
import type { NewSong, NewFolder } from '@/db/schema';

export interface ScanProgress {
  total: number;
  processed: number;
  currentFile: string;
  phase: 'scanning' | 'indexing' | 'complete' | 'error';
  error?: string;
}

export interface ScanResult {
  added: number;
  updated: number;
  removed: number;
}

type ScanProgressListener = (progress: ScanProgress) => void;

const PAGE_SIZE = 500;
const DEFAULT_MIN_DURATION_MS = 30_000;
const AUDIOBOOK_THRESHOLD_MS = 60 * 60 * 1000;

class LibraryService {
  private static instance: LibraryService;
  private listeners: Set<ScanProgressListener> = new Set();
  private isScanning = false;
  private abortRequested = false;

  static getInstance(): LibraryService {
    if (!LibraryService.instance) {
      LibraryService.instance = new LibraryService();
    }
    return LibraryService.instance;
  }

  subscribe(listener: ScanProgressListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(progress: ScanProgress, onProgress?: ScanProgressListener): void {
    for (const listener of this.listeners) listener(progress);
    onProgress?.(progress);
  }

  /** Asks for access to the user's audio files (READ_MEDIA_AUDIO / READ_EXTERNAL_STORAGE). */
  async requestPermissions(): Promise<boolean> {
    const current = await MediaLibrary.getPermissionsAsync();
    if (current.granted) return true;
    const requested = await MediaLibrary.requestPermissionsAsync();
    return requested.granted;
  }

  /**
   * Scans the device's audio and syncs the database: new files are added, changed files
   * updated and files that no longer exist removed.
   */
  async scan(onProgress?: ScanProgressListener): Promise<ScanResult> {
    if (this.isScanning) throw new Error('A scan is already in progress');
    this.isScanning = true;
    this.abortRequested = false;

    try {
      if (!(await this.requestPermissions())) {
        throw new Error('Permission to read audio files was denied');
      }

      const minDuration =
        (await databaseService.getSetting<number>('library_min_duration_ms')) ?? DEFAULT_MIN_DURATION_MS;
      const includeAudiobooks = (await databaseService.getSetting<boolean>('library_include_audiobooks')) ?? false;

      const knownPaths = await databaseService.getAllSongPaths();
      const seenPaths = new Set<string>();
      const folders = new Map<string, number>();
      const songs: NewSong[] = [];

      let total = 0;
      let after: string | undefined;
      let hasNextPage = true;

      while (hasNextPage) {
        if (this.abortRequested) throw new Error('Scan cancelled');

        const page = await MediaLibrary.getAssetsAsync({
          mediaType: MediaLibrary.MediaType.audio,
          first: PAGE_SIZE,
          after,
          sortBy: MediaLibrary.SortBy.creationTime,
        });
        total = page.totalCount;
        after = page.endCursor;
        hasNextPage = page.hasNextPage;

        for (const asset of page.assets) {
          const durationMs = Math.round((asset.duration || 0) * 1000);
          if (durationMs > 0 && durationMs < minDuration) continue;
          if (!includeAudiobooks && durationMs > AUDIOBOOK_THRESHOLD_MS) continue;

          const filename = asset.filename || 'Unknown';
          const idNumber = parseInt(asset.id, 10);
          songs.push({
            mediaStoreId: Number.isNaN(idNumber) ? undefined : idNumber,
            mediaStoreUri: asset.uri,
            path: asset.uri,
            displayName: filename,
            title: filename.replace(/\.[^/.]+$/, ''),
            duration: durationMs,
            size: 0, // not exposed by expo-media-library's asset listing
            mimeType: 'audio/*',
            dateAdded: Math.floor((asset.creationTime || Date.now()) / 1000),
            dateModified: Math.floor((asset.modificationTime || Date.now()) / 1000),
          });
          seenPaths.add(asset.uri);

          const folderPath = asset.uri.substring(0, asset.uri.lastIndexOf('/'));
          folders.set(folderPath, (folders.get(folderPath) ?? 0) + 1);
        }

        this.emit(
          { total, processed: songs.length, currentFile: page.assets[page.assets.length - 1]?.filename ?? '', phase: 'scanning' },
          onProgress,
        );
      }

      this.emit({ total, processed: songs.length, currentFile: 'Saving…', phase: 'indexing' }, onProgress);

      await databaseService.insertSongs(songs);
      const removed = await databaseService.deleteSongsNotIn(seenPaths);

      const folderRows: NewFolder[] = [...folders.entries()].map(([path, songCount]) => ({
        path,
        name: path.split('/').pop() || path,
        parentPath: path.substring(0, path.lastIndexOf('/')) || null,
        depth: path.split('/').length - 1,
        songCount,
        albumCount: 0,
        artistCount: 0,
      }));
      await databaseService.upsertFolders(folderRows);
      await databaseService.deleteFoldersNotIn(new Set(folders.keys()));

      const added = songs.filter((s) => !knownPaths.has(s.path)).length;
      const result: ScanResult = { added, updated: songs.length - added, removed };

      this.emit({ total, processed: songs.length, currentFile: '', phase: 'complete' }, onProgress);
      return result;
    } catch (error) {
      const message = (error as Error).message;
      this.emit({ total: 0, processed: 0, currentFile: '', phase: 'error', error: message }, onProgress);
      throw error;
    } finally {
      this.isScanning = false;
      this.abortRequested = false;
    }
  }

  abortScan(): void {
    if (this.isScanning) this.abortRequested = true;
  }

  isScanInProgress(): boolean {
    return this.isScanning;
  }
}

export const libraryService = LibraryService.getInstance();
export default libraryService;
