export const APP_NAME = 'DevQuest';

/** MMKV instance ids — change only with a data migration. */
export const STORAGE_IDS = {
  app: 'devquest-app',
  queryCache: 'devquest-query-cache',
} as const;

/** Keys inside the app MMKV instance. */
export const STORAGE_KEYS = {
  authUser: 'auth.user',
} as const;

/** Keychain service for OAuth tokens (iOS Keychain / Android Keystore). */
export const AUTH_KEYCHAIN_SERVICE = 'com.devquest.app.auth';

/** How long persisted React Query cache stays valid (24h). */
export const QUERY_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
