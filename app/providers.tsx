'use client';

import React, { useEffect } from 'react';
import { AppProvider } from './context/AppProvider';
import { registerSync, listenForSyncComplete, setupOnlineListener } from './lib/sync';
import { cleanupExpiredGuestAccounts } from './lib/guestMode';

export default function Providers({ children }: { children: React.ReactNode }) {
  // Clean up expired guest accounts
  useEffect(() => {
    cleanupExpiredGuestAccounts();
  }, []);
  
  // Initialize service worker and handle updates
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          // Register service worker with correct path and scope
          const registration = await navigator.serviceWorker.register('/ai/service-worker.js', { scope: '/ai/' });
          console.log('Service Worker registered with scope:', registration.scope);

          // Register background sync
          await registerSync();

          // Handle service worker updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available
                  if (window.confirm('A new version is available! Would you like to update?')) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                }
              });
            }
          });

          // Listen for sync completion
          listenForSyncComplete((count) => {
            console.log(`Synced ${count} conversations`);
            // You could show a notification here if needed
            if (count > 0) {
              // Show a toast notification
              const event = new CustomEvent('sync-complete', { detail: { count } });
              window.dispatchEvent(event);
            }
          });
          
          // Set up online listener to trigger sync when coming back online
          setupOnlineListener();

        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      });

      // Handle service worker updates when the page is visible
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          navigator.serviceWorker.getRegistration().then((registration) => {
            if (registration) {
              registration.update();
            }
          });
        }
      });
    }
  }, []);

  return (
    <AppProvider>
      {children}
    </AppProvider>
  );
} 