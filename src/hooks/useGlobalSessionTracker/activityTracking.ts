
import { useCallback, useEffect, useRef } from 'react';
import { GlobalSessionState } from './types';

export const useActivityTracking = (
  sessionState: GlobalSessionState,
  setSessionState: React.Dispatch<React.SetStateAction<GlobalSessionState>>,
  isOnStudyPage: boolean
) => {
  const lastActivityRef = useRef(Date.now());
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Record user activity
  const recordActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    // Clear existing timeout
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    
    // Set new inactivity timeout (15 minutes instead of 5 for less aggressive pausing)
    if (sessionState.isActive && !sessionState.isPaused) {
      inactivityTimeoutRef.current = setTimeout(() => {
        console.log('🔄 Auto-pausing session due to inactivity (15 minutes)');
        setSessionState(prev => ({ ...prev, isPaused: true }));
      }, 15 * 60 * 1000); // 15 minutes
    }
  }, [sessionState.isActive, sessionState.isPaused]);

  // Auto-pause on inactivity with improved logic
  useEffect(() => {
    if (!sessionState.isActive || sessionState.isPaused || !isOnStudyPage) {
      // Clear timeout if session is not active, paused, or not on study page
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
        inactivityTimeoutRef.current = null;
      }
      return;
    }

    // Start the inactivity timer
    recordActivity();

    return () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
        inactivityTimeoutRef.current = null;
      }
    };
  }, [sessionState.isActive, sessionState.isPaused, isOnStudyPage, recordActivity]);

  // Activity listeners with improved event handling
  useEffect(() => {
    if (!isOnStudyPage || !sessionState.isActive) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const throttledRecordActivity = (() => {
      let lastCall = 0;
      return () => {
        const now = Date.now();
        if (now - lastCall >= 1000) { // Throttle to once per second
          recordActivity();
          lastCall = now;
        }
      };
    })();
    
    events.forEach(event => {
      document.addEventListener(event, throttledRecordActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledRecordActivity);
      });
    };
  }, [recordActivity, isOnStudyPage, sessionState.isActive]);

  return { recordActivity };
};
