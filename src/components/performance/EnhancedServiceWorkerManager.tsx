
import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useMultiLevelCache } from '@/hooks/performance/useMultiLevelCache';
import { useBackgroundProcessor } from '@/hooks/performance/useBackgroundProcessor';

interface ServiceWorkerState {
  isInstalled: boolean;
  isUpdateAvailable: boolean;
  isOnline: boolean;
  cacheStatus: 'fresh' | 'stale' | 'offline' | 'error';
  lastSync: Date | null;
}

export const useEnhancedServiceWorker = () => {
  const [state, setState] = useState<ServiceWorkerState>({
    isInstalled: false,
    isUpdateAvailable: false,
    isOnline: navigator.onLine,
    cacheStatus: 'fresh',
    lastSync: null
  });

  const cache = useMultiLevelCache();
  const { addJob, registerWorker } = useBackgroundProcessor();

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/enhanced-sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      console.log('Enhanced Service Worker registered:', registration);
      setState(prev => ({ ...prev, isInstalled: true }));

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setState(prev => ({ ...prev, isUpdateAvailable: true }));
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        const { type, data } = event.data;
        
        switch (type) {
          case 'CACHE_UPDATED':
            setState(prev => ({ 
              ...prev, 
              cacheStatus: 'fresh',
              lastSync: new Date()
            }));
            break;
          case 'OFFLINE_FALLBACK':
            setState(prev => ({ ...prev, cacheStatus: 'offline' }));
            break;
          case 'SYNC_COMPLETE':
            setState(prev => ({ 
              ...prev, 
              lastSync: new Date(),
              cacheStatus: 'fresh'
            }));
            break;
        }
      });

      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      setState(prev => ({ ...prev, cacheStatus: 'error' }));
    }
  }, []);

  // Update app
  const updateApp = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      for (const registration of registrations) {
        await registration.update();
      }
      
      // Clear application cache
      await cache.clear();
      
      // Reload the page
      window.location.reload();
    } catch (error) {
      console.error('App update failed:', error);
    }
  }, [cache]);

  // Sync data when online
  const syncData = useCallback(async () => {
    if (!navigator.onLine) return;

    setState(prev => ({ ...prev, cacheStatus: 'fresh' }));
    
    // Trigger background sync
    addJob('sync_offline_data', {}, 'high');
    
    // Update cache with fresh data
    addJob('refresh_cache', { cache }, 'medium');
    
    setState(prev => ({ 
      ...prev, 
      lastSync: new Date(),
      cacheStatus: 'fresh'
    }));
  }, [addJob, cache]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true, cacheStatus: 'stale' }));
      syncData();
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false, cacheStatus: 'offline' }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncData]);

  // Register background workers
  useEffect(() => {
    registerWorker('sync_offline_data', async () => {
      // Sync offline data when connection is restored
      console.log('Syncing offline data...');
      // Implementation would sync queued operations
    });

    registerWorker('refresh_cache', async ({ cache }) => {
      // Refresh cache with fresh data
      console.log('Refreshing cache...');
      // Implementation would fetch fresh data and update cache
    });

    registerWorker('preload_critical_data', async ({ urls }) => {
      // Preload critical application data
      console.log('Preloading critical data...');
      // Implementation would preload essential app data
    });
  }, [registerWorker]);

  // Initialize service worker
  useEffect(() => {
    registerServiceWorker();
  }, [registerServiceWorker]);

  return {
    state,
    updateApp,
    syncData,
    isOnline: state.isOnline,
    canUseApp: state.isInstalled || state.isOnline
  };
};

// Service Worker Status Component
export const ServiceWorkerStatus: React.FC = () => {
  const { state, updateApp, syncData } = useEnhancedServiceWorker();

  // Don't show anything if everything is working normally
  if (state.isOnline && state.cacheStatus === 'fresh' && !state.isUpdateAvailable) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 space-y-2 p-2">
      {/* App Update Available */}
      {state.isUpdateAvailable && (
        <Alert className="bg-blue-50 border-blue-200">
          <Download className="h-4 w-4 text-blue-600" />
          <AlertDescription className="flex items-center justify-between w-full">
            <span className="text-blue-800">
              A new version of the app is available!
            </span>
            <Button 
              onClick={updateApp}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Update Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Offline Status */}
      {!state.isOnline && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <WifiOff className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            You're currently offline. Some features may be limited.
          </AlertDescription>
        </Alert>
      )}

      {/* Stale Cache */}
      {state.isOnline && state.cacheStatus === 'stale' && (
        <Alert className="bg-orange-50 border-orange-200">
          <RefreshCw className="h-4 w-4 text-orange-600" />
          <AlertDescription className="flex items-center justify-between w-full">
            <span className="text-orange-800">
              Your data may be outdated. 
              {state.lastSync && (
                <span className="text-sm ml-1">
                  Last synced: {state.lastSync.toLocaleTimeString()}
                </span>
              )}
            </span>
            <Button 
              onClick={syncData}
              size="sm"
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              Sync Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Cache Error */}
      {state.cacheStatus === 'error' && (
        <Alert className="bg-red-50 border-red-200">
          <AlertDescription className="text-red-800">
            There was an issue with the app cache. Please refresh the page.
          </AlertDescription>
        </Alert>
      )}

      {/* Connection Restored */}
      {state.isOnline && state.cacheStatus === 'fresh' && (
        <Alert className="bg-green-50 border-green-200">
          <Wifi className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Connection restored! Your data is up to date.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

// Enhanced PWA Install Prompt
export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User installed the PWA');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  if (!showInstallPrompt) return null;

  return (
    <Alert className="fixed bottom-4 right-4 w-80 bg-white shadow-xl border-2 border-mint-200">
      <Download className="h-4 w-4 text-mint-600" />
      <AlertDescription className="space-y-3">
        <div>
          <strong className="text-mint-800">Install Study Tool</strong>
          <p className="text-sm text-gray-600 mt-1">
            Get faster access and work offline by installing our app.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleInstall}
            size="sm"
            className="bg-mint-600 hover:bg-mint-700 text-white flex-1"
          >
            Install
          </Button>
          <Button 
            onClick={handleDismiss}
            size="sm"
            variant="outline"
            className="border-gray-300"
          >
            Not Now
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

// Combine all service worker components
export const EnhancedServiceWorkerManager: React.FC = () => {
  return (
    <>
      <ServiceWorkerStatus />
      <PWAInstallPrompt />
    </>
  );
};
