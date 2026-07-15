/**
 * PWA (Progressive Web App) TypeScript type definitions
 * Provides type safety for service workers, notifications, and PWA features
 */

/**
 * Service Worker Registration Event
 */
export interface ServiceWorkerRegistrationEvent {
  type: 'success' | 'error' | 'update';
  registration?: ServiceWorkerRegistration;
  error?: Error;
}

/**
 * Service Worker Update Event
 */
export interface ServiceWorkerUpdateEvent {
  waiting: ServiceWorker | null;
  isUpdateAvailable: boolean;
}

/**
 * Network Status
 */
export interface NetworkStatus {
  online: boolean;
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

/**
 * Push Notification Payload
 */
export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
  vibrate?: number[];
}

/**
 * Notification Action
 */
export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

/**
 * Push Subscription Data
 */
export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  expirationTime?: number | null;
}

/**
 * Before Install Prompt Event
 */
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

/**
 * Install Prompt State
 */
export interface InstallPromptState {
  isInstallable: boolean;
  isInstalled: boolean;
  promptEvent: BeforeInstallPromptEvent | null;
}

/**
 * Cache Strategy Types
 */
export type CacheStrategy =
  | 'CacheFirst'
  | 'NetworkFirst'
  | 'StaleWhileRevalidate'
  | 'NetworkOnly'
  | 'CacheOnly';

/**
 * Offline Queue Item
 */
export interface OfflineQueueItem {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  timestamp: number;
  retryCount: number;
}

/**
 * PWA Installation State
 */
export interface PWAInstallationState {
  canInstall: boolean;
  isInstalled: boolean;
  platform: 'standalone' | 'browser' | 'twa' | 'unknown';
}

/**
 * Notification Permission State
 */
export type NotificationPermissionState = 'granted' | 'denied' | 'default';

/**
 * PWA Update Available Event
 */
export interface PWAUpdateEvent {
  type: 'update-available' | 'update-installed' | 'update-error';
  registration?: ServiceWorkerRegistration;
  message?: string;
}

/**
 * Service Worker Message
 */
export interface ServiceWorkerMessage<T = unknown> {
  type: string;
  payload?: T;
}

/**
 * Background Sync Event
 */
export interface BackgroundSyncEvent {
  tag: string;
  lastChance: boolean;
}

/**
 * Periodic Sync Event
 */
export interface PeriodicSyncEvent {
  tag: string;
}

/**
 * Extended Navigator with PWA features
 */
export interface PWANavigator extends Navigator {
  standalone?: boolean;
  connection?: {
    effectiveType: '4g' | '3g' | '2g' | 'slow-2g';
    downlink: number;
    rtt: number;
    saveData: boolean;
  };
}

/**
 * Window with Install Prompt
 */
export interface WindowWithInstallPrompt extends Window {
  deferredPrompt?: BeforeInstallPromptEvent;
}
