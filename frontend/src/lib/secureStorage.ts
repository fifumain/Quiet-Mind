import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export interface TokenStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  deleteItem(key: string): Promise<void>;
}

const nativeTokenStorage: TokenStorage = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  deleteItem: (key) => SecureStore.deleteItemAsync(key),
};

// Web has no Keychain/EncryptedSharedPreferences equivalent available for free.
// localStorage is acceptable for a local-only MVP; revisit (e.g. httpOnly cookie
// session) before this is ever pointed at a real deployed backend.
const webTokenStorage: TokenStorage = {
  getItem: (key) => Promise.resolve(globalThis.localStorage?.getItem(key) ?? null),
  setItem: (key, value) => {
    globalThis.localStorage?.setItem(key, value);
    return Promise.resolve();
  },
  deleteItem: (key) => {
    globalThis.localStorage?.removeItem(key);
    return Promise.resolve();
  },
};

export const tokenStorage: TokenStorage = Platform.OS === 'web' ? webTokenStorage : nativeTokenStorage;
