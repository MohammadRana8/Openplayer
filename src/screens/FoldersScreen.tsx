import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { useLibrary } from '@/hooks/useServices';
import { Screen, ThemedText, useColors } from '@/components/Themed';

export const FoldersScreen = () => {
  const colors = useColors();
  const folders = useAppStore((state) => state.folders);
  const { scanLibrary, abortScan, isScanning, scanProgress } = useLibrary();
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    setError(null);
    try {
      await scanLibrary();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <Screen>
      <Pressable
        accessibilityRole="button"
        onPress={isScanning ? abortScan : handleScan}
        style={[styles.scanButton, { backgroundColor: colors.accent }]}
      >
        <ThemedText style={styles.scanLabel}>{isScanning ? 'Cancel scan' : 'Scan library'}</ThemedText>
      </Pressable>

      {isScanning ? (
        <View style={styles.progress}>
          <ActivityIndicator />
          <ThemedText subtle>
            {scanProgress?.phase === 'indexing'
              ? 'Saving…'
              : `Found ${scanProgress?.processed ?? 0} of ${scanProgress?.total ?? '…'}`}
          </ThemedText>
        </View>
      ) : null}
      {error ? <ThemedText style={{ color: colors.danger, marginBottom: 8 }}>{error}</ThemedText> : null}

      <FlatList
        data={folders}
        keyExtractor={(folder) => String(folder.id)}
        renderItem={({ item }) => (
          <Link href={{ pathname: '/folder/[id]', params: { id: String(item.id) } }} asChild>
            <Pressable style={[styles.row, { borderBottomColor: colors.border }]}>
              <ThemedText style={styles.rowTitle}>{item.name}</ThemedText>
              <ThemedText subtle>{item.songCount} songs</ThemedText>
            </Pressable>
          </Link>
        )}
        ListEmptyComponent={
          isScanning ? null : (
            <ThemedText subtle>No music yet. Tap “Scan library” and allow access to your audio files.</ThemedText>
          )
        }
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  progress: { alignItems: 'center', flexDirection: 'row', gap: 8, marginBottom: 12 },
  row: { borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 12 },
  rowTitle: { fontSize: 16, fontWeight: '600' },
  scanButton: { alignItems: 'center', borderRadius: 8, marginBottom: 16, paddingVertical: 12 },
  scanLabel: { color: '#FFFFFF', fontWeight: '600' },
});
