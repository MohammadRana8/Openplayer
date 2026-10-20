import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { databaseService } from '@/services/DatabaseService';
import { playbackService } from '@/services/PlaybackService';
import type { Song } from '@/db/schema';
import { Screen, ThemedText, useColors } from '@/components/Themed';

export const FolderDetailScreen = ({ folderId }: { folderId: number }) => {
  const colors = useColors();
  const router = useRouter();
  const folder = useAppStore((state) => state.folders.find((f) => f.id === folderId));
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    if (!folder) return;
    let cancelled = false;
    databaseService
      .getSongs({ folderPath: folder.path, sortBy: 'title', sortOrder: 'asc' })
      .then((rows) => {
        // The query also matches sub-folders; keep only files directly inside this folder.
        const direct = rows.filter((s) => s.path.substring(0, s.path.lastIndexOf('/')) === folder.path);
        if (!cancelled) setSongs(direct);
      })
      .catch((error) => console.warn('Failed to load folder songs:', error));
    return () => {
      cancelled = true;
    };
  }, [folder]);

  const play = async (index: number) => {
    await playbackService.loadQueue(null, songs, index);
    router.push('/player');
  };

  if (!folder) {
    return (
      <Screen>
        <ThemedText subtle>This folder no longer exists. Rescan your library.</ThemedText>
      </Screen>
    );
  }

  return (
    <Screen>
      <ThemedText style={styles.heading}>{folder.name}</ThemedText>
      <FlatList
        data={songs}
        keyExtractor={(song) => String(song.id)}
        renderItem={({ item, index }) => (
          <Pressable onPress={() => play(index)} style={[styles.row, { borderBottomColor: colors.border }]}>
            <ThemedText numberOfLines={1}>{item.title ?? item.displayName}</ThemedText>
            {item.artist ? <ThemedText subtle numberOfLines={1}>{item.artist}</ThemedText> : null}
          </Pressable>
        )}
        ListEmptyComponent={<ThemedText subtle>No songs in this folder.</ThemedText>}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  heading: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  row: { borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 12 },
});
