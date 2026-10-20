import React, { ViewStyle, TextStyle, ImageStyle, ReactNode } from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export interface CardProps {
  children: ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export function Card({ children, variant = 'elevated', padding = 'md', onPress, style, testID }: CardProps) {
  const { tokens } = useTheme();

  const styles = StyleSheet.create({
    base: { borderRadius: tokens.borderRadius.lg },
    elevated: {
      backgroundColor: tokens.colors.surface.raised,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    outlined: {
      backgroundColor: tokens.colors.surface.primary,
      borderWidth: 1,
      borderColor: tokens.colors.border.primary,
    },
    filled: { backgroundColor: tokens.colors.surface.secondary },
    none: { padding: 0 },
    sm: { padding: tokens.spacing[2] },
    md: { padding: tokens.spacing[4] },
    lg: { padding: tokens.spacing[6] },
    interactive: {},
  });

  const Component = onPress ? Pressable : View;

  return (
    <Component
      onPress={onPress}
      style={[
        styles.base,
        styles[variant],
        styles[padding],
        onPress && styles.interactive,
        style,
      ]}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      testID={testID}
    >
      {children}
    </Component>
  );
}

export interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  style?: ViewStyle;
}

export function CardHeader({ title, subtitle, action, style }: CardHeaderProps) {
  const { tokens } = useTheme();
  const styles = StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    title: { fontSize: tokens.typography.fontSizes.lg, fontWeight: '600', color: tokens.colors.text.primary },
    subtitle: { fontSize: tokens.typography.fontSizes.sm, color: tokens.colors.text.secondary, marginTop: 2 },
  });
  return (
    <View style={[styles.container, style]}>
      <View>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {action}
    </View>
  );
}

export interface CardContentProps {
  children: ReactNode;
  style?: ViewStyle;
}

export function CardContent({ children, style }: CardContentProps) {
  return <View style={style}>{children}</View>;
}

export interface CardActionsProps {
  children: ReactNode;
  align?: 'start' | 'center' | 'end' | 'space-between';
  style?: ViewStyle;
}

export function CardActions({ children, align = 'end', style }: CardActionsProps) {
  const { tokens } = useTheme();
  const styles = StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: tokens.spacing[3] },
    start: { justifyContent: 'flex-start' },
    center: { justifyContent: 'center' },
    end: { justifyContent: 'flex-end' },
    spaceBetween: { justifyContent: 'space-between' },
  });
  return <View style={[styles.container, styles[align], style]}>{children}</View>;
}