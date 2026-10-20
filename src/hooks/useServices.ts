import { useEffect, useCallback, useState } from 'react';
import { databaseService } from '@/services/DatabaseService';
import { libraryService, type ScanProgress } from '@/services/LibraryService';
import { playbackService, type PlaybackState } from '@/services/PlaybackService';
import { useLibraryStore, usePlayerStore, useUIStore, useEqualizerStore, useSettingsStore } from '@/store/useAppStore';
import type { Song } from '@/db/schema';
import type { QueueWithSongs } from '@/store/useAppStore';

export function useDatabase() {
  const { setInitialized, setSettings } = useSettingsStore();

  useEffect(() => {
    let mounted = true;
    
    async function init() {
      try {
        await databaseService.initialize();
        await playbackService.initialize();
        const settings = await databaseService.getAllSettings();
        if (mounted) {
          setSettings(settings);
          setInitialized(true);
        }
      } catch (error) {
        console.error('Database initialization failed:', error);
        if (mounted) {
          setInitialized(true);
        }
      }
    }
    
    init();
    
    return () => { mounted = false; };
  }, [setInitialized, setSettings]);
}

export function useLibrary() {
  const { setSongs, setFolders, setAlbums, setArtists, setPlaylists, setQueues, setLoading } = useLibraryStore();
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const loadLibrary = useCallback(async () => {
    setLoading(true);
    try {
      const [songs, folders, playlists, queues] = await Promise.all([
        databaseService.getSongs({ limit: 100000 }),
        databaseService.getFolders(),
        databaseService.getPlaylists(),
        databaseService.getAllQueues(),
      ]);
      
      setSongs(songs);
      setFolders(folders);
      setPlaylists(playlists);
      setQueues(queues);
    } catch (error) {
      console.error('Failed to load library:', error);
    } finally {
      setLoading(false);
    }
  }, [setSongs, setFolders, setPlaylists, setQueues, setLoading]);

  const scanLibrary = useCallback(async () => {
    if (isScanning) return;
    
    setIsScanning(true);
    setLoading(true);
    setScanProgress({ total: 0, processed: 0, currentFile: 'Starting scan...', phase: 'scanning' });
    
    try {
      const result = await libraryService.scan(setScanProgress);
      await loadLibrary();
      return result;
    } catch (error) {
      console.error('Library scan failed:', error);
      throw error;
    } finally {
      setIsScanning(false);
      setLoading(false);
      setScanProgress(null);
    }
  }, [isScanning, loadLibrary, setLoading, setScanProgress]);

  const abortScan = useCallback(() => {
    libraryService.abortScan();
    setIsScanning(false);
    setScanProgress(null);
  }, [setIsScanning, setScanProgress]);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  return {
    scanProgress,
    isScanning,
    scanLibrary,
    abortScan,
    loadLibrary,
  };
}

export function usePlayback() {
  const {
    currentQueue,
    currentIndex,
    position,
    duration,
    isPlaying,
    repeatMode,
    shuffle,
    speed,
    pitch,
    volume,
    isMuted,
    sleepTimer,
    setCurrentQueue,
    setCurrentIndex,
    setPosition,
    setDuration,
    setIsPlaying,
    setRepeatMode,
    setShuffle,
    setSpeed,
    setPitch,
    setVolume,
    setMuted,
    setSleepTimer,
  } = usePlayerStore();

  const [state, setState] = useState<PlaybackState>(() => playbackService.getState());

  useEffect(() => {
    // Mirror the service state into React state and the store.
    return playbackService.subscribe((next) => {
      setState(next);
      setIsPlaying(next.isPlaying);
      setPosition(next.position);
      setDuration(next.duration);
      setCurrentIndex(next.currentIndex);
    });
  }, [setIsPlaying, setPosition, setDuration, setCurrentIndex]);

  const playQueue = useCallback(async (queue: QueueWithSongs, startIndex = 0) => {
    setCurrentQueue(queue);
    await playbackService.loadQueue(queue.id, queue.songs, startIndex);
  }, [setCurrentQueue]);

  const playSong = useCallback(async (song: Song, queueContext?: QueueWithSongs) => {
    if (queueContext) {
      setCurrentQueue(queueContext);
      const index = queueContext.songs.findIndex((s) => s.id === song.id);
      await playbackService.loadQueue(queueContext.id, queueContext.songs, Math.max(index, 0));
      return;
    }
    await playbackService.playSong(song);
  }, [setCurrentQueue]);

  const togglePlayPause = useCallback(async () => {
    if (isPlaying) {
      await playbackService.pause();
    } else {
      await playbackService.resume();
    }
  }, [isPlaying]);

  const seek = useCallback(async (positionMs: number) => {
    await playbackService.seekTo(positionMs);
  }, []);

  const changeSpeed = useCallback(async (speed: number) => {
    await playbackService.setSpeed(speed);
    setSpeed(speed);
  }, [setSpeed]);

  const changePitch = useCallback(async (pitch: number) => {
    await playbackService.setPitch(pitch);
    setPitch(pitch);
  }, [setPitch]);

  const changeVolume = useCallback(async (volume: number) => {
    await playbackService.setVolume(volume);
    setVolume(volume);
  }, [setVolume]);

  const toggleMute = useCallback(async () => {
    await playbackService.setMuted(!isMuted);
    setMuted(!isMuted);
  }, [isMuted, setMuted]);

  const toggleRepeat = useCallback(async () => {
    const modes: ('off' | 'one' | 'all')[] = ['off', 'one', 'all'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    await playbackService.setRepeatMode(nextMode);
    setRepeatMode(nextMode);
  }, [repeatMode, setRepeatMode]);

  const toggleShuffle = useCallback(async () => {
    await playbackService.setShuffle(!shuffle);
    setShuffle(!shuffle);
  }, [shuffle, setShuffle]);

  const playNext = useCallback(async () => {
    await playbackService.playNext();
  }, []);

  const playPrevious = useCallback(async () => {
    await playbackService.playPrevious();
  }, []);

  const startSleepTimer = useCallback(async (type: 'time' | 'songs', value: number) => {
    const now = Date.now();
    let timeMs = 0;
    let songsRemaining = 0;
    let endTime = 0;

    if (type === 'time') {
      timeMs = value;
      endTime = now + timeMs;
    } else {
      songsRemaining = value;
    }

    const timer = { enabled: true, type, timeMs, songsRemaining, endTime };
    await playbackService.setSleepTimer(timer);
    setSleepTimer(timer);
  }, [setSleepTimer]);

  const cancelSleepTimer = useCallback(async () => {
    await playbackService.setSleepTimer(null);
    setSleepTimer(null);
  }, [setSleepTimer]);

  return {
    state,
    currentQueue,
    currentIndex,
    position,
    duration,
    isPlaying,
    repeatMode,
    shuffle,
    speed,
    pitch,
    volume,
    isMuted,
    sleepTimer,
    playQueue,
    playSong,
    togglePlayPause,
    seek,
    changeSpeed,
    changePitch,
    changeVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    playNext,
    playPrevious,
    startSleepTimer,
    cancelSleepTimer,
    playbackService,
  };
}

export function useEqualizer() {
  const {
    enabled,
    presetId,
    customBands,
    preamp,
    bassBoost,
    virtualizer,
    reverb,
    deviceProfile,
    presets,
    deviceProfiles,
    setEqualizerEnabled,
    setEqualizerPreset,
    setCustomBands,
    setPreamp,
    setBassBoost,
    setVirtualizer,
    setReverb,
    setDeviceProfile,
    setPresets,
    setDeviceProfiles,
  } = useEqualizerStore();

  const loadPresets = useCallback(async () => {
    const [eqPresets, profiles] = await Promise.all([
      databaseService.getEqPresets(),
      databaseService.getDeviceProfiles(),
    ]);
    setPresets(eqPresets);
    setDeviceProfiles(profiles);
  }, [setPresets, setDeviceProfiles]);

  const applyPreset = useCallback(async (preset: typeof presets[0]) => {
    setEqualizerPreset(preset.id);
    setCustomBands(JSON.parse(preset.bands));
    setPreamp(preset.preamp);
    setBassBoost(!!preset.bassBoost);
    setVirtualizer(!!preset.virtualizer);
    setReverb(!!preset.reverb);
    await playbackService.applyEqualizer({
      presetId: preset.id,
      bands: JSON.parse(preset.bands),
      preamp: preset.preamp,
      bassBoost: !!preset.bassBoost,
      virtualizer: !!preset.virtualizer,
      reverb: !!preset.reverb,
    });
  }, [setEqualizerPreset, setCustomBands, setPreamp, setBassBoost, setVirtualizer, setReverb]);

  const saveCustomPreset = useCallback(async (name: string) => {
    const preset = await databaseService.createEqPreset({
      name,
      bands: JSON.stringify(customBands),
      preamp,
      bassBoost: bassBoost ? 1 : 0,
      virtualizer: virtualizer ? 1 : 0,
      reverb: reverb ? 1 : 0,
      deviceProfile: deviceProfile !== 'auto' ? deviceProfile : undefined,
      isSystem: 0,
    });
    loadPresets();
    return preset;
  }, [customBands, preamp, bassBoost, virtualizer, reverb, deviceProfile, loadPresets]);

  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  return {
    enabled,
    presetId,
    customBands,
    preamp,
    bassBoost,
    virtualizer,
    reverb,
    deviceProfile,
    presets,
    deviceProfiles,
    setEqualizerEnabled,
    setCustomBands,
    setPreamp,
    setBassBoost,
    setVirtualizer,
    setReverb,
    setDeviceProfile,
    applyPreset,
    saveCustomPreset,
    loadPresets,
  };
}

export function useMultiSelect() {
  const {
    multiSelectMode,
    selectedIds,
    selectionSource,
    toggleMultiSelect,
    toggleSelection,
    selectAll,
    clearSelection,
  } = useUIStore();

  const toggle = useCallback((id: number) => {
    toggleSelection(id);
  }, [toggleSelection]);

  const selectAllItems = useCallback((ids: number[]) => {
    selectAll(ids);
  }, [selectAll]);

  const clear = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  const start = useCallback((source: typeof selectionSource) => {
    toggleMultiSelect(source);
  }, [toggleMultiSelect]);

  return {
    isActive: multiSelectMode,
    selectedIds,
    selectionSource,
    count: selectedIds.size,
    toggle,
    selectAll: selectAllItems,
    clear,
    start,
    hasSelection: selectedIds.size > 0,
  };
}

export function useSearch() {
  const { searchQuery, setSearchQuery } = useLibraryStore();
  const { songs, folders, albums, artists, playlists } = useLibraryStore();

  const search = useCallback((query: string) => {
    setSearchQuery(query);
  }, [setSearchQuery]);

  const clear = useCallback(() => {
    setSearchQuery('');
  }, [setSearchQuery]);

  const getResults = useCallback(() => {
    if (!searchQuery.trim()) return [];
    
    const q = searchQuery.toLowerCase();
    const results: Array<{ type: string; item: any }> = [];

    for (const song of songs) {
      if (song.title?.toLowerCase().includes(q) || 
          song.artist?.toLowerCase().includes(q) || 
          song.album?.toLowerCase().includes(q)) {
        results.push({ type: 'song', item: song });
      }
    }

    for (const album of albums) {
      if (album.name.toLowerCase().includes(q) || album.artist.toLowerCase().includes(q)) {
        results.push({ type: 'album', item: album });
      }
    }

    for (const artist of artists) {
      if (artist.name.toLowerCase().includes(q)) {
        results.push({ type: 'artist', item: artist });
      }
    }

    for (const playlist of playlists) {
      if (playlist.name.toLowerCase().includes(q)) {
        results.push({ type: 'playlist', item: playlist });
      }
    }

    return results;
  }, [searchQuery, songs, albums, artists, playlists]);

  return {
    query: searchQuery,
    search,
    clear,
    results: getResults(),
    hasQuery: searchQuery.trim().length > 0,
  };
}
