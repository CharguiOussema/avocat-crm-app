import { useState, useEffect, useCallback } from 'react';
import type { BeforeInstallPromptEvent, InstallPromptState } from '../types/pwa.types';

/**
 * Custom hook to handle PWA installation prompt
 * @returns Install prompt state and install trigger function
 */
export const useInstallPrompt = () => {
  const [installPromptState, setInstallPromptState] = useState<InstallPromptState>({
    isInstallable: false,
    isInstalled: false,
    promptEvent: null,
  });

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (isStandalone || isIOSStandalone) {
      setInstallPromptState((prev) => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
      }));
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      const installEvent = event as BeforeInstallPromptEvent;

      setInstallPromptState({
        isInstallable: true,
        isInstalled: false,
        promptEvent: installEvent,
      });
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setInstallPromptState({
        isInstallable: false,
        isInstalled: true,
        promptEvent: null,
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!installPromptState.promptEvent) {
      console.warn('Install prompt not available');
      return false;
    }

    try {
      await installPromptState.promptEvent.prompt();
      const choiceResult = await installPromptState.promptEvent.userChoice;

      setInstallPromptState((prev) => ({
        ...prev,
        isInstallable: choiceResult.outcome === 'dismissed',
        promptEvent: choiceResult.outcome === 'dismissed' ? prev.promptEvent : null,
      }));

      return choiceResult.outcome === 'accepted';
    } catch (error) {
      console.error('Error prompting install:', error);
      return false;
    }
  }, [installPromptState.promptEvent]);

  return {
    ...installPromptState,
    promptInstall,
  };
};
