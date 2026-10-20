import React from 'react';
import { Text, TextProps, View, ViewProps, useColorScheme } from 'react-native';

export interface Colors {
  background: string;
  surface: string;
  text: string;
  subtle: string;
  border: string;
  accent: string;
  danger: string;
}

const light: Colors = {
  background: '#FFFFFF',
  surface: '#F3F4F6',
  text: '#111827',
  subtle: '#6B7280',
  border: '#E5E7EB',
  accent: '#4F46E5',
  danger: '#B91C1C',
};

const dark: Colors = {
  background: '#0B0B14',
  surface: '#1A1A2E',
  text: '#F9FAFB',
  subtle: '#9CA3AF',
  border: '#2B2B45',
  accent: '#818CF8',
  danger: '#F87171',
};

export function useColors(): Colors {
  return useColorScheme() === 'dark' ? dark : light;
}

export function Screen({ style, ...props }: ViewProps) {
  const colors = useColors();
  return <View {...props} style={[{ flex: 1, padding: 16, backgroundColor: colors.background }, style]} />;
}

export function ThemedText({ style, subtle, ...props }: TextProps & { subtle?: boolean }) {
  const colors = useColors();
  return <Text {...props} style={[{ color: subtle ? colors.subtle : colors.text }, style]} />;
}

/** Placeholder used by screens that are not implemented yet. */
export function ComingSoon({ title, note }: { title: string; note: string }) {
  return (
    <Screen style={{ justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText style={{ fontSize: 20, fontWeight: '600', marginBottom: 8 }}>{title}</ThemedText>
      <ThemedText subtle style={{ textAlign: 'center' }}>
        {note}
      </ThemedText>
    </Screen>
  );
}
