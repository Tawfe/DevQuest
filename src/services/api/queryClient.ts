import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

import { QUERY_CACHE_MAX_AGE_MS } from '@/constants';
import { queryCacheStorage } from '@/lib/storage';
import { ApiError } from './errors';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: QUERY_CACHE_MAX_AGE_MS,
      // The axios layer already retries transient failures with backoff;
      // keep React Query's own retry minimal and never retry 4xx.
      retry: (failureCount, error) => {
        if (error instanceof ApiError && !error.isRetryable) {
          return false;
        }
        return failureCount < 1;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

const mmkvStorage = {
  getItem: (key: string) => queryCacheStorage.getString(key) ?? null,
  setItem: (key: string, value: string) => {
    queryCacheStorage.set(key, value);
  },
  removeItem: (key: string) => {
    queryCacheStorage.remove(key);
  },
};

/** MMKV-backed persister: cached server data survives app restarts. */
export const queryPersister = createSyncStoragePersister({
  storage: mmkvStorage,
});
