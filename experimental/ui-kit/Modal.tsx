import React, { useEffect, useRef, ViewStyle, TextStyle, ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Platform, BackHandler } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { createPortal } from 'react-native';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  closeOnOverlayPress?: boolean;
  hideCloseButton?: boolean;
  testID?: string;
}

export function Modal({ visible, onClose, children, title, size = 'md', closeOnOverlayPress = true, hideCloseButton = false, testID }: ModalProps) {
  const { tokens } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const closeHandlerRef = useRef<BackHandler>(() => { onClose(); return true; });

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
      BackHandler.addEventListener('hardwareBackPress', closeHandlerRef.current);
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 50, duration: 200, useNativeDriver: true }),
      ]).start(() => {});
      BackHandler.removeEventListener('hardwareBackPress', closeHandlerRef.current);
    }
    return () => BackHandler.removeEventListener('hardwareBackPress', closeHandlerRef.current);
  }, [visible]);

  if (!visible && fadeAnim._value === 0) return null;

  const styles = StyleSheet.create({
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: tokens.colors.bg.overlay, justifyContent: 'center', alignItems: 'center', padding: 24 },
    container: {
      backgroundColor: tokens.colors.surface.primary,
      borderRadius: tokens.borderRadius.xl,
      maxWidth: 500,
      width: '100%',
      maxHeight: '90%',
      overflow: 'hidden',
    },
    sm: { maxWidth: 320 },
    lg: { maxWidth: 600 },
    full: { maxWidth: '100%', maxHeight: '100%', borderRadius: 0 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: tokens.colors.border.primary },
    title: { fontSize: 20, fontWeight: '600', color: tokens.colors.text.primary },
    closeButton: { padding: 8 },
    content: { padding: 20, maxHeight: '70%' },
    fullContent: { padding: 0, flex: 1 },
  });

  const handleOverlayPress = () => { if (closeOnOverlayPress) onClose(); };

  const modalContent = (
    <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: fadeAnim }]} pointerEvents={visible ? 'auto' : 'none'}>
      <Pressable onPress={handleOverlayPress} style={styles.overlay} accessibilityHidden={true} />
      <Animated.View
        style={[
          styles.container,
          styles[size],
          { transform: [{ translateY: slideAnim }] },
        ]}
        testID={testID}
      >
        {(title || !hideCloseButton) && (
          <View style={styles.header}>
            {title && <Text style={styles.title}>{title}</Text>}
            {!hideCloseButton && (
              <Pressable onPress={onClose} style={styles.closeButton} accessibilityLabel="Close modal" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={{ fontSize: 24, color: tokens.colors.icon.secondary }}>×</Text>
              </Pressable>
            )}
          </View>
        )}
        <View style={size === 'full' ? styles.fullContent : styles.content}>
          {children}
        </View>
      </Animated.View>
    </Animated.View>
  );

  if (Platform.OS === 'web') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}

import { Easing } from 'react-native';