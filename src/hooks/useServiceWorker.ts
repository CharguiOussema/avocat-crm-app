import { useState, useEffect, useCallback } from 'react';
import type { ServiceWorkerUpdateEvent } from '../types/pwa.types';

/**
 * Custom hook to manage service worker updates
 * @returns Service worker update state and update trigger function
 */
export const useServiceWorker = () => {
  const [updateState, setUpdateState] = useState<ServiceWorkerUpdateEvent>({
    waiting: null,
    isUpdateAvailable: false,
  });

  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return;
    }

    // Get existing registration
    navigator.serviceWorker.ready
      .then((reg) => {
        setRegistration(reg);

        // Check if there's already a waiting service worker
        if (reg.waiting) {
          setUpdateState({
            waiting: reg.waiting,
            isUpdateAvailable: true,
          });
        }

        // Listen for new service worker installing
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateState({
                  waiting: newWorker,
                  isUpdateAvailable: true,
                });
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });

    // Listen for controller change (new service worker activated)
    const handleControllerChange = () => {
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  /**
   * Skip waiting and activate new service worker
   */
  const updateServiceWorker = useCallback(() => {
    if (updateState.waiting) {
      updateState.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }, [updateState.waiting]);

  /**
   * Manually check for updates
   */
  const checkForUpdates = useCallback(async () => {
    if (registration) {
      try {
        await registration.update();
      } catch (error) {
        console.error('Failed to check for updates:', error);
      }
    }
  }, [registration]);

  return {
    ...updateState,
    updateServiceWorker,
    checkForUpdates,
  };
};
