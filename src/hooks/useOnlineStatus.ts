import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

/** Live connectivity flag for offline banners and disabled actions. */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    return NetInfo.addEventListener(state => {
      setIsOnline(
        state.isConnected === true && state.isInternetReachable !== false,
      );
    });
  }, []);

  return isOnline;
}
