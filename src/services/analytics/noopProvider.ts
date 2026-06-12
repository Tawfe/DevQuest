import type { AnalyticsProvider } from './types';

/** Used in dev and tests: events are visible in logs, nothing is sent. */
export const noopAnalyticsProvider: AnalyticsProvider = {
  name: 'noop',

  logEvent(name, params) {
    if (__DEV__) {
      console.debug(`[analytics] ${name}`, params ?? '');
    }
  },

  setUserId() {},

  setCollectionEnabled() {},
};
