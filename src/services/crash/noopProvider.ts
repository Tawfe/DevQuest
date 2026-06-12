import type { CrashReporter } from './types';

/** Used in dev and tests: errors go to the console, nothing is sent. */
export const noopCrashReporter: CrashReporter = {
  name: 'noop',

  recordError(error, context) {
    if (__DEV__) {
      console.warn(`[crash]${context ? ` ${context}:` : ''}`, error);
    }
  },

  log() {},

  setUserId() {},

  setCollectionEnabled() {},
};
