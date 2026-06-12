import {
  AuthorizationStatus,
  deleteToken,
  getMessaging,
  getToken,
  onMessage,
  onTokenRefresh,
  requestPermission,
} from '@react-native-firebase/messaging';

import type { PushMessage, PushProvider } from './types';

/**
 * Firebase Cloud Messaging — iOS (APNs via FCM) and Android with Google
 * Play Services. Requires google-services.json / GoogleService-Info.plist
 * (see README → Firebase setup).
 */
export const fcmProvider: PushProvider = {
  name: 'fcm',

  async requestPermission() {
    const status = await requestPermission(getMessaging());
    return (
      status === AuthorizationStatus.AUTHORIZED ||
      status === AuthorizationStatus.PROVISIONAL
    );
  },

  async getToken() {
    try {
      return await getToken(getMessaging());
    } catch {
      // Misconfigured Firebase (e.g. placeholder config files) must not
      // crash the app — push simply stays unavailable.
      return null;
    }
  },

  onMessage(listener) {
    return onMessage(getMessaging(), remoteMessage => {
      const message: PushMessage = {
        title: remoteMessage.notification?.title ?? undefined,
        body: remoteMessage.notification?.body ?? undefined,
        data: Object.fromEntries(
          Object.entries(remoteMessage.data ?? {}).map(([key, value]) => [
            key,
            String(value),
          ]),
        ),
      };
      listener(message);
    });
  },

  onTokenRefresh(listener) {
    return onTokenRefresh(getMessaging(), listener);
  },

  async deleteToken() {
    await deleteToken(getMessaging());
  },
};
