import React, { forwardRef, ViewStyle, TextStyle, ImageStyle } from 'react';
import { View, Image, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export interface ListItemProps {
  title: string;
  subtitle?: string;
  description?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  leftAvatar?: { source?: ImageStyle['source']; name?: string; size?: 'sm' | 'md' | 'lg' };
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  selected?: boolean;
  showDivider?: boolean;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

const ListItem = forwardRef<Pressable, ListItemProps>(({
  title,
  subtitle,
  description,
  leftElement,
  rightElement,
  leftAvatar,
  onPress,
  onLongPress,
  disabled = false,
  selected = false,
  showDivider = true,
  style,
  testID,
  accessibilityLabel,
}, ref) => {
  const { tokens } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: tokens.spacing[4],
      paddingVertical: tokens.spacing[3],
      backgroundColor: selected ? tokens.colors.brand.primary[50] : tokens.colors.surface.primary,
      borderBottomWidth: showDivider ? StyleSheet.hairlineWidth : 0,
      borderBottomColor: tokens.colors.border.primary,
    },
    left: { marginRight: tokens.spacing[3] },
    content: { flex: 1, minWidth: 0 },
    right: { marginLeft: tokens.spacing[3] },
    title: { fontSize: tokens.typography.fontSizes.base, fontWeight: '500', color: tokens.colors.text.primary },
    subtitle: { fontSize: tokens.typography.fontSizes.sm, color: tokens.colors.text.secondary, marginTop: 2 },
    description: { fontSize: tokens.typography.fontSizes.sm, color: tokens.colors.text.tertiary, marginTop: 2 },
    disabled: { opacity: tokens.opacity.disabled },
    pressed: { backgroundColor: tokens.colors.surface.tertiary },
  });

  const handlePressIn = () => {};
  const handlePressOut = () => {};

  return (
    <Pressable
      ref={ref}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[{ ...styles.container, ...(onPress ? { backgroundColor: tokens.colors.surface.tertiary } : {}) }, style]}
      android_ripple={onPress ? { color: tokens.colors.brand.primary[200] } : undefined}
      accessibilityRole={onPress ? 'button' : 'listitem'}
      accessibilityState={{ disabled, selected }}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {(leftAvatar || leftElement) && <View style={styles.left}>{leftAvatar || leftElement}</View>}
      <View style={styles.content}>
        <Text style={[styles.title, disabled && styles.disabled]} numberOfLines={1} ellipsizeMode="tail">{title}</Text>
        {subtitle && <Text style={[styles.subtitle, disabled && styles.disabled]} numberOfLines={1} ellipsizeMode="tail">{subtitle}</Text>}
        {description && <Text style={[styles.subtitle, disabled && styles.disabled]} numberOfLines={1} ellipsizeMode="tail">{description}</Text>}
      </View>
      {rightElement && <View style={styles.right}>{rightElement}</View>}
      {showDivider && <View style={{ position: 'absolute', bottom: 0, left: leftAvatar || leftElement ? 60 : 16, right: 16, height: StyleSheet.hairlineWidth, backgroundColor: tokens.colors.border.primary }} />}
    </Pressable>
  );
});

ListItem.displayName = 'ListItem';
export { ListItem };