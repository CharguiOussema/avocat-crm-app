import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { notificationService } from '../services/notificationService';
import type { NotificationPermissionState } from '../types/pwa.types';

interface NotificationPermissionProps {
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
}

/**
 * NotificationPermission Component
 * Prompts users to enable push notifications
 */
export const NotificationPermission = ({
  onPermissionGranted,
  onPermissionDenied,
}: NotificationPermissionProps) => {
  const { t } = useTranslation();
  const [permission, setPermission] = useState<NotificationPermissionState>('default');
  const [isRequesting, setIsRequesting] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const currentPermission = notificationService.getPermissionState();
    setPermission(currentPermission);

    // Check if previously dismissed
    const dismissed = sessionStorage.getItem('notification-permission-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleRequestPermission = async () => {
    setIsRequesting(true);

    try {
      const result = await notificationService.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        onPermissionGranted?.();
      } else if (result === 'denied') {
        onPermissionDenied?.();
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('notification-permission-dismissed', 'true');
  };

  // Don't show if permission already granted, denied, or dismissed
  if (permission !== 'default' || isDismissed) {
    return null;
  }

  return (
    <div
      className="fixed top-20 right-4 max-w-sm bg-white rounded-lg shadow-xl border border-gray-200 z-40 overflow-hidden"
      role="dialog"
      aria-labelledby="notification-permission-title"
      aria-describedby="notification-permission-description"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-10 h-10 text-indigo-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3
              id="notification-permission-title"
              className="text-lg font-semibold text-gray-900"
            >
              {t('pwa.notification.title')}
            </h3>
            <p
              id="notification-permission-description"
              className="mt-1 text-sm text-gray-600"
            >
              {t('pwa.notification.description')}
            </p>

            <div className="mt-4 flex gap-2">
              <button
                onClick={handleRequestPermission}
                disabled={isRequesting}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Enable notifications"
              >
                {isRequesting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {t('pwa.notification.requesting')}
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {t('pwa.notification.button')}
                  </>
                )}
              </button>
              <button
                onClick={handleDismiss}
                disabled={isRequesting}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
                aria-label="Dismiss notification prompt"
              >
                {t('pwa.notification.later')}
              </button>
            </div>

            <p className="mt-2 text-xs text-gray-500">
              {t('pwa.notification.note')}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded"
            aria-label="Close notification prompt"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
