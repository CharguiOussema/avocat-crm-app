import { ReactNode } from 'react';
import { OfflineIndicator } from './OfflineIndicator';
import { InstallPrompt } from './InstallPrompt';
import { UpdateNotification } from './UpdateNotification';
import { NotificationPermission } from './NotificationPermission';

interface PWAProviderProps {
  children: ReactNode;
  showInstallPrompt?: boolean;
  showNotificationPermission?: boolean;
  onNotificationPermissionGranted?: () => void;
}

/**
 * PWAProvider Component
 * Wraps the application with PWA features:
 * - Offline indicator
 * - Install prompt
 * - Update notifications
 * - Notification permissions
 */
export const PWAProvider = ({
  children,
  showInstallPrompt = true,
  showNotificationPermission = true,
  onNotificationPermissionGranted,
}: PWAProviderProps) => {
  return (
    <>
      {children}

      {/* Offline/Online Status Indicator */}
      <OfflineIndicator />

      {/* Service Worker Update Notification */}
      <UpdateNotification />

      {/* PWA Install Prompt */}
      {showInstallPrompt && <InstallPrompt />}

      {/* Push Notification Permission */}
      {showNotificationPermission && (
        <NotificationPermission
          onPermissionGranted={onNotificationPermissionGranted}
        />
      )}
    </>
  );
};
