import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

/**
 * InstallPrompt Component
 * Displays a prompt to install the PWA when available
 */
export const InstallPrompt = () => {
  const { t } = useTranslation();
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    const accepted = await promptInstall();

    if (!accepted) {
      setIsInstalling(false);
    }
    // If accepted, the app will be installed and component will unmount
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    // Store dismissal in localStorage to not show again this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed, not installable, or dismissed
  if (
    isInstalled ||
    !isInstallable ||
    isDismissed ||
    sessionStorage.getItem('pwa-install-dismissed')
  ) {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 right-4 max-w-sm bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden"
      role="dialog"
      aria-labelledby="install-prompt-title"
      aria-describedby="install-prompt-description"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-10 h-10 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3
              id="install-prompt-title"
              className="text-lg font-semibold text-gray-900"
            >
              {t('pwa.install.title')}
            </h3>
            <p
              id="install-prompt-description"
              className="mt-1 text-sm text-gray-600"
            >
              {t('pwa.install.description')}
            </p>

            <div className="mt-4 flex gap-2">
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Install application"
              >
                {isInstalling ? (
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
                    {t('pwa.install.installing')}
                  </>
                ) : (
                  t('pwa.install.button')
                )}
              </button>
              <button
                onClick={handleDismiss}
                disabled={isInstalling}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
                aria-label="Dismiss installation prompt"
              >
                {t('pwa.install.notNow')}
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded"
            aria-label="Close installation prompt"
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

      {/* Progress bar animation */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: isInstalling ? '100%' : '0%' }}
        />
      </div>
    </div>
  );
};
