import React, { forwardRef, ViewStyle } from 'react';
import { View, Pressable, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  trackColor?: { true: string; false: string };
  thumbColor?: string;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

const Switch = forwardRef<View, SwitchProps>(({
  value,
  onValueChange,
  disabled = false,
  size = 'md',
  trackColor,
  thumbColor,
  style,
  testID,
  accessibilityLabel,
}, ref) => {
  const { tokens } = useTheme();
  const translateX = useRef(new Animated.Value(value ? 1 : 0)).current;

  const sizeMap = { sm: { trackWidth: 36, trackHeight: 20, thumbSize: 16, padding: 2 }, md: { trackWidth: 44, trackHeight: 24, thumbSize: 20, padding: 2 }, lg: { trackWidth: 52, trackHeight: 28, thumbSize: 24, padding: 2 } };
  const { trackWidth, trackHeight, thumbSize, padding } = sizeMap[size];

  const animate = () => {
    Animated.timing(translateX, {
      toValue: value ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  React.useEffect(() => { animate(); }, [value]);

  const trackBg = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [trackColor?.false || tokens.colors.border.input, trackColor?.true || tokens.colors.brand.primary[600]],
  });

  const thumbX = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [padding, trackWidth - thumbSize - padding],
  });

  const styles = StyleSheet.create({
    container: { width: trackWidth, height: trackHeight, borderRadius: trackHeight / 2, justifyContent: 'center', paddingHorizontal: padding },
    thumb: { width: thumbSize, height: thumbSize, borderRadius: thumbSize / 2, backgroundColor: thumbColor || '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
    disabled: { opacity: tokens.opacity.disabled },
  });

  return (
    <Pressable ref={ref} onPress={() => !disabled && onValueChange(!value)} disabled={disabled} style={style} testID={testID} accessibilityRole="switch" accessibilityState={{ checked: value, disabled }} accessibilityLabel={accessibilityLabel}>
      <Animated.View style={[styles.container, { backgroundColor: trackBg, width: trackWidth, height: trackHeight, borderRadius: trackHeight / 2, overflow: 'hidden' }]}>
        <Animated.View style={[styles.thumb, { width: thumbSize, height: thumbSize, borderRadius: thumbSize / 2, transform: [{ translateX }] }]} />
      </Animated.View>
    </Pressable>
  );
});

Switch.displayName = 'Switch';
export { Switch };