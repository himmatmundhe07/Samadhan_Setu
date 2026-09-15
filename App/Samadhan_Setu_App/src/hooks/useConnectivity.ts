/**
 * Samadhan Setu — Connectivity Hook
 * Keeps appStore.isOffline in sync with the device's real network state and
 * flushes the offline submission queue when connectivity returns.
 */
import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useAppStore } from '../store/appStore';
import { offlineQueueService } from '../services/offlineQueue.service';

export const useConnectivity = () => {
  const setOffline = useAppStore((s) => s.setOffline);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = Boolean(state.isConnected) && state.isInternetReachable !== false;
      const wasOffline = useAppStore.getState().isOffline;
      setOffline(!online);

      if (online && wasOffline) {
        offlineQueueService.syncAll().catch(() => {});
      }
    });

    NetInfo.fetch()
      .then((state) => {
        setOffline(!(Boolean(state.isConnected) && state.isInternetReachable !== false));
      })
      .catch(() => {});

    return unsubscribe;
  }, [setOffline]);
};
