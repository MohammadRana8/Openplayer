import React, { ViewStyle, TextStyle } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export interface RadioProps<T = string> {
  value: T;
  selectedValue: T;
  onPress: (value: T) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export function Radio<T = string>({ value, selectedValue, onPress, label, disabled = false, size = 'md', color, style, testID, accessibilityLabel }: RadioProps<T>) {
  const { tokens } = useTheme();
  const isSelected = selectedValue === value;
  const activeColor = color || tokens.colors.brand.primary[600];

  const sizeMap = { sm: { outer: 16, inner: 8 }, md: { outer: 22, inner: 10 }, lg: { outer: 26, inner: 12 } };
  const { outer, inner } = sizeMap[size];

  const styles = StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    outer: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: isSelected ? activeColor : tokens.colors.border.input, justifyContent: 'center', alignItems: 'center' },
    inner: { width: 10, height: 10, borderRadius: 5, backgroundColor: activeColor },
    disabled: { opacity: tokens.opacity.disabled },
    label: { fontSize: tokens.typography.fontSizes.base, color: tokens.colors.text.primary },
  });

  return (
    <Pressable onPress={() => !disabled && onPress(value)} disabled={disabled} style={style} testID={testID} accessibilityRole="radio" accessibilityState={{ checked: selectedValue === value, disabled }} accessibilityLabel={accessibilityLabel} android_ripple={disabled ? undefined : { color: activeColor }}>
      <View style={[styles.outer, { width: 22, height: 22, borderWidth: 2, borderColor: isSelected ? activeColor : tokens.colors.border.input }]}>
        {isSelected && <View style={[styles.inner, { width: 10, height: 10, backgroundColor: activeColor }]} />}
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </Pressable>
  );
}

export interface RadioGroupProps<T = string> {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string; disabled?: boolean }>;
  direction?: 'row' | 'column';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  style?: ViewStyle;
  testID?: string;
}

export function RadioGroup<T = string>({ value, onChange, options, direction = 'column', size = 'md', color, style, testID }: RadioGroupProps<T>) {
  const { tokens } = useTheme();

  const styles = StyleSheet.create({
    container: { flexDirection: direction === 'row' ? 'row' : 'column', gap: direction === 'row' ? 16 : 12 },
  });

  return (
    <View style={[styles.container, style]} testID={testID} role="radiogroup">
      {options.map((option, index) => (
        <Radio
          key={option.value}
          value={option.value}
          selectedValue={value}
          onPress={onChange}
          label={option.label}
          disabled={option.disabled}
          size={size}
          color={color}
          accessibilityLabel={option.label}
        />
      ))}
    </View>
  );
}