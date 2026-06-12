import { getMobileServices } from '@/lib/platformServices';
import { fcmProvider } from './fcm';
import { hmsProvider } from './hms';
import type { PushProvider } from './types';

export type { PushMessage, PushProvider, PushProviderName } from './types';

const noneProvider: PushProvider = {
  name: 'none',
  requestPermission: async () => false,
  getToken: async () => null,
  onMessage: () => () => {},
  onTokenRefresh: () => () => {},
  deleteToken: async () => {},
};

let provider: PushProvider | null = null;

/** Selects FCM or HMS Push Kit based on what the device actually has. */
export function getPushProvider(): PushProvider {
  if (provider) {
    return provider;
  }
  switch (getMobileServices()) {
    case 'google':
      provider = fcmProvider;
      break;
    case 'huawei':
      provider = hmsProvider;
      break;
    default:
      provider = noneProvider;
  }
  return provider;
}

/**
 * Permission is intentionally NOT requested at startup — a kids' app should
 * ask in context (e.g. when enabling streak reminders), not on first open.
 * Call `getPushProvider().requestPermission()` from that flow instead.
 */
export function initPush(
  onToken: (token: string, provider: string) => void,
): () => void {
  const active = getPushProvider();
  return active.onTokenRefresh(token => onToken(token, active.name));
}
