import { useState, useEffect, useCallback } from 'react';
import type { NetworkStatus } from '../types/pwa.types';

/**
 * Custom hook to detect online/offline status and network quality
 * @returns NetworkStatus object with online state and connection details
 */
export const useOnlineStatus = (): NetworkStatus => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(() => {
    const connection = (navigator as Navigator & {
      connection?: {
        effectiveType?: '4g' | '3g' | '2g' | 'slow-2g';
        downlink?: number;
        rtt?: number;
        saveData?: boolean;
      };
    }).connection;

    return {
      online: navigator.onLine,
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt,
      saveData: connection?.saveData,
    };
  });

  const updateOnlineStatus = useCallback(() => {
    const connection = (navigator as Navigator & {
      connection?: {
        effectiveType?: '4g' | '3g' | '2g' | 'slow-2g';
        downlink?: number;
        rtt?: number;
        saveData?: boolean;
      };
    }).connection;

    setNetworkStatus({
      online: navigator.onLine,
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt,
      saveData: connection?.saveData,
    });
  }, []);

  useEffect(() => {
    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Listen for connection changes
    const connection = (navigator as Navigator & {
      connection?: {
        addEventListener?: (type: string, listener: () => void) => void;
        removeEventListener?: (type: string, listener: () => void) => void;
      };
    }).connection;

    if (connection?.addEventListener) {
      connection.addEventListener('change', updateOnlineStatus);
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);

      if (connection?.removeEventListener) {
        connection.removeEventListener('change', updateOnlineStatus);
      }
    };
  }, [updateOnlineStatus]);

  return networkStatus;
};
