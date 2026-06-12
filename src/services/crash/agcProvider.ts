import type { CrashReporter } from './types';

/**
 * AppGallery Connect Crash Service — STUB for the Android hms flavor.
 *
 * To activate: npm install @hmscore/react-native-hms-crash (plus the
 * AGConnect setup in README → Huawei (HMS) setup), then implement these
 * methods with AGCCrash calls.
 */
export const agcCrashReporter: CrashReporter = {
  name: 'agc-crash',

  recordError() {},

  log() {},

  setUserId() {},

  setCollectionEnabled() {},
};
