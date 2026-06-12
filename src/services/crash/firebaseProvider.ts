import {
  getCrashlytics,
  log,
  recordError,
  setCrashlyticsCollectionEnabled,
  setUserId,
} from '@react-native-firebase/crashlytics';

import type { CrashReporter } from './types';

/** Firebase Crashlytics — iOS and the Android gms flavor. */
export const firebaseCrashReporter: CrashReporter = {
  name: 'crashlytics',

  recordError(error, context) {
    const err = error instanceof Error ? error : new Error(String(error));
    if (context) {
      log(getCrashlytics(), context);
    }
    recordError(getCrashlytics(), err);
  },

  log(message) {
    log(getCrashlytics(), message);
  },

  setUserId(id) {
    setUserId(getCrashlytics(), id ?? '').catch(() => {});
  },

  setCollectionEnabled(enabled) {
    setCrashlyticsCollectionEnabled(getCrashlytics(), enabled).catch(() => {});
  },
};
