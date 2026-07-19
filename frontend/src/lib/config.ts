import Constants from 'expo-constants';
import { Platform } from 'react-native';

function resolveApiBaseUrl(): string {
  const override = Constants.expoConfig?.extra?.apiUrl as string | undefined;
  if (override) return override;

  // Android emulator can't reach the host machine via localhost.
  if (Platform.OS === 'android') return 'http://10.0.2.2:8000';
  return 'http://localhost:8000';
}

export const API_BASE_URL = resolveApiBaseUrl();
