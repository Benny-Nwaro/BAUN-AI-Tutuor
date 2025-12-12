import { Conversation } from './types';

// TypeScript declaration for Background Sync API
declare global {
  interface ServiceWorkerRegistration {
    sync: {
      register(tag: string): Promise<void>;
    }
  }
}

/**
 * Helper functions for background sync
 */

// Register background sync
export const registerSync = async () => {
  try {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      try {
        // Register for periodic sync if available (Chrome-only for now)
        if ('periodicSync' in registration) {
          const periodicSync = registration.periodicSync as any;
          const status = await periodicSync.register({
            tag: 'periodic-sync-conversations',
            minInterval: 60 * 60 * 1000 // 1 hour
          });
          console.log('Periodic sync registered:', status);
        }
        
        // Register for regular background sync (more widely supported)
        await registration.sync.register('sync-conversations');
        console.log('Background sync registered');
        return true;
      } catch (error) {
        console.error('Error registering sync:', error);
        return false;
      }
    } else {
      console.log('Background sync not supported');
      return false;
    }
  } catch (error) {
    console.error('Error setting up sync:', error);
    return false;
  }
};

// Manually trigger a sync (used when coming back online)
export const triggerSync = async () => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    if (registration.sync) {
      try {
        await registration.sync.register('sync-conversations');
        return true;
      } catch (error) {
        console.error('Error triggering sync:', error);
        return false;
      }
    }
  }
  return false;
};

// Listen for sync complete events from the service worker
export const listenForSyncComplete = (callback: (count: number) => void) => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SYNC_COMPLETE') {
        callback(event.data.count || 0);
      }
    });
  }
};

// Set up online/offline listeners to trigger sync when coming back online
export const setupOnlineListener = () => {
  window.addEventListener('online', async () => {
    console.log('Back online, triggering sync');
    await triggerSync();
  });
}; 