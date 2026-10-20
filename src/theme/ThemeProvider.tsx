import { createContext, useContext, useMemo, useState, useEffect, ReactNode } from 'react';
import { useColorScheme, Appearance, StyleSheet, Platform } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';
export type Density = 'compact' | 'comfortable';

export interface ThemeTokens {
  colors: {
    bg: { primary: string; secondary: string; tertiary: string; inverse: string; overlay: string };
    surface: { primary: string; secondary: string; tertiary: string; raised: string; sunken: string };
    border: { primary: string; secondary: string; focus: string; error: string; input: string; 'input-hover': string };
    text: { primary: string; secondary: string; tertiary: string; inverse: string; link: string; 'link-hover': string; 'on-accent': string };
    icon: { primary: string; secondary: string; tertiary: string; inverse: string; accent: string };
    feedback: {
      success: { 50: string; 100: string; 500: string; 600: string; 700: string };
      warning: { 50: string; 100: string; 500: string; 600: string; 700: string };
      error: { 50: string; 100: string; 500: string; 600: string; 700: string };
      info: { 50: string; 100: string; 500: string; 600: string; 700: string };
    };
    brand: {
      primary: { 50: string; 100: string; 200: string; 300: string; 400: string; 500: string; 600: string; 700: string; 800: string; 900: string; 950: string };
      accent: { 50: string; 100: string; 200: string; 300: string; 400: string; 500: string; 600: string; 700: string; 800: string; 900: string; 950: string };
    };
    player: { bg: string; surface: string; 'progress-bg': string; 'progress-fill': string; thumb: string; 'art-scrim': string };
  };
  spacing: Record<string, number>;
  borderRadius: Record<string, number>;
  shadows: Record<string, string>;
  typography: {
    fontFamilies: { sans: string; mono: string; display: string };
    fontSizes: Record<string, number>;
    fontWeights: Record<string, number>;
    lineHeights: Record<string, number>;
  };
  zIndex: Record<string, number>;
  opacity: Record<string, number>;
  layout: {
    headerHeight: number;
    bottomNavHeight: number;
    playerMinHeight: number;
    contentMaxWidth: number;
    sidebarWidth: number;
    listItemHeight: { comfortable: number; compact: number };
    cardGap: number;
    sectionGap: number;
  };
  breakpoints: Record<string, number>;
}

const lightTokens: ThemeTokens = {
  colors: {
    bg: { primary: '#FFFFFF', secondary: '#FAFAFA', tertiary: '#F5F5F5', inverse: '#0A0A0A', overlay: 'rgba(15,15,15,0.5)' },
    surface: { primary: '#FFFFFF', secondary: '#FAFAFA', tertiary: '#F5F5F5', raised: '#FFFFFF', sunken: '#F5F5F5' },
    border: { primary: '#E5E5E5', secondary: '#D4D4D4', focus: '#4F46E5', error: '#EF4444', input: '#737373', 'input-hover': '#525252' },
    text: { primary: '#171717', secondary: '#525252', tertiary: '#737373', inverse: '#FFFFFF', link: '#4F46E5', 'link-hover': '#4338CA', 'on-accent': '#FFFFFF' },
    icon: { primary: '#404040', secondary: '#737373', tertiary: '#A3A3A3', inverse: '#FFFFFF', accent: '#4F46E5' },
    feedback: {
      success: { 50: '#F0FDF4', 100: '#DCFCE7', 500: '#22C55E', 600: '#16A34A', 700: '#15803D' },
      warning: { 50: '#FFFBEB', 100: '#FEF3C7', 500: '#F59E0B', 600: '#D97706', 700: '#B45309' },
      error: { 50: '#FEF2F2', 100: '#FEE2E2', 500: '#EF4444', 600: '#DC2626', 700: '#B91C1C' },
      info: { 50: '#EFF6FF', 100: '#DBEAFE', 500: '#3B82F6', 600: '#2563EB', 700: '#1D4ED8' },
    },
    brand: {
      primary: { 50: '#EEF2FF', 100: '#E0E7FF', 200: '#C7D2FE', 300: '#A5B4FC', 400: '#818CF8', 500: '#6366F1', 600: '#4F46E5', 700: '#4338CA', 800: '#3730A3', 900: '#312E81', 950: '#1E1B4B' },
      accent: { 50: '#F0FDFA', 100: '#CCFBF1', 200: '#99F6E4', 300: '#5EEAD4', 400: '#2DD4BF', 500: '#0F766E', 600: '#0D9488', 700: '#0F766E', 800: '#115E59', 900: '#134E4A', 950: '#042F2E' },
    },
    player: { bg: '#0A0A0A', surface: '#171717', 'progress-bg': '#262626', 'progress-fill': '#6366F1', thumb: '#818CF8', 'art-scrim': 'rgba(0,0,0,0.6)' },
  },
  spacing: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64, 20: 80, 24: 96 },
  borderRadius: { none: 0, xs: 4, sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, full: 9999 },
  shadows: {
    xs: '0 1px 2px 0 rgba(0,0,0,0.05)',
    sm: '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
    md: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
    lg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
    xl: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
    '2xl': '0 25px 50px -12px rgba(0,0,0,0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0,0,0,0.05)',
    focus: '0 0 0 3px rgba(99,102,241,0.3)',
  },
  typography: {
    fontFamilies: { sans: 'Inter', mono: 'JetBrains Mono', display: 'Inter' },
    fontSizes: { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30, '4xl': 36, '5xl': 48 },
    fontWeights: { normal: 400, medium: 500, semibold: 600, bold: 700 },
    lineHeights: { tight: 1.1, snug: 1.25, normal: 1.5, relaxed: 1.625, loose: 2 },
  },
  zIndex: { base: 0, dropdown: 1000, sticky: 1100, modal: 1200, popover: 1300, tooltip: 1400, toast: 1500, player: 100, bottomNav: 200 },
  opacity: { disabled: 0.5, overlay: 0.5, scrim: 0.6, hover: 0.08, pressed: 0.12 },
  layout: { headerHeight: 64, bottomNavHeight: 72, playerMinHeight: 96, contentMaxWidth: 1280, sidebarWidth: 280, listItemHeight: { comfortable: 56, compact: 48 }, cardGap: 12, sectionGap: 24 },
  breakpoints: { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 },
};

const darkTokens: ThemeTokens = {
  ...lightTokens,
  colors: {
    ...lightTokens.colors,
    bg: { primary: '#0A0A0A', secondary: '#171717', tertiary: '#262626', inverse: '#FFFFFF', overlay: 'rgba(0,0,0,0.7)' },
    surface: { primary: '#171717', secondary: '#262626', tertiary: '#404040', raised: '#262626', sunken: '#404040' },
    border: { primary: '#404040', secondary: '#525252', focus: '#818CF8', error: '#EF4444', input: '#525252', 'input-hover': '#737373' },
    text: { primary: '#FAFAFA', secondary: '#A3A3A3', tertiary: '#737373', inverse: '#0A0A0A', link: '#818CF8', 'link-hover': '#A5B4FC', 'on-accent': '#0A0A0A' },
    icon: { primary: '#E5E5E5', secondary: '#A3A3A3', tertiary: '#737373', inverse: '#0A0A0A', accent: '#818CF8' },
    player: { bg: '#0A0A0A', surface: '#171717', 'progress-bg': '#262626', 'progress-fill': '#6366F1', thumb: '#818CF8', 'art-scrim': 'rgba(0,0,0,0.7)' },
  },
  shadows: {
    ...lightTokens.shadows,
    focus: '0 0 0 3px rgba(99,102,241,0.4)',
  },
};

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedMode: 'light' | 'dark';
  tokens: ThemeTokens;
  density: Density;
  setMode: (mode: ThemeMode) => void;
  setDensity: (density: Density) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('system');
  const [density, setDensity] = useState<Density>('comfortable');
  const systemColorScheme = useColorScheme();
  
  const resolvedMode = mode === 'system' ? (systemColorScheme ?? 'light') : mode;
  const tokens = useMemo(() => (resolvedMode === 'dark' ? darkTokens : lightTokens), [resolvedMode]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const root = document.documentElement;
    root.setAttribute('data-theme', resolvedMode);
    root.setAttribute('data-density', density);
  }, [resolvedMode, density]);

  const toggleMode = () => {
    setMode(prev => (prev === 'light' ? 'dark' : prev === 'dark' ? 'system' : 'light'));
  };

  const value = useMemo(() => ({
    mode,
    resolvedMode,
    tokens,
    density,
    setMode,
    setDensity,
    toggleMode,
  }), [mode, resolvedMode, tokens, density]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}

export function createStyleSheet<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  styles: (tokens: ThemeTokens) => T
): T {
  return StyleSheet.create(styles(useTheme().tokens)) as T;
}

export function useResponsiveValue<T>(values: { base: T; sm?: T; md?: T; lg?: T; xl?: T; '2xl'?: T }): T {
  const { tokens } = useTheme();
  const width = Platform.OS === 'web' ? window.innerWidth : 390;
  
  if (width >= tokens.breakpoints['2xl']) return values['2xl'] ?? values.xl ?? values.lg ?? values.md ?? values.sm ?? values.base;
  if (width >= tokens.breakpoints.xl) return values.xl ?? values.lg ?? values.md ?? values.sm ?? values.base;
  if (width >= tokens.breakpoints.lg) return values.lg ?? values.md ?? values.sm ?? values.base;
  if (width >= tokens.breakpoints.md) return values.md ?? values.sm ?? values.base;
  if (width >= tokens.breakpoints.sm) return values.sm ?? values.base;
  return values.base;
}