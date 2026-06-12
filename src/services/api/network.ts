import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';

/**
 * Wires device connectivity into React Query: queries pause while offline
 * and refetch automatically on reconnect. Call once at app start.
 */
export function setupOnlineManager(): void {
  onlineManager.setEventListener(setOnline =>
    NetInfo.addEventListener(state => {
      setOnline(
        state.isConnected === true && state.isInternetReachable !== false,
      );
    }),
  );
}
