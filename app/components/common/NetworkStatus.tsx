'use client';

import React, { useState, useEffect } from 'react';
import { WifiIcon, XMarkIcon, SignalSlashIcon } from '@heroicons/react/24/outline';
import { useRouter, usePathname } from 'next/navigation';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // Check if currently on an authentication page
  const isAuthPage = 
    pathname?.includes('/login') || 
    pathname?.includes('/signup') ||
    pathname?.includes('/reset-password') ||
    pathname?.includes('/forgot-password');
  
  useEffect(() => {
    // Check initial status
    const online = navigator.onLine;
    setIsOnline(online);
    
    // Only show notification if offline and on auth page
    if (!online && isAuthPage) {
      setIsVisible(true);
    }
    
    // Set up event listeners for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      // Briefly show online status and then hide
      if (!isAuthPage) {
        setIsVisible(true);
        setTimeout(() => setIsVisible(false), 2000);
      } else {
        setIsVisible(false); // Just hide the offline warning
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      // Only show notification if on auth pages
      if (isAuthPage) {
        setIsVisible(true);
      } else {
        // For non-auth pages, only briefly show notification
        setIsVisible(true);
        setTimeout(() => setIsVisible(false), 3000);
      }
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isAuthPage]);
  
  // Don't render anything if status isn't visible
  if (!isVisible) return null;
  
  return (
    <div className={`fixed bottom-2 sm:bottom-4 left-2 right-2 sm:left-auto sm:right-4 px-3 py-1.5 rounded-lg sm:rounded-full shadow-md flex items-center gap-1.5 z-50 text-xs animate-fade-in max-w-full sm:max-w-xs justify-between
      ${isOnline ? 'bg-green-100 text-green-800 dark:bg-green-900/70 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-900/70 dark:text-red-100'}`}>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {isOnline ? (
          <WifiIcon className="h-3.5 w-3.5" />
        ) : (
          <SignalSlashIcon className="h-3.5 w-3.5" />
        )}
        <span className="font-medium truncate">
          {isOnline ? 'Online' : isAuthPage ? 'Authentication needs connection' : 'Offline mode'}
        </span>
      </div>
      
      <div className="flex items-center flex-shrink-0">
        {!isOnline && isAuthPage && (
          <button
            onClick={() => router.push('/')}
            className="mr-2 text-red-600 dark:text-red-400 text-xs underline"
          >
            Home
          </button>
        )}
        <button
          onClick={() => setIsVisible(false)}
          className={`${isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
          aria-label="Close notification"
        >
          <XMarkIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
} 