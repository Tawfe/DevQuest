import * as Keychain from 'react-native-keychain';

import { AUTH_KEYCHAIN_SERVICE } from '@/constants';
import type { AuthTokens } from './types';

/**
 * OAuth tokens live in the iOS Keychain / Android Keystore — never in
 * MMKV/AsyncStorage, which are plaintext on disk.
 */
export async function saveTokens(tokens: AuthTokens): Promise<void> {
  await Keychain.setGenericPassword('devquest', JSON.stringify(tokens), {
    service: AUTH_KEYCHAIN_SERVICE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function loadTokens(): Promise<AuthTokens | null> {
  const credentials = await Keychain.getGenericPassword({
    service: AUTH_KEYCHAIN_SERVICE,
  });
  if (!credentials) {
    return null;
  }
  try {
    return JSON.parse(credentials.password) as AuthTokens;
  } catch {
    // Corrupted entry — drop it rather than failing forever.
    await clearTokens();
    return null;
  }
}

export async function clearTokens(): Promise<void> {
  await Keychain.resetGenericPassword({ service: AUTH_KEYCHAIN_SERVICE });
}
