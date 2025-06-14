
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const useBasicSessionTracker = () => {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();

  // Check if user is on a study page
  const isOnStudyPage = ['/flashcards', '/notes', '/quiz', '/study'].some(route => 
    location.pathname.startsWith(route)
  );

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
        
        // Check for inactivity (5 minutes = 300 seconds)
        const now = Date.now();
        if (now - lastActivityTime > 300000) { // 5 minutes
          setShowTimeoutWarning(true);
        }
        
        // Auto-end session after 10 minutes of inactivity
        if (now - lastActivityTime > 600000) { // 10 minutes
          stopSession();
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused, lastActivityTime]);

  const startSession = () => {
    console.log('🟢 [SESSION TRACKER] Starting new session');
    setIsActive(true);
    setIsPaused(false);
    setElapsedSeconds(0);
    setLastActivityTime(Date.now());
    setShowTimeoutWarning(false);
  };

  const pauseSession = () => {
    console.log('⏸️ [SESSION TRACKER] Pausing session');
    setIsPaused(true);
  };

  const resumeSession = () => {
    console.log('▶️ [SESSION TRACKER] Resuming session');
    setIsPaused(false);
    setLastActivityTime(Date.now());
    setShowTimeoutWarning(false);
  };

  const stopSession = () => {
    console.log('🔴 [SESSION TRACKER] Stopping session');
    setIsActive(false);
    setIsPaused(false);
    setElapsedSeconds(0);
    setShowTimeoutWarning(false);
  };

  const togglePause = () => {
    if (isPaused) {
      resumeSession();
    } else {
      pauseSession();
    }
  };

  const recordActivity = () => {
    console.log('📝 [SESSION TRACKER] Recording activity');
    setLastActivityTime(Date.now());
    setShowTimeoutWarning(false);
  };

  const updateSessionActivity = (data: any) => {
    console.log('📊 [SESSION TRACKER] Updating session activity:', data);
    recordActivity();
    // This would normally update session data in the database
    // For now, just record the activity
  };

  const dismissTimeoutWarning = () => {
    console.log('❌ [SESSION TRACKER] Dismissing timeout warning');
    setShowTimeoutWarning(false);
    setLastActivityTime(Date.now());
  };

  return {
    isActive,
    isPaused,
    elapsedSeconds,
    isOnStudyPage,
    showTimeoutWarning,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    togglePause,
    recordActivity,
    updateSessionActivity,
    dismissTimeoutWarning
  };
};
