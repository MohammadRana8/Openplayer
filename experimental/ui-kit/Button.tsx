import React, { forwardRef, PressableProps, TextStyle, ViewStyle } from 'react';
import { Pressable, Text, View, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { LucideIcon, lucideIcons } from '@/components/ui/LucideIcon';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'onPress'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children: React.ReactNode;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  loading?: boolean;
  fullWidth?: boolean;
  onPress?: () => void;
}

const Button = forwardRef<Pressable, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  children,
  leftIcon,
  rightIcon,
  loading = false,
  fullWidth = false,
  disabled,
  onPress,
  style,
  testID,
  accessibilityLabel,
  ...props
}, ref) => {
  const { tokens, density } = useTheme();
  const isCompact = density === 'compact';
  
  const baseStyles = StyleSheet.create({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: tokens.borderRadius.md,
      flex: fullWidth ? 1 : 0,
    },
    sm: { paddingHorizontal: 12, paddingVertical: 6, minHeight: 32 },
    md: { paddingHorizontal: 16, paddingVertical: 10, minHeight: 40 },
    lg: { paddingHorizontal: 24, paddingVertical: 14, minHeight: 48 },
    icon: { padding: 10, minWidth: 40, minHeight: 40 },
    primary: { backgroundColor: tokens.colors.brand.primary[600] },
    secondary: { backgroundColor: tokens.colors.surface.tertiary },
    ghost: { backgroundColor: 'transparent' },
    danger: { backgroundColor: tokens.colors.feedback.error[500] },
    outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: tokens.colors.border.primary },
    disabled: { opacity: tokens.opacity.disabled },
    loading: { opacity: 0.8 },
  });

  const textStyles = StyleSheet.create({
    primary: { color: tokens.colors.text.on-accent, fontWeight: '600' },
    secondary: { color: tokens.colors.text.primary, fontWeight: '600' },
    ghost: { color: tokens.colors.text.link, fontWeight: '600' },
    danger: { color: tokens.colors.text.on-accent, fontWeight: '600' },
    outline: { color: tokens.colors.text.link, fontWeight: '600' },
    disabled: { color: tokens.colors.text.tertiary },
    sm: { fontSize: tokens.typography.fontSizes.sm },
    md: { fontSize: tokens.typography.fontSizes.base },
    lg: { fontSize: tokens.typography.fontSizes.lg },
  });

  const iconSize = size === 'sm' ? 16 : size === 'md' ? 20 : size === 'lg' ? 24 : 20;

  const variantKey = variant as keyof typeof baseStyles;
  const sizeKey = size as keyof typeof baseStyles;

  const isDisabled = disabled || loading;

  return (
    <Pressable
      ref={ref}
      disabled={isDisabled}
      onPress={onPress}
      style={[
        baseStyles.base,
        baseStyles[sizeKey],
        baseStyles[variantKey],
        isDisabled && baseStyles.disabled,
        loading && baseStyles.loading,
        style,
      ]}
      android_ripple={variant !== 'ghost' ? { color: tokens.colors.brand.primary[200] } : undefined}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? tokens.colors.text.on-accent : tokens.colors.text.primary}
          style={{ marginRight: leftIcon || rightIcon ? 8 : 0 }}
        />
      ) : (
        <>
          {leftIcon && <LucideIcon name={leftIcon} size={iconSize} color={variant === 'primary' || variant === 'danger' ? tokens.colors.text.on-accent : tokens.colors.text.link} style={{ marginRight: 8 }} />}
          <Text
            style={[
              textStyles[variantKey],
              textStyles[sizeKey],
              isDisabled && textStyles.disabled,
            ]}
          >
            {children}
          </Text>
          {rightIcon && <LucideIcon name={rightIcon} size={iconSize} color={variant === 'primary' || variant === 'danger' ? tokens.colors.text.on-accent : tokens.colors.text.link} style={{ marginLeft: 8 }} />}
        </>
      )}
    </Pressable>
  );
});

Button.displayName = 'Button';
export { Button };