import { Audio, type AVPlaybackStatus } from 'expo-av';
import { databaseService } from '@/services/DatabaseService';
import type { Song } from '@/db/schema';

export type RepeatMode = 'off' | 'one' | 'all';

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
  repeatMode: RepeatMode;
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

type PlaybackListener = (state: PlaybackState) => void;

/** How often (ms) the queue resume position is persisted while playing. */
const POSITION_SAVE_INTERVAL_MS = 5000;

const REPEAT_MODES: readonly RepeatMode[] = ['off', 'one', 'all'];

class PlaybackService {
  private static instance: PlaybackService;
  private player: Audio.Sound | null = null;
  private state: PlaybackState = {
    isPlaying: false,
    position: 0,
    duration: 0,
    bufferedPosition: 0,
    speed: 1.0,
    pitch: 1.0,
    volume: 1.0,
    isMuted: false,
    currentSong: null,
    currentQueueId: null,
    currentIndex: 0,
    repeatMode: 'all',
    shuffle: false,
    error: null,
  };
  private listeners: Set<PlaybackListener> = new Set();
  private currentQueueSongs: Song[] = [];
  private eqSettings: EqualizerSettings = {
    enabled: true,
    bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    preamp: 0,
    bassBoost: false,
    virtualizer: false,
    reverb: false,
    presetId: 1,
  };

  /** Incremented every time a new sound is loaded; stale callbacks compare against it. */
  private loadToken = 0;
  /** Indices already played in the current shuffle cycle (excluding the current one). */
  private shuffleHistory: number[] = [];
  private shuffleBag: number[] = [];
  private sleepTimer: SleepTimerConfig | null = null;
  private sleepTimeout: ReturnType<typeof setTimeout> | null = null;
  private lastPositionSave = 0;
  private previousBehavior: string | null = null;

  static getInstance(): PlaybackService {
    if (!PlaybackService.instance) {
      PlaybackService.instance = new PlaybackService();
    }
    return PlaybackService.instance;
  }

  async initialize(): Promise<void> {
    await Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    const savedSpeed = await databaseService.getSetting<number>('player_speed');
    const savedPitch = await databaseService.getSetting<number>('player_pitch');
    const savedRepeat = await databaseService.getSetting<string>('player_repeat_mode');
    const savedShuffle = await databaseService.getSetting<boolean>('player_shuffle');
    const savedPrev = await databaseService.getSetting<string>('player_prev_behavior');
    const savedEq = await databaseService.getSetting<EqualizerSettings>('equalizer_settings');

    this.state.speed = savedSpeed ?? 1.0;
    this.state.pitch = savedPitch ?? 1.0;
    this.state.repeatMode = REPEAT_MODES.includes(savedRepeat as RepeatMode)
      ? (savedRepeat as RepeatMode)
      : 'all';
    this.state.shuffle = savedShuffle ?? false;
    this.previousBehavior = savedPrev;

    if (savedEq) {
      this.eqSettings = { ...this.eqSettings, ...savedEq };
    }
    this.notify();
  }

  subscribe(listener: PlaybackListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const snapshot = this.state;
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }

  private updateState(partial: Partial<PlaybackState>): void {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  // ---------------------------------------------------------------- queue

  async loadQueue(queueId: number | null, songs: Song[], startIndex = 0): Promise<void> {
    if (songs.length === 0) return;
    await this.persistQueuePosition(); // save where the previous queue stopped
    this.currentQueueSongs = songs;
    this.shuffleHistory = [];
    this.shuffleBag = [];
    const index = Math.min(Math.max(startIndex, 0), songs.length - 1);
    this.state = { ...this.state, currentQueueId: queueId };
    await this.playIndex(index, 0, false);
  }

  /**
   * Plays a song. If it is part of the loaded queue the queue is kept,
   * otherwise it is played on its own.
   */
  async playSong(song: Song): Promise<void> {
    const index = this.currentQueueSongs.findIndex((s) => s.id === song.id);
    if (index >= 0) {
      await this.playIndex(index);
      return;
    }
    await this.persistQueuePosition();
    this.currentQueueSongs = [song];
    this.state = { ...this.state, currentQueueId: null };
    this.shuffleHistory = [];
    this.shuffleBag = [];
    await this.playIndex(0, 0, false);
  }

  /**
   * Loads and starts the song at `index`. If a song cannot be played the next
   * ones are tried, giving up after one full pass over the queue.
   */
  private async playIndex(index: number, failures = 0, persistPrevious = true): Promise<void> {
    const song = this.currentQueueSongs[index];
    if (!song) return;

    if (persistPrevious) await this.persistQueuePosition();
    const token = ++this.loadToken;
    this.updateState({ error: null, currentSong: song, currentIndex: index, position: 0, duration: 0 });

    try {
      await this.unloadCurrent();

      const { sound } = await Audio.Sound.createAsync(
        { uri: song.mediaStoreUri || song.path },
        {
          shouldPlay: true,
          rate: this.state.speed,
          shouldCorrectPitch: true,
          volume: this.state.volume,
          isMuted: this.state.isMuted,
        },
        (status) => this.onPlaybackStatusUpdate(token, status),
      );

      if (token !== this.loadToken) {
        // A newer request superseded this one while the file was loading.
        await sound.unloadAsync().catch(() => undefined);
        return;
      }
      this.player = sound;
      await databaseService.incrementPlayCount(song.id);
    } catch (error) {
      if (token !== this.loadToken) return;
      console.error('Playback error:', error);
      this.updateState({ error: `Could not play "${song.title ?? song.displayName}"`, isPlaying: false });

      if (failures + 1 >= this.currentQueueSongs.length) return; // nothing playable
      const next = this.resolveNextIndex(false);
      if (next !== null) await this.playIndex(next, failures + 1);
    }
  }

  private async unloadCurrent(): Promise<void> {
    const sound = this.player;
    this.player = null;
    if (sound) {
      try {
        sound.setOnPlaybackStatusUpdate(null);
        await sound.unloadAsync();
      } catch {
        // already unloaded
      }
    }
  }

  private onPlaybackStatusUpdate(token: number, status: AVPlaybackStatus): void {
    if (token !== this.loadToken) return; // callback from a replaced sound

    if (!status.isLoaded) {
      if (status.error) this.updateState({ error: status.error, isPlaying: false });
      return;
    }

    this.updateState({
      isPlaying: status.isPlaying,
      position: status.positionMillis ?? 0,
      duration: status.durationMillis ?? 0,
      bufferedPosition: status.playableDurationMillis ?? 0,
    });

    const now = Date.now();
    if (status.isPlaying && now - this.lastPositionSave >= POSITION_SAVE_INTERVAL_MS) {
      this.lastPositionSave = now;
      void this.persistQueuePosition();
    }

    if (status.didJustFinish && !status.isLooping) {
      void this.handlePlaybackFinish();
    }
  }

  private async handlePlaybackFinish(): Promise<void> {
    if (this.consumeSleepTimerSong()) {
      this.updateState({ isPlaying: false, position: 0 });
      return;
    }

    if (this.state.repeatMode === 'one') {
      await this.player?.replayAsync();
      return;
    }

    const next = this.resolveNextIndex(true);
    if (next === null) {
      this.updateState({ isPlaying: false, position: 0 });
      await this.persistQueuePosition();
      return;
    }
    await this.playIndex(next);
  }

  /**
   * Picks the index to play after the current one, or `null` if the queue is over.
   * `auto` is true when the song ended on its own (as opposed to a user "next").
   */
  private resolveNextIndex(auto: boolean): number | null {
    const total = this.currentQueueSongs.length;
    if (total === 0) return null;
    const current = this.state.currentIndex;

    if (this.state.shuffle && total > 1) {
      if (this.shuffleBag.length === 0) {
        // Start a new cycle: every song except the current one, in random order.
        if (auto && this.state.repeatMode === 'off' && this.shuffleHistory.length >= total - 1) {
          return null;
        }
        this.shuffleBag = this.shuffledIndices(total, current);
        this.shuffleHistory = [];
      }
      this.shuffleHistory.push(current);
      return this.shuffleBag.pop() ?? null;
    }

    const next = current + 1;
    if (next < total) return next;
    if (this.state.repeatMode === 'all') return 0;
    return auto ? null : current; // manual "next" on the last song just stays put
  }

  private shuffledIndices(total: number, exclude: number): number[] {
    const indices = Array.from({ length: total }, (_, i) => i).filter((i) => i !== exclude);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }

  // ------------------------------------------------------------- transport

  async play(): Promise<void> {
    if (this.player && !this.state.isPlaying) {
      await this.player.playAsync();
    }
  }

  async pause(): Promise<void> {
    if (this.player && this.state.isPlaying) {
      await this.player.pauseAsync();
      await this.persistQueuePosition();
    }
  }

  async resume(): Promise<void> {
    await this.play();
  }

  async seekTo(positionMs: number): Promise<void> {
    if (!this.player) return;
    const clamped = Math.max(0, Math.min(positionMs, this.state.duration || positionMs));
    await this.player.setPositionAsync(clamped);
    this.updateState({ position: clamped });
  }

  async playNext(): Promise<void> {
    const next = this.resolveNextIndex(false);
    if (next === null) return;
    await this.playIndex(next);
  }

  async playPrevious(): Promise<void> {
    if (this.currentQueueSongs.length === 0) return;

    if (this.previousBehavior === 'restart' && this.state.position > 3000) {
      await this.seekTo(0);
      return;
    }

    if (this.state.shuffle) {
      const previous = this.shuffleHistory.pop();
      if (previous !== undefined) {
        // Put the current song back so "next" returns to it.
        this.shuffleBag.push(this.state.currentIndex);
        await this.playIndex(previous);
        return;
      }
      await this.seekTo(0);
      return;
    }

    let prevIndex = this.state.currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = this.state.repeatMode === 'all' ? this.currentQueueSongs.length - 1 : 0;
    }
    await this.playIndex(prevIndex);
  }

  // -------------------------------------------------------------- settings

  async setPreviousBehavior(behavior: 'restart' | 'previous'): Promise<void> {
    this.previousBehavior = behavior;
    await databaseService.setSetting('player_prev_behavior', behavior);
  }

  async setSpeed(speed: number): Promise<void> {
    const clamped = Math.max(0.5, Math.min(2.0, speed));
    this.state.speed = clamped;
    if (this.player) {
      await this.player.setRateAsync(clamped, true);
    }
    await databaseService.setSetting('player_speed', clamped);
    this.updateState({ speed: clamped });
  }

  /**
   * Pitch is stored but not yet applied: expo-av cannot shift pitch independently of speed.
   * It needs a native audio processor (see README → Roadmap).
   */
  async setPitch(pitch: number): Promise<void> {
    const clamped = Math.max(0.5, Math.min(2.0, pitch));
    await databaseService.setSetting('player_pitch', clamped);
    this.updateState({ pitch: clamped });
  }

  async setVolume(volume: number): Promise<void> {
    const clamped = Math.max(0, Math.min(1, volume));
    if (this.player) {
      await this.player.setVolumeAsync(clamped);
    }
    this.updateState({ volume: clamped });
  }

  async setMuted(muted: boolean): Promise<void> {
    if (this.player) {
      await this.player.setIsMutedAsync(muted);
    }
    this.updateState({ isMuted: muted });
  }

  async setRepeatMode(mode: RepeatMode): Promise<void> {
    await databaseService.setSetting('player_repeat_mode', mode);
    this.updateState({ repeatMode: mode });
  }

  async setShuffle(shuffle: boolean): Promise<void> {
    this.shuffleBag = [];
    this.shuffleHistory = [];
    await databaseService.setSetting('player_shuffle', shuffle);
    this.updateState({ shuffle });
  }

  /**
   * Equalizer settings are persisted but not yet applied to the audio output;
   * this needs a native ExoPlayer/AudioEffect module (see README → Roadmap).
   */
  async applyEqualizer(settings: Partial<EqualizerSettings>): Promise<void> {
    this.eqSettings = { ...this.eqSettings, ...settings };
    await databaseService.setSetting('equalizer_settings', this.eqSettings);
    this.notify();
  }

  getEqualizerSettings(): EqualizerSettings {
    return { ...this.eqSettings };
  }

  // ----------------------------------------------------------- sleep timer

  async setSleepTimer(timer: SleepTimerConfig | null): Promise<void> {
    if (this.sleepTimeout) {
      clearTimeout(this.sleepTimeout);
      this.sleepTimeout = null;
    }
    this.sleepTimer = timer && timer.enabled ? { ...timer } : null;

    if (this.sleepTimer?.type === 'time') {
      const remaining = Math.max(0, this.sleepTimer.endTime - Date.now());
      this.sleepTimeout = setTimeout(() => {
        this.sleepTimer = null;
        this.sleepTimeout = null;
        void this.pause();
      }, remaining);
    }
  }

  /** Returns true when the "stop after N songs" timer says playback must stop now. */
  private consumeSleepTimerSong(): boolean {
    if (!this.sleepTimer || this.sleepTimer.type !== 'songs') return false;
    this.sleepTimer.songsRemaining -= 1;
    if (this.sleepTimer.songsRemaining <= 0) {
      this.sleepTimer = null;
      return true;
    }
    return false;
  }

  // --------------------------------------------------------------- helpers

  private async persistQueuePosition(): Promise<void> {
    const { currentQueueId, currentIndex, position } = this.state;
    if (currentQueueId === null) return;
    try {
      await databaseService.updateQueue(currentQueueId, {
        currentIndex,
        currentPositionMs: Math.max(0, Math.round(position)),
      });
    } catch (error) {
      console.warn('Failed to save queue position:', error);
    }
  }

  getState(): PlaybackState {
    return { ...this.state };
  }

  getCurrentQueue(): Song[] {
    return [...this.currentQueueSongs];
  }

  getCurrentSong(): Song | null {
    return this.state.currentSong;
  }

  async cleanup(): Promise<void> {
    this.loadToken++;
    await this.setSleepTimer(null);
    await this.persistQueuePosition();
    await this.unloadCurrent();
    this.currentQueueSongs = [];
    this.updateState({
      isPlaying: false,
      position: 0,
      duration: 0,
      currentSong: null,
      currentQueueId: null,
      currentIndex: 0,
    });
  }
}

export const playbackService = PlaybackService.getInstance();
export default playbackService;
