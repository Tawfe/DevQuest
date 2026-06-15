import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/services/api/queryKeys';
import type { ListItem } from '@/services/api/list';
import { robloxAuthService, useAuthStore } from '@/services/auth';
import {
  connectSocket,
  disconnectSocket,
} from '@/services/realtime/socketClient';

/**
 * Keeps the cached list (`queryKeys.list()`) in sync with server-pushed
 * changes from any client. Connects the socket while signed in and patches the
 * React Query cache directly — no refetch needed. Call once, app-wide.
 */
export function useRealtimeList(): void {
  const status = useAuthStore(state => state.status);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (status !== 'signedIn') {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(async () => {
      const tokens = await robloxAuthService.getTokens();
      return tokens?.accessToken ?? null;
    });

    const onAdded = (item: ListItem) => {
      console.log('[socket] list:item-added', item);
      queryClient.setQueryData<ListItem[]>(queryKeys.list(), (prev = []) =>
        prev.some(existing => existing.id === item.id) ? prev : [...prev, item],
      );
    };

    const onRemoved = ({ id }: { id: string }) => {
      console.log('[socket] list:item-removed', id);
      queryClient.setQueryData<ListItem[]>(queryKeys.list(), (prev = []) =>
        prev.filter(existing => existing.id !== id),
      );
    };

    socket.on('list:item-added', onAdded);
    socket.on('list:item-removed', onRemoved);

    return () => {
      socket.off('list:item-added', onAdded);
      socket.off('list:item-removed', onRemoved);
    };
  }, [status, queryClient]);
}
