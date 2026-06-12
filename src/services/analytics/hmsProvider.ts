import type { AnalyticsProvider } from './types';

/**
 * HMS Analytics Kit — STUB for the Android hms flavor.
 *
 * To activate: npm install @hmscore/react-native-hms-analytics, complete
 * the AGConnect setup (see README → Huawei (HMS) setup), then implement
 * these methods with HmsAnalytics calls.
 */
export const hmsAnalyticsProvider: AnalyticsProvider = {
  name: 'hms',

  logEvent() {},

  setUserId() {},

  setCollectionEnabled() {},
};
