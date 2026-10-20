import { MMKV } from 'react-native-mmkv';

/**
 * Key-value storage for UI preferences only (theme, sort order, ...).
 * It holds no secrets, so it is deliberately not encrypted.
 */
const storage = new MMKV({ id: 'openplayer-storage' });

export const MMKVStorage = {
  getItem: (key: string): string | null => {
    try {
      return storage.getString(key) ?? null;
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      storage.set(key, value);
    } catch (error) {
      console.warn('MMKV setItem failed:', error);
    }
  },
  removeItem: (key: string): void => {
    try {
      storage.delete(key);
    } catch (error) {
      console.warn('MMKV removeItem failed:', error);
    }
  },
};

export const mmkv = storage;
export default MMKVStorage;
