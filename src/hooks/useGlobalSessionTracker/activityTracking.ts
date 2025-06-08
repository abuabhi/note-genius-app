
import { useCallback, useEffect, useRef } from 'react';
import { GlobalSessionState } from './types';

export const useActivityTracking = (
  sessionState: GlobalSessionState,
  setSessionState: React.Dispatch<React.SetStateAction<GlobalSessionState>>,
  isOnStudyPage: boolean
) => {
  const lastActivityRef = useRef(Date.now());

  // Record user activity
  const recordActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Auto-pause on inactivity (5 minutes)
  useEffect(() => {
    if (!sessionState.isActive || sessionState.isPaused) return;

    const checkInactivity = setInterval(() => {
      const timeSinceActivity = Date.now() - lastActivityRef.current;
      const fiveMinutes = 5 * 60 * 1000;

      if (timeSinceActivity > fiveMinutes && !sessionState.isPaused) {
        console.log('🔄 Auto-pausing session due to inactivity');
        setSessionState(prev => ({ ...prev, isPaused: true }));
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkInactivity);
  }, [sessionState.isActive, sessionState.isPaused]);

  // Activity listeners
  useEffect(() => {
    if (!isOnStudyPage) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, recordActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, recordActivity);
      });
    };
  }, [recordActivity, isOnStudyPage]);

  return { recordActivity };
};
