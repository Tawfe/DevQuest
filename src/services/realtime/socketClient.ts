import { io, type Socket } from 'socket.io-client';
import Config from 'react-native-config';

import type { ListItem } from '@/services/api/list';

/** Events the server pushes to the client. */
export interface ServerToClientEvents {
  'list:item-added': (item: ListItem) => void;
  'list:item-removed': (payload: { id: string }) => void;
}

/** This client only listens; it sends nothing over the socket. */
type ClientToServerEvents = Record<string, never>;

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

/** Resolves the current JWT (without the "Bearer " prefix), or null. */
export type TokenGetter = () => Promise<string | null>;

let socket: AppSocket | null = null;

export function getSocket(): AppSocket | null {
  return socket;
}

/**
 * Opens (or returns the existing) Socket.IO connection to the same host as the
 * REST API. The JWT is supplied via the `auth` callback form so every
 * (re)connect picks up a fresh token — matching how the REST layer authes.
 */
export function connectSocket(getToken: TokenGetter): AppSocket {
  if (socket) {
    return socket;
  }

  socket = io(Config.API_BASE_URL ?? 'https://api.dev.devquest.example', {
    transports: ['websocket'],
    auth: cb => {
      getToken()
        .then(token => cb({ token: token ? `Bearer ${token}` : '' }))
        .catch(() => cb({ token: '' }));
    },
  });

  socket.on('connect', () => console.log('[socket] connected', socket?.id));
  socket.on('disconnect', reason =>
    console.log('[socket] disconnected:', reason),
  );
  socket.on('connect_error', error =>
    console.log('[socket] connect_error:', error.message),
  );

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
