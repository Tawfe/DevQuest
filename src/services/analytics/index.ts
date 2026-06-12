import { getMobileServices } from '@/lib/platformServices';
import { firebaseAnalyticsProvider } from './firebaseProvider';
import { hmsAnalyticsProvider } from './hmsProvider';
import { noopAnalyticsProvider } from './noopProvider';
import type {
  AnalyticsEventName,
  AnalyticsEvents,
  AnalyticsProvider,
} from './types';

export type {
  AnalyticsEventName,
  AnalyticsEvents,
  AnalyticsProvider,
} from './types';

function resolveProvider(): AnalyticsProvider {
  // Keep dev sessions out of production data.
  if (__DEV__) {
    return noopAnalyticsProvider;
  }
  switch (getMobileServices()) {
    case 'google':
      return firebaseAnalyticsProvider;
    case 'huawei':
      return hmsAnalyticsProvider;
    default:
      return noopAnalyticsProvider;
  }
}

let provider: AnalyticsProvider | null = null;

function getProvider(): AnalyticsProvider {
  provider ??= resolveProvider();
  return provider;
}

/** Type-safe analytics facade — the only analytics API the app uses. */
export const analytics = {
  track<Name extends AnalyticsEventName>(
    ...args: AnalyticsEvents[Name] extends undefined
      ? [name: Name]
      : [name: Name, params: AnalyticsEvents[Name]]
  ): void {
    const [name, params] = args;
    getProvider().logEvent(
      name,
      params as Record<string, string | number | boolean> | undefined,
    );
  },

  setUserId(id: string | null): void {
    getProvider().setUserId(id);
  },

  setCollectionEnabled(enabled: boolean): void {
    getProvider().setCollectionEnabled(enabled);
  },
};
