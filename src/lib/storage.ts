import { createMMKV } from 'react-native-mmkv';

import { STORAGE_IDS } from '@/constants';

/**
 * Fast, synchronous key-value storage. NOT encrypted — never store
 * tokens or other secrets here; those go through
 * `@/services/auth/tokenStorage` (Keychain/Keystore).
 */
export const appStorage = createMMKV({ id: STORAGE_IDS.app });

/** Dedicated instance for the persisted React Query cache. */
export const queryCacheStorage = createMMKV({ id: STORAGE_IDS.queryCache });
