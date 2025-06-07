
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface ConnectionState {
  isOnline: boolean;
  isSupabaseConnected: boolean;
  retryCount: number;
  lastError?: string;
}

export const useConnectionManager = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isOnline: navigator.onLine,
    isSupabaseConnected: true,
    retryCount: 0
  });
  
  const queryClient = useQueryClient();

  const checkSupabaseConnection = useCallback(async () => {
    try {
      const { error } = await supabase.auth.getSession();
      setConnectionState(prev => ({
        ...prev,
        isSupabaseConnected: !error,
        lastError: error?.message,
        retryCount: error ? prev.retryCount + 1 : 0
      }));
      return !error;
    } catch (err) {
      setConnectionState(prev => ({
        ...prev,
        isSupabaseConnected: false,
        lastError: 'Connection failed',
        retryCount: prev.retryCount + 1
      }));
      return false;
    }
  }, []);

  const handleRetry = useCallback(async () => {
    if (connectionState.retryCount < 3) {
      const isConnected = await checkSupabaseConnection();
      if (isConnected) {
        // Refetch critical data after reconnection
        queryClient.invalidateQueries({ queryKey: ['studySessions'] });
        queryClient.invalidateQueries({ queryKey: ['flashcardSets'] });
        queryClient.invalidateQueries({ queryKey: ['progress'] });
      }
    }
  }, [connectionState.retryCount, checkSupabaseConnection, queryClient]);

  useEffect(() => {
    const handleOnline = () => {
      setConnectionState(prev => ({ ...prev, isOnline: true }));
      handleRetry();
    };

    const handleOffline = () => {
      setConnectionState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection periodically when offline
    const interval = setInterval(() => {
      if (!connectionState.isOnline && connectionState.retryCount < 5) {
        checkSupabaseConnection();
      }
    }, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [connectionState.isOnline, connectionState.retryCount, checkSupabaseConnection, handleRetry]);

  return {
    connectionState,
    handleRetry,
    isFullyConnected: connectionState.isOnline && connectionState.isSupabaseConnected
  };
};

export const ConnectionStatus = () => {
  const { connectionState, handleRetry } = useConnectionManager();

  if (connectionState.isOnline && connectionState.isSupabaseConnected) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-2 text-center z-50">
      <div className="flex items-center justify-center gap-2">
        <span>
          {!connectionState.isOnline 
            ? 'No internet connection' 
            : 'Connection issues detected'
          }
        </span>
        {connectionState.retryCount < 3 && (
          <button 
            onClick={handleRetry}
            className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-sm"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};
