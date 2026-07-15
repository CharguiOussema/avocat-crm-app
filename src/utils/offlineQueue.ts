import type { OfflineQueueItem } from '../types/pwa.types';

/**
 * Offline Queue Manager
 * Manages requests that fail when offline and retries them when online
 */
class OfflineQueueManager {
  private readonly STORAGE_KEY = 'offline_request_queue';
  private readonly MAX_RETRY_COUNT = 3;
  private queue: OfflineQueueItem[] = [];
  private isProcessing = false;

  constructor() {
    this.loadQueue();
    this.setupOnlineListener();
  }

  /**
   * Load queue from localStorage
   */
  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.queue = [];
    }
  }

  /**
   * Save queue to localStorage
   */
  private saveQueue(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  /**
   * Add a request to the queue
   */
  add(
    url: string,
    method: string,
    headers: Record<string, string>,
    body?: string
  ): void {
    const item: OfflineQueueItem = {
      id: this.generateId(),
      url,
      method,
      headers,
      body,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(item);
    this.saveQueue();

    console.log(`Added request to offline queue: ${method} ${url}`);
  }

  /**
   * Process the queue when online
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0 || !navigator.onLine) {
      return;
    }

    this.isProcessing = true;
    console.log(`Processing offline queue: ${this.queue.length} items`);

    const processedIds: string[] = [];
    const failedIds: string[] = [];

    for (const item of this.queue) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: item.body,
        });

        if (response.ok) {
          console.log(`✅ Successfully synced: ${item.method} ${item.url}`);
          processedIds.push(item.id);
        } else {
          console.warn(`⚠️ Failed to sync (${response.status}): ${item.url}`);
          item.retryCount++;

          if (item.retryCount >= this.MAX_RETRY_COUNT) {
            console.error(`❌ Max retries reached for: ${item.url}`);
            failedIds.push(item.id);
          }
        }
      } catch (error) {
        console.error(`❌ Error syncing request:`, error);
        item.retryCount++;

        if (item.retryCount >= this.MAX_RETRY_COUNT) {
          failedIds.push(item.id);
        }
      }
    }

    // Remove processed and permanently failed items
    this.queue = this.queue.filter(
      (item) => !processedIds.includes(item.id) && !failedIds.includes(item.id)
    );

    this.saveQueue();
    this.isProcessing = false;

    if (processedIds.length > 0) {
      console.log(`✅ Processed ${processedIds.length} queued requests`);
    }

    if (failedIds.length > 0) {
      console.warn(`⚠️ ${failedIds.length} requests failed permanently`);
    }
  }

  /**
   * Clear all queued requests
   */
  clear(): void {
    this.queue = [];
    this.saveQueue();
    console.log('Offline queue cleared');
  }

  /**
   * Get current queue length
   */
  getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * Get all queued items
   */
  getQueue(): OfflineQueueItem[] {
    return [...this.queue];
  }

  /**
   * Setup listener to process queue when coming online
   */
  private setupOnlineListener(): void {
    window.addEventListener('online', () => {
      console.log('Connection restored, processing offline queue...');
      this.processQueue();
    });
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const offlineQueue = new OfflineQueueManager();

/**
 * Fetch wrapper with offline queue support
 */
export async function fetchWithOfflineSupport(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  try {
    const response = await fetch(url, options);

    if (!response.ok && !navigator.onLine) {
      // Queue the request for later if offline
      queueRequest(url, options);
      throw new Error('Network request failed - queued for retry when online');
    }

    return response;
  } catch (error) {
    if (!navigator.onLine) {
      queueRequest(url, options);
      throw new Error('Offline - request queued for sync when online');
    }
    throw error;
  }
}

/**
 * Helper to queue a request
 */
function queueRequest(url: string, options: RequestInit): void {
  const method = options.method || 'GET';
  const headers: Record<string, string> = {};

  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      Object.assign(headers, options.headers);
    }
  }

  const body = typeof options.body === 'string' ? options.body : undefined;

  offlineQueue.add(url, method, headers, body);
}
