
import { useEffect, useState } from 'react';

export const useServiceWorker = () => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
          setIsInstalled(true);

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setIsUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  const updateApp = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.update();
        });
      });
      window.location.reload();
    }
  };

  return {
    isInstalled,
    isUpdateAvailable,
    updateApp
  };
};

export const UpdateNotification = () => {
  const { isUpdateAvailable, updateApp } = useServiceWorker();

  if (!isUpdateAvailable) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-blue-500 text-white p-4 rounded shadow-lg">
      <div className="flex items-center gap-2">
        <span>New update available!</span>
        <button 
          onClick={updateApp}
          className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-sm"
        >
          Update
        </button>
      </div>
    </div>
  );
};
