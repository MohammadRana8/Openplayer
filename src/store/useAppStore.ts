import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { MMKVStorage } from '@/utils/MMKVStorage';
import type { Song, Queue, Playlist, Folder, EqPreset, DeviceProfile, Lyrics, Backup } from '@/db/schema';

export interface QueueWithSongs extends Queue {
  songs: Song[];
}

interface PlayerState {
  currentQueueId: number | null;
  currentQueue: QueueWithSongs | null;
  currentIndex: number;
  position: number;
  duration: number;
  isPlaying: boolean;
  repeatMode: 'off' | 'one' | 'all';
  shuffle: boolean;
  speed: number;
  pitch: number;
  volume: number;
  isMuted: boolean;
  sleepTimer: { enabled: boolean; type: 'time' | 'songs'; timeMs: number; songsRemaining: number; endTime: number } | null;
}

interface LibraryState {
  songs: Song[];
  folders: Folder[];
  albums: { id: number; name: string; artist: string; songCount: number; artwork?: string }[];
  artists: { id: number; name: string; songCount: number; albumCount: number }[];
  playlists: Playlist[];
  queues: Queue[];
  currentFolderPath: string | null;
  viewMode: 'linear' | 'hierarchical';
  sortBy: Record<string, string>;
  searchQuery: string;
  isLoading: boolean;
}

interface UIState {
  theme: 'light' | 'dark' | 'system';
  density: 'compact' | 'comfortable';
  animationsEnabled: boolean;
  bottomNavIndex: number;
  playerExpanded: boolean;
  lyricsVisible: boolean;
  queueVisible: boolean;
  equalizerVisible: boolean;
  multiSelectMode: boolean;
  selectedIds: Set<number>;
  selectionSource: 'songs' | 'queues' | 'playlists' | 'folders' | 'albums' | 'artists' | null;
}

interface EqualizerState {
  enabled: boolean;
  presetId: number | null;
  customBands: number[];
  preamp: number;
  bassBoost: boolean;
  virtualizer: boolean;
  reverb: boolean;
  deviceProfile: 'speaker' | 'headphone' | 'bluetooth' | 'wired' | 'auto';
  presets: EqPreset[];
  deviceProfiles: DeviceProfile[];
}

interface SettingsState {
  settings: Record<string, unknown>;
  isInitialized: boolean;
}

type AppStore = PlayerState & LibraryState & UIState & EqualizerState & SettingsState & {
  // Player actions
  setCurrentQueue: (queue: QueueWithSongs | null) => void;
  setCurrentIndex: (index: number) => void;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setRepeatMode: (mode: 'off' | 'one' | 'all') => void;
  setShuffle: (shuffle: boolean) => void;
  setSpeed: (speed: number) => void;
  setPitch: (pitch: number) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setSleepTimer: (timer: PlayerState['sleepTimer']) => void;
  nextSong: () => void;
  previousSong: () => void;
  
  // Library actions
  setSongs: (songs: Song[]) => void;
  setFolders: (folders: Folder[]) => void;
  setAlbums: (albums: LibraryState['albums']) => void;
  setArtists: (artists: LibraryState['artists']) => void;
  setPlaylists: (playlists: Playlist[]) => void;
  setQueues: (queues: Queue[]) => void;
  addQueue: (queue: Queue) => void;
  updateQueue: (id: number, data: Partial<Queue>) => void;
  removeQueue: (id: number) => void;
  setCurrentFolderPath: (path: string | null) => void;
  setViewMode: (mode: 'linear' | 'hierarchical') => void;
  setSortBy: (key: string, value: string) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  
  // UI actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setDensity: (density: 'compact' | 'comfortable') => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  setBottomNavIndex: (index: number) => void;
  setPlayerExpanded: (expanded: boolean) => void;
  setLyricsVisible: (visible: boolean) => void;
  setQueueVisible: (visible: boolean) => void;
  setEqualizerVisible: (visible: boolean) => void;
  toggleMultiSelect: (source: UIState['selectionSource']) => void;
  toggleSelection: (id: number) => void;
  selectAll: (ids: number[]) => void;
  clearSelection: () => void;
  
  // Equalizer actions
  setEqualizerEnabled: (enabled: boolean) => void;
  setEqualizerPreset: (id: number | null) => void;
  setCustomBands: (bands: number[]) => void;
  setPreamp: (preamp: number) => void;
  setBassBoost: (enabled: boolean) => void;
  setVirtualizer: (enabled: boolean) => void;
  setReverb: (enabled: boolean) => void;
  setDeviceProfile: (profile: EqualizerState['deviceProfile']) => void;
  setPresets: (presets: EqPreset[]) => void;
  setDeviceProfiles: (profiles: DeviceProfile[]) => void;
  
  // Settings actions
  setSettings: (settings: Record<string, unknown>) => void;
  setSetting: (key: string, value: unknown) => void;
  setInitialized: (initialized: boolean) => void;
  resetSettings: () => void;
};

const defaultPlayerState: PlayerState = {
  currentQueueId: null,
  currentQueue: null,
  currentIndex: 0,
  position: 0,
  duration: 0,
  isPlaying: false,
  repeatMode: 'all',
  shuffle: false,
  speed: 1.0,
  pitch: 1.0,
  volume: 1.0,
  isMuted: false,
  sleepTimer: null,
};

const defaultLibraryState: LibraryState = {
  songs: [],
  folders: [],
  albums: [],
  artists: [],
  playlists: [],
  queues: [],
  currentFolderPath: null,
  viewMode: 'linear',
  sortBy: {
    songs: 'title',
    albums: 'name',
    artists: 'name',
    playlists: 'name',
    folders: 'name',
  },
  searchQuery: '',
  isLoading: false,
};

const defaultUIState: UIState = {
  theme: 'system',
  density: 'comfortable',
  animationsEnabled: true,
  bottomNavIndex: 0,
  playerExpanded: false,
  lyricsVisible: false,
  queueVisible: false,
  equalizerVisible: false,
  multiSelectMode: false,
  selectedIds: new Set(),
  selectionSource: null,
};

const defaultEqualizerState: EqualizerState = {
  enabled: true,
  presetId: 1,
  customBands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  preamp: 0,
  bassBoost: false,
  virtualizer: false,
  reverb: false,
  deviceProfile: 'auto',
  presets: [],
  deviceProfiles: [],
};

const defaultSettingsState: SettingsState = {
  settings: {},
  isInitialized: false,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...defaultPlayerState,
      ...defaultLibraryState,
      ...defaultUIState,
      ...defaultEqualizerState,
      ...defaultSettingsState,

      // Player actions
      setCurrentQueue: (queue) => set({ currentQueue: queue, currentQueueId: queue?.id || null, currentIndex: 0 }),
      setCurrentIndex: (index) => set({ currentIndex: index }),
      setPosition: (position) => set({ position }),
      setDuration: (duration) => set({ duration }),
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setRepeatMode: (repeatMode) => set({ repeatMode }),
      setShuffle: (shuffle) => set({ shuffle }),
      setSpeed: (speed) => set({ speed }),
      setPitch: (pitch) => set({ pitch }),
      setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
      setMuted: (isMuted) => set({ isMuted, volume: isMuted ? 0 : get().volume }),
      setSleepTimer: (sleepTimer) => set({ sleepTimer }),
      nextSong: () => {
        const { currentQueue, currentIndex, shuffle, repeatMode } = get();
        if (!currentQueue || currentQueue.songs.length === 0) return;
        let nextIndex = currentIndex + 1;
        if (shuffle) nextIndex = Math.floor(Math.random() * currentQueue.songs.length);
        if (nextIndex >= currentQueue.songs.length) {
          if (repeatMode === 'all') nextIndex = 0;
          else return;
        }
        set({ currentIndex: nextIndex });
      },
      previousSong: () => {
        const { currentQueue, currentIndex, shuffle, repeatMode } = get();
        if (!currentQueue || currentQueue.songs.length === 0) return;
        let prevIndex = currentIndex - 1;
        if (shuffle) prevIndex = Math.floor(Math.random() * currentQueue.songs.length);
        if (prevIndex < 0) {
          if (repeatMode === 'all') prevIndex = currentQueue.songs.length - 1;
          else prevIndex = 0;
        }
        set({ currentIndex: prevIndex });
      },

      // Library actions
      setSongs: (songs) => set({ songs }),
      setFolders: (folders) => set({ folders }),
      setAlbums: (albums) => set({ albums }),
      setArtists: (artists) => set({ artists }),
      setPlaylists: (playlists) => set({ playlists }),
      setQueues: (queues) => set({ queues }),
      addQueue: (queue) => set((state) => ({ queues: [queue, ...state.queues] })),
      updateQueue: (id, data) => set((state) => ({ queues: state.queues.map(q => q.id === id ? { ...q, ...data } : q) })),
      removeQueue: (id) => set((state) => ({ queues: state.queues.filter(q => q.id !== id) })),
      setCurrentFolderPath: (currentFolderPath) => set({ currentFolderPath }),
      setViewMode: (viewMode) => set({ viewMode }),
      setSortBy: (key, value) => set((state) => ({ sortBy: { ...state.sortBy, [key]: value } })),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setLoading: (isLoading) => set({ isLoading }),

      // UI actions
      setTheme: (theme) => set({ theme }),
      setDensity: (density) => set({ density }),
      setAnimationsEnabled: (animationsEnabled) => set({ animationsEnabled }),
      setBottomNavIndex: (bottomNavIndex) => set({ bottomNavIndex }),
      setPlayerExpanded: (playerExpanded) => set({ playerExpanded }),
      setLyricsVisible: (lyricsVisible) => set({ lyricsVisible }),
      setQueueVisible: (queueVisible) => set({ queueVisible }),
      setEqualizerVisible: (equalizerVisible) => set({ equalizerVisible }),
      toggleMultiSelect: (source) => set((state) => ({
        multiSelectMode: !state.multiSelectMode,
        selectionSource: state.multiSelectMode ? null : source,
        selectedIds: state.multiSelectMode ? new Set() : state.selectedIds,
      })),
      toggleSelection: (id) => set((state) => {
        const newSelected = new Set(state.selectedIds);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        return { selectedIds: newSelected };
      }),
      selectAll: (ids) => set({ selectedIds: new Set(ids) }),
      clearSelection: () => set({ selectedIds: new Set(), multiSelectMode: false, selectionSource: null }),

      // Equalizer actions
      setEqualizerEnabled: (enabled) => set({ enabled }),
      setEqualizerPreset: (presetId) => set({ presetId }),
      setCustomBands: (customBands) => set({ customBands }),
      setPreamp: (preamp) => set({ preamp }),
      setBassBoost: (bassBoost) => set({ bassBoost }),
      setVirtualizer: (virtualizer) => set({ virtualizer }),
      setReverb: (reverb) => set({ reverb }),
      setDeviceProfile: (deviceProfile) => set({ deviceProfile }),
      setPresets: (presets) => set({ presets }),
      setDeviceProfiles: (deviceProfiles) => set({ deviceProfiles }),

      // Settings actions
      setSettings: (settings) => set({ settings, isInitialized: true }),
      setSetting: (key, value) => set((state) => ({ settings: { ...state.settings, [key]: value } })),
      setInitialized: (isInitialized) => set({ isInitialized }),
      resetSettings: () => set({ settings: {}, isInitialized: false }),
    }),
    {
      name: 'openplayer-store',
      storage: createJSONStorage(() => MMKVStorage),
      partialize: (state) => ({
        theme: state.theme,
        density: state.density,
        animationsEnabled: state.animationsEnabled,
        repeatMode: state.repeatMode,
        shuffle: state.shuffle,
        speed: state.speed,
        pitch: state.pitch,
        volume: state.volume,
        viewMode: state.viewMode,
        sortBy: state.sortBy,
        enabled: state.enabled,
        presetId: state.presetId,
        customBands: state.customBands,
        preamp: state.preamp,
        bassBoost: state.bassBoost,
        virtualizer: state.virtualizer,
        reverb: state.reverb,
        deviceProfile: state.deviceProfile,
        settings: state.settings,
      }),
    }
  )
);

export const usePlayerStore = () => useAppStore(
  useShallow((state) => ({
    currentQueue: state.currentQueue,
    currentIndex: state.currentIndex,
    position: state.position,
    duration: state.duration,
    isPlaying: state.isPlaying,
    repeatMode: state.repeatMode,
    shuffle: state.shuffle,
    speed: state.speed,
    pitch: state.pitch,
    volume: state.volume,
    isMuted: state.isMuted,
    sleepTimer: state.sleepTimer,
    nextSong: state.nextSong,
    previousSong: state.previousSong,
    setCurrentQueue: state.setCurrentQueue,
    setCurrentIndex: state.setCurrentIndex,
    setPosition: state.setPosition,
    setDuration: state.setDuration,
    setIsPlaying: state.setIsPlaying,
    setRepeatMode: state.setRepeatMode,
    setShuffle: state.setShuffle,
    setSpeed: state.setSpeed,
    setPitch: state.setPitch,
    setVolume: state.setVolume,
    setMuted: state.setMuted,
    setSleepTimer: state.setSleepTimer,
  })),
);

export const useLibraryStore = () => useAppStore(
  useShallow((state) => ({
    songs: state.songs,
    folders: state.folders,
    albums: state.albums,
    artists: state.artists,
    playlists: state.playlists,
    queues: state.queues,
    currentFolderPath: state.currentFolderPath,
    viewMode: state.viewMode,
    sortBy: state.sortBy,
    searchQuery: state.searchQuery,
    isLoading: state.isLoading,
    setSongs: state.setSongs,
    setFolders: state.setFolders,
    setAlbums: state.setAlbums,
    setArtists: state.setArtists,
    setPlaylists: state.setPlaylists,
    setQueues: state.setQueues,
    addQueue: state.addQueue,
    updateQueue: state.updateQueue,
    removeQueue: state.removeQueue,
    setCurrentFolderPath: state.setCurrentFolderPath,
    setViewMode: state.setViewMode,
    setSortBy: state.setSortBy,
    setSearchQuery: state.setSearchQuery,
    setLoading: state.setLoading,
  })),
);

export const useUIStore = () => useAppStore(
  useShallow((state) => ({
    theme: state.theme,
    density: state.density,
    animationsEnabled: state.animationsEnabled,
    bottomNavIndex: state.bottomNavIndex,
    playerExpanded: state.playerExpanded,
    lyricsVisible: state.lyricsVisible,
    queueVisible: state.queueVisible,
    equalizerVisible: state.equalizerVisible,
    multiSelectMode: state.multiSelectMode,
    selectedIds: state.selectedIds,
    selectionSource: state.selectionSource,
    setTheme: state.setTheme,
    setDensity: state.setDensity,
    setAnimationsEnabled: state.setAnimationsEnabled,
    setBottomNavIndex: state.setBottomNavIndex,
    setPlayerExpanded: state.setPlayerExpanded,
    setLyricsVisible: state.setLyricsVisible,
    setQueueVisible: state.setQueueVisible,
    setEqualizerVisible: state.setEqualizerVisible,
    toggleMultiSelect: state.toggleMultiSelect,
    toggleSelection: state.toggleSelection,
    selectAll: state.selectAll,
    clearSelection: state.clearSelection,
  })),
);

export const useEqualizerStore = () => useAppStore(
  useShallow((state) => ({
    enabled: state.enabled,
    presetId: state.presetId,
    customBands: state.customBands,
    preamp: state.preamp,
    bassBoost: state.bassBoost,
    virtualizer: state.virtualizer,
    reverb: state.reverb,
    deviceProfile: state.deviceProfile,
    presets: state.presets,
    deviceProfiles: state.deviceProfiles,
    setEqualizerEnabled: state.setEqualizerEnabled,
    setEqualizerPreset: state.setEqualizerPreset,
    setCustomBands: state.setCustomBands,
    setPreamp: state.setPreamp,
    setBassBoost: state.setBassBoost,
    setVirtualizer: state.setVirtualizer,
    setReverb: state.setReverb,
    setDeviceProfile: state.setDeviceProfile,
    setPresets: state.setPresets,
    setDeviceProfiles: state.setDeviceProfiles,
  })),
);

export const useSettingsStore = () => useAppStore(
  useShallow((state) => ({
    settings: state.settings,
    isInitialized: state.isInitialized,
    setSettings: state.setSettings,
    setSetting: state.setSetting,
    setInitialized: state.setInitialized,
    resetSettings: state.resetSettings,
  })),
);