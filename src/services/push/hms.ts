import type { PushProvider } from './types';

/**
 * Huawei Push Kit — STUB.
 *
 * The @hmscore/react-native-hms-push package is intentionally not installed
 * yet: its native module requires the AGConnect Gradle plugin and an
 * agconnect-services.json, which would complicate gms/iOS builds before a
 * Huawei release is actually planned.
 *
 * To activate (see README → Huawei (HMS) setup for the full walkthrough):
 *  1. npm install @hmscore/react-native-hms-push
 *  2. Put the real agconnect-services.json in android/app/ (gitignored;
 *     an example file lives at android/app/agconnect-services.example.json)
 *  3. In android/build.gradle, uncomment the AGConnect classpath; in
 *     android/app/build.gradle, uncomment the AGConnect plugin block
 *  4. Replace the bodies below with calls to HmsPushInstanceId /
 *     HmsPushMessaging from @hmscore/react-native-hms-push
 */
export const hmsProvider: PushProvider = {
  name: 'hms',

  async requestPermission() {
    return false;
  },

  async getToken() {
    return null;
  },

  onMessage() {
    return () => {};
  },

  onTokenRefresh() {
    return () => {};
  },

  async deleteToken() {},
};
