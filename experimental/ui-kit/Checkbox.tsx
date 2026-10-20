import React, { forwardRef, ViewStyle } from 'react';
import { View, Pressable, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export interface CheckboxProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  indeterminate?: boolean;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

const Checkbox = forwardRef<View, CheckboxProps>(({
  value,
  onValueChange,
  disabled = false,
  size = 'md',
  color,
  indeterminate = false,
  style,
  testID,
  accessibilityLabel,
}, ref) => {
  const { tokens } = useTheme();
  const scale = useRef(new Animated.Value(value || indeterminate ? 1 : 0)).current;

  const sizeMap = { sm: 18, md: 22, lg: 26 };
  const boxSize = sizeMap[size];

  React.useEffect(() => {
    Animated.timing(scale, {
      toValue: value || indeterminate ? 1 : 0,
      duration: 150,
      easing: Easing.out(Easing.back(1.5)),
      useNativeDriver: false,
    }).start();
  }, [value, indeterminate]);

  const checkColor = color || tokens.colors.brand.primary[600];
  const borderColor = value || indeterminate ? checkColor : tokens.colors.border.input;
  const bgColor = value || indeterminate ? `${checkColor}15` : 'transparent';

  return (
    <Pressable ref={ref} onPress={() => !disabled && onValueChange(!value)} disabled={disabled} style={[styles.container, { width: boxSize, height: boxSize }, style]} testID={testID} accessibilityRole="checkbox" accessibilityState={{ checked: value, disabled, indeterminate }} accessibilityLabel={accessibilityLabel} android_ripple={disabled ? undefined : { color: checkColor }}>
      <Animated.View style={[styles.box, { width: boxSize, height: boxSize, borderWidth: 2, borderColor, backgroundColor: bgColor, borderRadius: 4 }]}>
        <Animated.View style={[styles.check, { transform: [{ scale }] }]}>
          {indeterminate ? <View style={styles.indeterminate} /> : <Text style={styles.checkText}>✓</Text>}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
});

Checkbox.displayName = 'Checkbox';
export { Checkbox };

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center' },
  box: { justifyContent: 'center', alignItems: 'center' },
  check: { justifyContent: 'center', alignItems: 'center' },
  checkText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', lineHeight: 14 },
  indeterminate: { width: 10, height: 2, backgroundColor: '#FFFFFF', borderRadius: 1 },
});