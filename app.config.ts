import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'OpenPlayer',
  slug: 'openplayer',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  scheme: 'openplayer',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#1E1B4B',
  },
  assetBundlePatterns: ['**/*'],
  android: {
    package: 'com.openplayer.app',
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#1E1B4B',
    },
    // Only what the app uses: reading audio files and playing in the background.
    permissions: [
      'android.permission.READ_MEDIA_AUDIO',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK',
      'android.permission.WAKE_LOCK',
    ],
    // Not needed: OpenPlayer only reads media through MediaStore.
    blockedPermissions: [
      'android.permission.MANAGE_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.ACCESS_MEDIA_LOCATION',
      'android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',
    ],
    allowBackup: false,
  },
  plugins: [
    'expo-router',
    [
      'expo-av',
      { microphonePermission: false },
    ],
    [
      'expo-media-library',
      { isAccessMediaLocationEnabled: false },
    ],
  ],
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true,
  },
};

export default config;
