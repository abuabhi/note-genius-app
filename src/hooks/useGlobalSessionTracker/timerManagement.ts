
import { useEffect } from 'react';
import { GlobalSessionState } from './types';
import { persistSession } from './sessionPersistence';

export const useTimerManagement = (
  sessionState: GlobalSessionState,
  setSessionState: React.Dispatch<React.SetStateAction<GlobalSessionState>>
) => {
  // Timer management with continuous counting (no resets on activity changes)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (sessionState.isActive && !sessionState.isPaused && sessionState.startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const startTime = sessionState.startTime!;
        const newElapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        
        setSessionState(prev => {
          // Only update if the elapsed time has actually changed
          if (prev.elapsedSeconds !== newElapsedSeconds) {
            const updatedState = {
              ...prev,
              elapsedSeconds: newElapsedSeconds
            };
            
            // Persist the updated state
            persistSession(updatedState);
            
            return updatedState;
          }
          return prev;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [sessionState.isActive, sessionState.isPaused, sessionState.startTime, setSessionState]);

  // Recovery mechanism to recalculate elapsed time from start time
  useEffect(() => {
    if (sessionState.isActive && sessionState.startTime && !sessionState.isPaused) {
      const now = new Date();
      const correctElapsedSeconds = Math.floor((now.getTime() - sessionState.startTime.getTime()) / 1000);
      
      // If there's a significant discrepancy, correct it
      if (Math.abs(correctElapsedSeconds - sessionState.elapsedSeconds) > 5) {
        console.warn('🔧 Correcting session timer discrepancy:', {
          calculated: correctElapsedSeconds,
          stored: sessionState.elapsedSeconds,
          difference: correctElapsedSeconds - sessionState.elapsedSeconds
        });
        
        setSessionState(prev => ({
          ...prev,
          elapsedSeconds: correctElapsedSeconds
        }));
      }
    }
  }, [sessionState.currentActivity]); // Trigger on activity changes to ensure timing stays consistent
};
