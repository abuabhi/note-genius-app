
import { useEffect } from 'react';
import { useUnifiedSessionTracker } from './useUnifiedSessionTracker';

/**
 * Simple hook that ensures proper session cleanup using the unified tracker
 * This replaces the old useProperSessionCleanup with unified functionality
 */
export const useProperSessionCleanup = () => {
  const { endSession, isActive } = useUnifiedSessionTracker();
  
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isActive) {
        endSession('Page unload - session auto-saved');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isActive, endSession]);
  
  console.log('🧹 [PROPER SESSION CLEANUP] Using unified session tracker for cleanup');
};
