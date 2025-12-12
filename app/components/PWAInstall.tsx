'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  useEffect(() => {
    // Check if app is already installed or running in standalone mode
    const checkInstalled = () => {
      if (typeof window !== 'undefined') {
        // These are the most reliable ways to detect if running as PWA
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isIOSStandalone = (window.navigator as any).standalone === true;
        
        // Check if app was installed through local storage flag
        const wasInstalled = localStorage.getItem('pwa-installed') === 'true';
        
        if (isStandalone || isIOSStandalone || wasInstalled) {
          setIsInstalled(true);
          // Set flag in local storage to remember installation state across sessions
          localStorage.setItem('pwa-installed', 'true');
        } else {
          // Clear the flag if somehow it was incorrectly set
          if (wasInstalled && !isStandalone && !isIOSStandalone) {
            localStorage.removeItem('pwa-installed');
          }
          setIsInstalled(false);
        }
      }
    };

    // Run the check immediately
    checkInstalled();

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      
      // If we get this event, we're definitely not installed yet
      setIsInstalled(false);
      
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      
      // Show the install button
      setIsInstallable(true);
      
      console.log('App can be installed!', e);
    };

    const handleAppInstalled = () => {
      // This fires when the app is installed
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      
      // Set flag in local storage
      localStorage.setItem('pwa-installed', 'true');
      
      console.log('App was installed successfully');
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    // Listen for display mode changes
    const displayModeMedia = window.matchMedia('(display-mode: standalone)');
    displayModeMedia.addEventListener('change', checkInstalled);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      displayModeMedia.removeEventListener('change', checkInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        localStorage.setItem('pwa-installed', 'true');
      }
      
      // Clear the deferredPrompt variable
      setDeferredPrompt(null);
      
      // Hide the install button
      setIsInstallable(false);
    } catch (error) {
      console.error('Error during PWA installation:', error);
    }
  };
  
  const checkPwaStatus = () => {
    if (typeof window === 'undefined') return;
    
    // Gather debug info
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    const wasInstalled = localStorage.getItem('pwa-installed') === 'true';
    const hasServiceWorker = 'serviceWorker' in navigator;
    let swRegistered = false;
    
    let info = `PWA Status:\n`;
    info += `- Display mode standalone: ${isStandalone}\n`;
    info += `- iOS standalone: ${isIOSStandalone}\n`;
    info += `- Local storage flag: ${wasInstalled}\n`;
    info += `- Service Worker supported: ${hasServiceWorker}\n`;
    info += `- Component state: isInstalled=${isInstalled}, isInstallable=${isInstallable}\n`;
    
    if (hasServiceWorker) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        info += `- Service Worker registrations: ${registrations.length}\n`;
        registrations.forEach((reg, i) => {
          info += `  [${i}] Scope: ${reg.scope}, Updating: ${!!reg.installing}, Active: ${!!reg.active}\n`;
        });
        setDebugInfo(info);
      });
    } else {
      setDebugInfo(info);
    }
    
    setShowDebugInfo(true);
  };

  // Don't hide on the homepage, even if installed
  if (isInstalled && !isHomePage) return null;
  
  // Don't show on non-homepages if not installable
  if (!isHomePage && !isInstallable) return null;

  // Enhanced promotion for homepage
  if (isHomePage) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        {isInstallable ? (
          <div className="bg-gradient-to-r from-primary to-primary-dark rounded-lg shadow-lg p-4 text-black">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">Install Baun AI Tutor</h3>
                <p className="text-sm text-black/90">
                  Access your AI tutor anytime, even without internet. Get instant learning help offline!
                </p>
                <ul className="text-xs mt-2 list-disc list-inside text-black/80">
                  <li>Works offline - continue learning without internet</li>
                  <li>Save to your home screen for quick access</li>
                  <li>Get the full app experience</li>
                </ul>
              </div>
              <button
                onClick={handleInstallClick}
                className="bg-black text-primary hover:bg-gray-900 font-semibold py-2 px-6 rounded-lg shadow flex items-center gap-2 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Install Now
              </button>
            </div>
          </div>
        ) : (
          !isInstalled && (
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1">Baun AI Tutor</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Your AI can work offline! Once the install prompt appears, you can add this app to your home screen.
                  </p>
                </div>
                <button
                  onClick={checkPwaStatus}
                  className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300"
                >
                  Check PWA Status
                </button>
              </div>
              {showDebugInfo && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-md text-xs font-mono whitespace-pre-wrap">
                  {debugInfo}
                  <button 
                    onClick={() => setShowDebugInfo(false)}
                    className="mt-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Close Debug Info
                  </button>
                </div>
              )}
            </div>
          )
        )}
      </div>
    );
  }

  // Regular floating button for other pages
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        {showTooltip && (
          <div className="absolute bottom-full right-0 mb-2 p-2 bg-black bg-opacity-75 text-white text-sm rounded-lg w-64">
            <p>Install as an app to use Baun AI Tutor even when you're offline!</p>
            <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-black bg-opacity-75"></div>
          </div>
        )}
        <button
          onClick={handleInstallClick}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="bg-primary hover:bg-primary-dark text-black font-semibold py-2 px-4 rounded-lg shadow-lg flex items-center gap-2 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          Install App
        </button>
      </div>
    </div>
  );
} 