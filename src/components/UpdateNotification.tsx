import { useTranslation } from 'react-i18next';
import { useServiceWorker } from '../hooks/useServiceWorker';

/**
 * UpdateNotification Component
 * Notifies users when a new version of the app is available
 */
export const UpdateNotification = () => {
  const { t } = useTranslation();
  const { isUpdateAvailable, updateServiceWorker } = useServiceWorker();

  if (!isUpdateAvailable) return null;

  return (
    <div
      className="fixed bottom-4 left-4 max-w-md bg-blue-600 text-white rounded-lg shadow-2xl z-50 overflow-hidden"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold">{t('pwa.update.title')}</h3>
            <p className="mt-1 text-sm opacity-90">
              {t('pwa.update.description')}
            </p>
            <button
              onClick={updateServiceWorker}
              className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 bg-white text-blue-600 text-sm font-medium rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              aria-label="Update application now"
            >
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              {t('pwa.update.button')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
