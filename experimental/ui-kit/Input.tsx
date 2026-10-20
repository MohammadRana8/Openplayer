import React, { forwardRef, TextInputProps, TextStyle, ViewStyle } from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { LucideIcon, lucideIcons } from '@/components/ui/LucideIcon';

export interface InputProps extends Omit<TextInputProps, 'style' | 'onChangeText' | 'value'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  rightIconOnPress?: () => void;
  fullWidth?: boolean;
}

const Input = forwardRef<TextInput, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  rightIconOnPress,
  fullWidth = false,
  disabled,
  style,
  testID,
  accessibilityLabel,
  ...props
}, ref) => {
  const { tokens } = useTheme();

  const styles = StyleSheet.create({
    container: { width: fullWidth ? '100%' : undefined },
    label: {
      fontSize: tokens.typography.fontSizes.sm,
      fontWeight: '500',
      color: tokens.colors.text.primary,
      marginBottom: 6,
    },
    inputWrapper: { flexDirection: 'row', alignItems: 'center' },
    input: {
      flex: 1,
      fontSize: tokens.typography.fontSizes.base,
      color: tokens.colors.text.primary,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: tokens.borderRadius.md,
      borderWidth: 1,
      borderColor: error ? tokens.colors.border.error : tokens.colors.border.input,
      backgroundColor: tokens.colors.surface.primary,
      minHeight: 48,
    },
    inputFocused: { borderColor: tokens.colors.border.focus, borderWidth: 2 },
    inputError: { borderColor: tokens.colors.border.error },
    inputDisabled: { backgroundColor: tokens.colors.surface.secondary, opacity: tokens.opacity.disabled },
    leftIcon: { position: 'absolute', left: 14, zIndex: 1 },
    rightIcon: { position: 'absolute', right: 14, zIndex: 1 },
    paddingLeft: { paddingLeft: 48 },
    paddingRight: { paddingRight: 48 },
    errorText: { color: tokens.colors.feedback.error[600], fontSize: tokens.typography.fontSizes.sm, marginTop: 6 },
    helperText: { color: tokens.colors.text.tertiary, fontSize: tokens.typography.fontSizes.sm, marginTop: 6 },
  });

  return (
    <View style={[styles.container, style]} testID={testID}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrapper}>
        {leftIcon && (
          <LucideIcon name={leftIcon} size={20} color={tokens.colors.icon.tertiary} style={styles.leftIcon} />
        )}
        <TextInput
          ref={ref}
          disabled={disabled}
          style={[
            styles.input,
            leftIcon && styles.paddingLeft,
            rightIcon && styles.paddingRight,
            error && styles.inputError,
            disabled && styles.inputDisabled,
            props.style,
          ]}
          accessibilityLabel={accessibilityLabel}
          testID={testID}
          {...props}
        />
        {rightIcon && (
          <Pressable onPress={rightIconOnPress} accessibilityRole="button" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <LucideIcon name={rightIcon} size={20} color={tokens.colors.icon.secondary} style={styles.rightIcon} />
          </Pressable>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
});

Input.displayName = 'Input';
export { Input };