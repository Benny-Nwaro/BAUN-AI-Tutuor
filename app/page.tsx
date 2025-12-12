'use client';

import { useEffect, useState } from 'react';
import MainLayout from './components/layout/MainLayout';
import RoleSelection from './components/auth/RoleSelection';
import { PhoneIcon, WifiIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import PWAInstall from "@/app/components/PWAInstall";

export default function Home() {
  const [isPWA, setIsPWA] = useState(false);
  
  useEffect(() => {
    // Check if running as installed PWA
    if (typeof window !== 'undefined') {
      const checkPWAStatus = () => {
        // These are the most reliable ways to detect if running as PWA
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isIOSStandalone = (window.navigator as any).standalone === true;
        
        // Check if app was installed through local storage flag
        const wasInstalled = localStorage.getItem('pwa-installed') === 'true';
        
        if (isStandalone || isIOSStandalone || wasInstalled) {
          setIsPWA(true);
        } else {
          setIsPWA(false);
        }
      };
      
      // Check immediately
      checkPWAStatus();
      
      // Listen for changes in display mode
      const mql = window.matchMedia('(display-mode: standalone)');
      const handleDisplayModeChange = (e: MediaQueryListEvent) => {
        checkPWAStatus();
      };
      
      mql.addEventListener('change', handleDisplayModeChange);
      
      // Also listen for storage changes in case the PWA status is updated in another tab
      window.addEventListener('storage', (e) => {
        if (e.key === 'pwa-installed') {
          checkPWAStatus();
        }
      });
      
      // Listen for app installed event
      window.addEventListener('appinstalled', () => {
        setIsPWA(true);
        localStorage.setItem('pwa-installed', 'true');
      });
      
      return () => {
        mql.removeEventListener('change', handleDisplayModeChange);
        window.removeEventListener('storage', checkPWAStatus);
        window.removeEventListener('appinstalled', checkPWAStatus);
      };
    }
  }, []);
  
  return (
    <MainLayout>
      <div className="py-5">
        <RoleSelection />
        
        {/* PWA Install CTA Section - Always show this regardless of PWA status */}
        <div className="mt-8">
          <PWAInstall />
        </div>
        
        {/* Only show PWA features section when not in PWA mode */}
        {!isPWA && (
          <div className="mt-8 max-w-4xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
              Learn Anytime, Anywhere - Even Offline
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md">
                <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-full inline-block mb-4">
                  <DevicePhoneMobileIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Install on Your Device
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Add Baun AI Tutor to your home screen for quick access. Works like a native app!
                </p>
              </div>
              
              <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md">
                <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-full inline-block mb-4">
                  <WifiIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Full Offline Access
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Continue learning without internet. All pages and resources available offline.
                </p>
              </div>
              
              <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md">
                <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-full inline-block mb-4">
                  <PhoneIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Mobile Optimized
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Fully responsive design works perfectly on all devices. Learn on the go!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
