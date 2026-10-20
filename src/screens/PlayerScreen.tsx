import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { usePlayback } from '@/hooks/useServices';
import { Screen, ThemedText, useColors } from '@/components/Themed';

function formatTime(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

const REPEAT_LABEL = { off: 'Repeat: off', one: 'Repeat: one', all: 'Repeat: all' } as const;

export const PlayerScreen = () => {
  const colors = useColors();
  const { state, togglePlayPause, playNext, playPrevious, toggleRepeat, toggleShuffle } = usePlayback();
  const song = state.currentSong;
  const progress = state.duration > 0 ? Math.min(1, state.position / state.duration) : 0;

  const button = (label: string, onPress: () => void, primary = false) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.button, { backgroundColor: primary ? colors.accent : colors.surface }]}
    >
      <ThemedText style={{ color: primary ? '#FFFFFF' : colors.text, fontWeight: '600' }}>{label}</ThemedText>
    </Pressable>
  );

  return (
    <Screen style={styles.container}>
      <ThemedText style={styles.title} numberOfLines={2}>
        {song ? song.title ?? song.displayName : 'Nothing playing'}
      </ThemedText>
      <ThemedText subtle>{song?.artist ?? (song ? '' : 'Pick a song from Folders')}</ThemedText>

      <View style={[styles.track, { backgroundColor: colors.surface }]}>
        <View style={[styles.trackFill, { backgroundColor: colors.accent, width: `${progress * 100}%` }]} />
      </View>
      <View style={styles.times}>
        <ThemedText subtle>{formatTime(state.position)}</ThemedText>
        <ThemedText subtle>{formatTime(state.duration)}</ThemedText>
      </View>

      <View style={styles.controls}>
        {button('Previous', playPrevious)}
        {button(state.isPlaying ? 'Pause' : 'Play', togglePlayPause, true)}
        {button('Next', playNext)}
      </View>
      <View style={styles.controls}>
        {button(REPEAT_LABEL[state.repeatMode], toggleRepeat)}
        {button(state.shuffle ? 'Shuffle: on' : 'Shuffle: off', toggleShuffle)}
      </View>

      {state.error ? <ThemedText style={{ color: colors.danger, marginTop: 16 }}>{state.error}</ThemedText> : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  button: { borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12 },
  container: { alignItems: 'center', justifyContent: 'center' },
  controls: { flexDirection: 'row', gap: 12, marginTop: 20 },
  times: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, width: '100%' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 4, textAlign: 'center' },
  track: { borderRadius: 3, height: 6, marginTop: 28, overflow: 'hidden', width: '100%' },
  trackFill: { height: 6 },
});
