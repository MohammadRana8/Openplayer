import React, { ViewStyle, ImageStyle, ReactNode } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export interface AvatarProps {
  source?: ImageStyle['source'];
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  shape?: 'circle' | 'square';
  fallbackColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export function Avatar({ source, name, size = 'md', shape = 'circle', fallbackColor, onPress, style, testID }: AvatarProps) {
  const { tokens } = useTheme();

  const sizeValue = typeof size === 'number' ? size : 
    size === 'xs' ? 24 : size === 'sm' ? 32 : size === 'md' ? 40 : size === 'lg' ? 56 : size === 'xl' ? 80 : 40;

  const styles = StyleSheet.create({
    container: {
      width: sizeValue,
      height: sizeValue,
      borderRadius: shape === 'circle' ? sizeValue / 2 : tokens.borderRadius.md,
      overflow: 'hidden',
      backgroundColor: fallbackColor || tokens.colors.brand.primary[100],
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: { width: '100%', height: '100%' },
    initials: { fontSize: sizeValue * 0.4, fontWeight: '600', color: tokens.colors.text.on-accent },
  });

  const Component = onPress ? Pressable : View;

  const initials = name
    ? name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <Component style={[styles.container, style]} onPress={onPress} testID={testID} accessibilityRole={onPress ? 'button' : undefined}>
      {source ? <Image source={source} style={styles.image} resizeMode="cover" /> : <Text style={styles.initials}>{initials}</Text>}
    </Component>
  );
}