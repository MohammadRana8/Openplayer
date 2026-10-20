import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { Screen, ThemedText, useColors } from '@/components/Themed';

export const QueuesScreen = () => {
  const colors = useColors();
  const queues = useAppStore((state) => state.queues);

  return (
    <Screen>
      <FlatList
        data={queues}
        keyExtractor={(queue) => String(queue.id)}
        renderItem={({ item }) => (
          <ThemedText style={[styles.row, { borderBottomColor: colors.border }]}>{item.name}</ThemedText>
        )}
        ListEmptyComponent={
          <ThemedText subtle>No saved queues yet. Multiple queues are planned for a later release.</ThemedText>
        }
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  row: { borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 12 },
});
