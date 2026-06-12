import '../global.css';
import '@/i18n';

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

import { QUERY_CACHE_MAX_AGE_MS } from '@/constants';
import { RootNavigator } from '@/navigation/RootNavigator';
import {
  queryClient,
  queryPersister,
  setupOnlineManager,
} from '@/services/api';
import { registerAuthWithApi, useAuthStore } from '@/services/auth';
import { analytics } from '@/services/analytics';

setupOnlineManager();
registerAuthWithApi();

export default function App() {
  useEffect(() => {
    analytics.track('app_opened');
    useAuthStore.getState().restore();
  }, []);

  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister: queryPersister,
          maxAge: QUERY_CACHE_MAX_AGE_MS,
        }}
      >
        <StatusBar barStyle="dark-content" />
        <RootNavigator />
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}
