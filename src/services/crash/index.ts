import { getMobileServices } from '@/lib/platformServices';
import { agcCrashReporter } from './agcProvider';
import { firebaseCrashReporter } from './firebaseProvider';
import { noopCrashReporter } from './noopProvider';
import type { CrashReporter } from './types';

export type { CrashReporter } from './types';

function resolveReporter(): CrashReporter {
  if (__DEV__) {
    return noopCrashReporter;
  }
  switch (getMobileServices()) {
    case 'google':
      return firebaseCrashReporter;
    case 'huawei':
      return agcCrashReporter;
    default:
      return noopCrashReporter;
  }
}

let reporter: CrashReporter | null = null;

function getReporter(): CrashReporter {
  reporter ??= resolveReporter();
  return reporter;
}

/** Crash-reporting facade — the only crash API the app uses. */
export const crashReporter: CrashReporter = {
  name: 'facade',
  recordError: (error, context) => getReporter().recordError(error, context),
  log: message => getReporter().log(message),
  setUserId: id => getReporter().setUserId(id),
  setCollectionEnabled: enabled => getReporter().setCollectionEnabled(enabled),
};
