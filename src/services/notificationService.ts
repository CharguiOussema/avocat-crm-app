import type {
  PushNotificationPayload,
  PushSubscriptionData,
  NotificationPermissionState,
} from '../types/pwa.types';

/**
 * Push Notification Service
 * Handles push notification subscriptions and permissions
 */
class NotificationService {
  private registration: ServiceWorkerRegistration | null = null;

  /**
   * Initialize notification service with service worker registration
   */
  async initialize(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }

    if (!('PushManager' in window)) {
      throw new Error('Push notifications not supported');
    }

    try {
      this.registration = await navigator.serviceWorker.ready;
    } catch (error) {
      console.error('Failed to get service worker registration:', error);
      throw error;
    }
  }

  /**
   * Get current notification permission state
   */
  getPermissionState(): NotificationPermissionState {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission as NotificationPermissionState;
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<NotificationPermissionState> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    if (this.getPermissionState() === 'granted') {
      return 'granted';
    }

    try {
      const permission = await Notification.requestPermission();
      return permission as NotificationPermissionState;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      throw error;
    }
  }

  /**
   * Subscribe to push notifications
   * @param vapidPublicKey - VAPID public key from your server
   */
  async subscribe(vapidPublicKey: string): Promise<PushSubscriptionData> {
    if (!this.registration) {
      await this.initialize();
    }

    if (!this.registration) {
      throw new Error('Service Worker registration not available');
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey),
      });

      return this.subscriptionToData(subscription);
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<void> {
    if (!this.registration) {
      await this.initialize();
    }

    if (!this.registration) {
      throw new Error('Service Worker registration not available');
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      throw error;
    }
  }

  /**
   * Get current push subscription
   */
  async getSubscription(): Promise<PushSubscriptionData | null> {
    if (!this.registration) {
      await this.initialize();
    }

    if (!this.registration) {
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();

      if (!subscription) {
        return null;
      }

      return this.subscriptionToData(subscription);
    } catch (error) {
      console.error('Failed to get push subscription:', error);
      return null;
    }
  }

  /**
   * Show a local notification (not push)
   */
  async showNotification(payload: PushNotificationPayload): Promise<void> {
    if (!this.registration) {
      await this.initialize();
    }

    if (!this.registration) {
      throw new Error('Service Worker registration not available');
    }

    const permission = this.getPermissionState();
    if (permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    try {
      const notificationOptions: NotificationOptions = {
        body: payload.body,
        icon: payload.icon || '/icons/icon-192x192.png',
        badge: payload.badge || '/icons/icon-72x72.png',
        tag: payload.tag,
        data: payload.data,
        requireInteraction: payload.requireInteraction,
        silent: payload.silent,
      };

      await this.registration.showNotification(payload.title, notificationOptions);
    } catch (error) {
      console.error('Failed to show notification:', error);
      throw error;
    }
  }

  /**
   * Convert PushSubscription to our data format
   */
  private subscriptionToData(subscription: PushSubscription): PushSubscriptionData {
    const keys = subscription.toJSON().keys;

    if (!keys?.p256dh || !keys?.auth) {
      throw new Error('Invalid subscription keys');
    }

    return {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      expirationTime: subscription.expirationTime,
    };
  }

  /**
   * Convert VAPID key from base64 to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length) as Uint8Array<ArrayBuffer>;

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
