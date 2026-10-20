import React, { useRef, ViewStyle, LayoutChangeEvent, PanGestureHandlerGestureEvent } from 'react';
import { View, StyleSheet, PanGestureHandler, Animated, Platform } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  onSlidingComplete?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  showThumb?: boolean;
  trackColor?: string;
  thumbColor?: string;
  bufferValue?: number;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export function Slider({
  value,
  onValueChange,
  onSlidingComplete,
  min = 0,
  max = 1,
  step = 0.01,
  disabled = false,
  showThumb = true,
  trackColor,
  thumbColor,
  bufferValue,
  style,
  testID,
  accessibilityLabel,
}: SliderProps) {
  const { tokens } = useTheme();
  const trackWidth = useRef(0);
  const animatedValue = useRef(new Animated.Value(value)).current;
  const isDragging = useRef(false);

  const clamp = (val: number) => Math.max(min, Math.min(max, val));
  const snapStep = (val: number) => Math.round((val - min) / step) * step + min;

  const handleLayout = (e: LayoutChangeEvent) => {
    trackWidth.current = e.nativeEvent.layout.width;
  };

  const getValueFromX = (x: number) => {
    const ratio = clamp(x / trackWidth.current);
    return snapStep(min + ratio * (max - min));
  };

  const onPanStart = () => {
    if (disabled) return;
    isDragging.current = true;
    animatedValue.setOffset(animatedValue._value);
    animatedValue.setValue(0);
  };

  const onPanMove = (e: PanGestureHandlerGestureEvent) => {
    if (disabled || !isDragging.current) return;
    const newValue = getValueFromX(e.nativeEvent.x);
    animatedValue.setValue(newValue - animatedValue._offset);
    onValueChange(newValue);
  };

  const onPanEnd = () => {
    if (disabled || !isDragging.current) return;
    isDragging.current = false;
    animatedValue.flattenOffset();
    onSlidingComplete?.(animatedValue._value);
  };

  const fillWidth = animatedValue.interpolate({
    inputRange: [min, max],
    outputRange: ['0%', '100%'],
  });

  const bufferWidth = bufferValue !== undefined
    ? animatedValue.interpolate({
        inputRange: [min, max],
        outputRange: ['0%', `${((bufferValue - min) / (max - min)) * 100}%`],
      })
    : '0%';

  const thumbX = animatedValue.interpolate({
    inputRange: [min, max],
    outputRange: [0, trackWidth.current || 1],
  });

  const styles = StyleSheet.create({
    container: { height: 40, justifyContent: 'center' },
    track: { height: 4, borderRadius: 2, overflow: 'hidden' },
    fill: { position: 'absolute', left: 0, top: 0, bottom: 0 },
    buffer: { position: 'absolute', left: 0, top: 0, bottom: 0, opacity: 0.3 },
    thumb: { width: 16, height: 16, borderRadius: 8, position: 'absolute', top: -6 },
    disabled: { opacity: 0.5 },
  });

  return (
    <View style={[styles.container, style]} onLayout={handleLayout} testID={testID} accessibilityRole="slider" accessibilityValue={{ min, max, now: value }} accessibilityLabel={accessibilityLabel}>
      <View style={[{ ...styles.track, backgroundColor: trackColor || tokens.colors.border.primary }]}>
        {bufferValue !== undefined && (
          <Animated.View style={[styles.buffer, { backgroundColor: trackColor || tokens.colors.brand.primary[500] }, { width: bufferWidth }]} />
        )}
        <Animated.View style={[styles.fill, { backgroundColor: thumbColor || tokens.colors.brand.primary[500] }, { width: fillWidth }]} />
      </View>
      {showThumb && !disabled && (
        <PanGestureHandler onGestureEvent={onPanMove} onHandlerStateChange={({ nativeEvent }) => {
          if (nativeEvent.oldState === 2 && nativeEvent.state === 3) onPanEnd();
          if (nativeEvent.state === 1) onPanStart();
        }}>
          <Animated.View
            style={[
              styles.thumb,
              { backgroundColor: thumbColor || tokens.colors.brand.primary[500] },
              { transform: [{ translateX: thumbX }] },
            ]}
          />
        </PanGestureHandler>
      )}
    </View>
  );
}