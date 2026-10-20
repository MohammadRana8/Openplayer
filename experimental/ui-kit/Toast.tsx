import React, { useEffect, useRef, ViewStyle, TextStyle } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
  action?: { label: string; onPress: () => void };
  style?: ViewStyle;
  testID?: string;
}

export function Toast({ message, type = 'default', duration = 3000, onClose, action, style, testID }: ToastProps) {
  const { tokens } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;

  const typeStyles = {
    default: { bg: tokens.colors.surface.raised, border: tokens.colors.border.primary, icon: 'ℹ️', text: tokens.colors.text.primary },
    success: { bg: tokens.colors.feedback.success[50], border: tokens.colors.feedback.success[500], icon: '✓', text: tokens.colors.feedback.success[700] },
    error: { bg: tokens.colors.feedback.error[50], border: tokens.colors.feedback.error[500], icon: '✕', text: tokens.colors.feedback.error[700] },
    warning: { bg: tokens.colors.feedback.warning[50], border: tokens.colors.feedback.warning[500], icon: '⚠', text: tokens.colors.feedback.warning[700] },
    info: { bg: tokens.colors.feedback.info[50], border: tokens.colors.feedback.info[500], icon: 'ℹ', text: tokens.colors.feedback.info[700] },
  };

  const { bg, border, icon, text: textColor } = typeStyles[type];

  const styles = StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: border, backgroundColor: bg, minWidth: 280, maxWidth: '90%', gap: 12 },
    icon: { fontSize: 18, fontWeight: 'bold', color: textColor },
    message: { flex: 1, fontSize: 14, color: textColor, lineHeight: 20 },
    action: { marginLeft: 8 },
    actionText: { fontSize: 14, fontWeight: '600', color: tokens.colors.brand.primary[600] },
    close: { padding: 4 },
    closeText: { fontSize: 18, color: tokens.colors.text.tertiary },
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 150, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -50, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      ]).start(() => onClose?.());
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = {
    opacity,
    transform: [{ translateY }],
  };

  return (
    <Animated.View style={[styles.container, animatedStyle, style]} testID={testID} pointerEvents="auto">
      <Text style={[styles.icon, { color: textColor }]}>{icon}</Text>
      <Text style={[styles.message, { color: textColor }]}>{message}</Text>
      {action && (
        <Pressable onPress={action.onPress} style={styles.action}>
          <Text style={styles.actionText}>{action.label}</Text>
        </Pressable>
      )}
      <Pressable onPress={onClose} style={styles.close} accessibilityLabel="Dismiss">
        <Text style={styles.closeText}>×</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface ToastManagerProps {
  children: React.ReactNode;
}

const toasts = new Map<string, { message: string; type: ToastType; duration?: number; action?: { label: string; onPress: () => void } }>();

let toastId = 0;

export function useToast() {
  return {
    show: (message: string, type: ToastType = 'default', options?: { duration?: number; action?: { label: string; onPress: () => void } }) => {
      const id = `toast-${++toastId}`;
      toasts.set(id, { message, type, ...options });
      // This would be handled by a ToastContainer at the root
      return id;
    },
    dismiss: (id: string) => toasts.delete(id),
  };
}

export function ToastContainer() {
  // This would render all active toasts from context/state
  return null;
}