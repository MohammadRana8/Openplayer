import React, { ViewStyle, TextStyle, PressableProps } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export interface ChipProps extends Omit<PressableProps, 'children' | 'onPress'> {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'filled' | 'filter';
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export function Chip({ children, variant = 'default', size = 'md', selected = false, disabled = false, leftIcon, rightIcon, onPress, style, testID }: ChipProps) {
  const { tokens } = useTheme();

  const styles = StyleSheet.create({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: tokens.borderRadius.full,
      justifyContent: 'center',
    },
    sm: { paddingHorizontal: 10, paddingVertical: 4, gap: 4 },
    md: { paddingHorizontal: 14, paddingVertical: 6, gap: 6 },
    lg: { paddingHorizontal: 18, paddingVertical: 8, gap: 8 },
    default: { backgroundColor: tokens.colors.surface.tertiary },
    outlined: { backgroundColor: 'transparent', borderWidth: 1, borderColor: tokens.colors.border.primary },
    filled: { backgroundColor: tokens.colors.brand.primary[600] },
    filter: { backgroundColor: tokens.colors.surface.secondary },
    selected: { backgroundColor: tokens.colors.brand.primary[600] },
    disabled: { opacity: tokens.opacity.disabled },
  });

  const textStyles = StyleSheet.create({
    default: { color: tokens.colors.text.primary, fontWeight: '500' },
    outlined: { color: tokens.colors.text.primary, fontWeight: '500' },
    filled: { color: tokens.colors.text.on-accent, fontWeight: '600' },
    filter: { color: tokens.colors.text.primary, fontWeight: '500' },
    selected: { color: tokens.colors.text.on-accent, fontWeight: '600' },
    sm: { fontSize: tokens.typography.fontSizes.xs },
    md: { fontSize: tokens.typography.fontSizes.sm },
    lg: { fontSize: tokens.typography.fontSizes.base },
  });

  const variantKey = variant as keyof typeof styles;
  const sizeKey = size as keyof typeof styles;
  const isSelected = selected && variant === 'filter';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.base,
        styles[sizeKey],
        styles[variantKey],
        isSelected && styles.selected,
        disabled && styles.disabled,
        style,
      ]}
      android_ripple={{ color: tokens.colors.brand.primary[200] }}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected, disabled }}
      testID={testID}
    >
      {leftIcon && <View>{leftIcon}</View>}
      <Text style={[
        textStyles[variantKey],
        textStyles[sizeKey],
        isSelected && textStyles.selected,
        disabled && { color: tokens.colors.text.tertiary },
      ]}>
        {children}
      </Text>
      {rightIcon && <View>{rightIcon}</View>}
    </Pressable>
  );
}

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  style?: ViewStyle;
  testID?: string;
}

export function Badge({ children, variant = 'default', size = 'md', style, testID }: BadgeProps) {
  const { tokens } = useTheme();

  const styles = StyleSheet.create({
    base: { borderRadius: tokens.borderRadius.full, paddingHorizontal: 8, paddingVertical: 2, minWidth: 20, justifyContent: 'center', alignItems: 'center' },
    sm: { paddingHorizontal: 6, paddingVertical: 1, minWidth: 16 },
    md: { paddingHorizontal: 8, paddingVertical: 2, minWidth: 20 },
    default: { backgroundColor: tokens.colors.brand.primary[100] },
    success: { backgroundColor: tokens.colors.feedback.success[100] },
    warning: { backgroundColor: tokens.colors.feedback.warning[100] },
    error: { backgroundColor: tokens.colors.feedback.error[100] },
    info: { backgroundColor: tokens.colors.feedback.info[100] },
  });

  const textStyles = StyleSheet.create({
    default: { color: tokens.colors.brand.primary[700], fontWeight: '600' },
    success: { color: tokens.colors.feedback.success[700], fontWeight: '600' },
    warning: { color: tokens.colors.feedback.warning[700], fontWeight: '600' },
    error: { color: tokens.colors.feedback.error[700], fontWeight: '600' },
    info: { color: tokens.colors.feedback.info[700], fontWeight: '600' },
    sm: { fontSize: tokens.typography.fontSizes.xs },
    md: { fontSize: tokens.typography.fontSizes.sm },
  });

  return (
    <View style={[styles.base, styles[size], styles[variant], style]} testID={testID}>
      <Text style={[textStyles[variant], textStyles[size]]}>{children}</Text>
    </View>
  );
}