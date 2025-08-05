import { useEffect } from 'react';
import { logVersionInfo } from '@/utils/version';

/**
 * Hook to log version information to console on app load
 */
export const useVersionLogger = () => {
  useEffect(() => {
    // Log version info in development and production
    logVersionInfo();
  }, []);
};