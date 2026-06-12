import { getApp } from '@react-native-firebase/app';
import {
  getAnalytics,
  logEvent,
  setAnalyticsCollectionEnabled,
  setUserId,
} from '@react-native-firebase/analytics';

import type { AnalyticsProvider } from './types';

/**
 * Firebase Analytics (GA4) — iOS and the Android gms flavor.
 *
 * COPPA: ad-id collection and ad-personalization signals are disabled at
 * the native config level (AndroidManifest.xml meta-data + Info.plist
 * keys), so this provider can never collect them regardless of what's
 * called here.
 */
export const firebaseAnalyticsProvider: AnalyticsProvider = {
  name: 'firebase',

  logEvent(name, params) {
    logEvent(getAnalytics(getApp()), name, params).catch(() => {
      // Analytics must never crash the app.
    });
  },

  setUserId(id) {
    setUserId(getAnalytics(getApp()), id).catch(() => {});
  },

  setCollectionEnabled(enabled) {
    setAnalyticsCollectionEnabled(getAnalytics(getApp()), enabled).catch(
      () => {},
    );
  },
};
