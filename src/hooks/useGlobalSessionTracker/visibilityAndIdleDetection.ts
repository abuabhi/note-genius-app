
import { useEffect, useRef, useCallback } from 'react';
import { GlobalSessionState } from './types';
import { toast } from '@/hooks/use-toast';

interface VisibilityAndIdleOptions {
  sessionState: GlobalSessionState;
  setSessionState: React.Dispatch<React.SetStateAction<GlobalSessionState>>;
  isOnStudyPage: boolean;
}

export const useVisibilityAndIdleDetection = ({
  sessionState,
  setSessionState,
  isOnStudyPage
}: VisibilityAndIdleOptions) => {
  const lastActivityRef = useRef(Date.now());
  const idleWarningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const idlePauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoEndTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wasVisibleRef = useRef(true);

  // Activity detection thresholds
  const IDLE_WARNING_THRESHOLD = 2 * 60 * 1000; // 2 minutes
  const IDLE_PAUSE_THRESHOLD = 3 * 60 * 1000; // 3 minutes
  const AUTO_END_THRESHOLD = 15 * 60 * 1000; // 15 minutes

  // Clear all timeouts
  const clearAllTimeouts = useCallback(() => {
    if (idleWarningTimeoutRef.current) {
      clearTimeout(idleWarningTimeoutRef.current);
      idleWarningTimeoutRef.current = null;
    }
    if (idlePauseTimeoutRef.current) {
      clearTimeout(idlePauseTimeoutRef.current);
      idlePauseTimeoutRef.current = null;
    }
    if (autoEndTimeoutRef.current) {
      clearTimeout(autoEndTimeoutRef.current);
      autoEndTimeoutRef.current = null;
    }
  }, []);

  // Show idle warning
  const showIdleWarning = useCallback(() => {
    if (!sessionState.isActive || sessionState.isPaused || !isOnStudyPage) return;
    
    console.log('⚠️ Showing idle warning - 1 minute until auto-pause');
    toast({
      title: "Session Idle Warning",
      description: "Your study session will be paused in 1 minute due to inactivity. Move your mouse or press any key to continue.",
      variant: "default",
    });
  }, [sessionState.isActive, sessionState.isPaused, isOnStudyPage]);

  // Auto-pause session due to inactivity
  const autoPauseSession = useCallback(() => {
    if (!sessionState.isActive || sessionState.isPaused || !isOnStudyPage) return;
    
    console.log('⏸️ Auto-pausing session due to 3 minutes of inactivity');
    setSessionState(prev => ({ ...prev, isPaused: true }));
    
    toast({
      title: "Session Paused",
      description: "Your study session has been paused due to inactivity. Click resume to continue.",
      variant: "default",
    });

    // Start auto-end timer
    autoEndTimeoutRef.current = setTimeout(() => {
      if (sessionState.isActive && sessionState.isPaused) {
        console.log('🛑 Auto-ending session due to 15 minutes of total inactivity');
        toast({
          title: "Session Ended",
          description: "Your study session has been automatically ended due to extended inactivity.",
          variant: "destructive",
        });
        // Note: Session ending logic should be handled by the parent component
      }
    }, AUTO_END_THRESHOLD - IDLE_PAUSE_THRESHOLD);
  }, [sessionState.isActive, sessionState.isPaused, isOnStudyPage, setSessionState]);

  // Record user activity and reset timers
  const recordActivity = useCallback(() => {
    if (!sessionState.isActive || !isOnStudyPage) return;
    
    lastActivityRef.current = Date.now();
    clearAllTimeouts();

    // If session was paused due to inactivity, resume it
    if (sessionState.isPaused) {
      console.log('▶️ Resuming session due to user activity');
      setSessionState(prev => ({ ...prev, isPaused: false }));
      toast({
        title: "Session Resumed",
        description: "Your study session has been resumed.",
        variant: "success",
      });
    }

    // Set new idle detection timers
    if (!sessionState.isPaused) {
      // Warning after 2 minutes
      idleWarningTimeoutRef.current = setTimeout(showIdleWarning, IDLE_WARNING_THRESHOLD);
      
      // Pause after 3 minutes
      idlePauseTimeoutRef.current = setTimeout(autoPauseSession, IDLE_PAUSE_THRESHOLD);
    }
  }, [sessionState.isActive, sessionState.isPaused, isOnStudyPage, setSessionState, clearAllTimeouts, showIdleWarning, autoPauseSession]);

  // Handle page visibility changes
  const handleVisibilityChange = useCallback(() => {
    const isVisible = !document.hidden;
    
    if (!sessionState.isActive || !isOnStudyPage) return;

    if (isVisible && !wasVisibleRef.current) {
      console.log('👁️ Page became visible - resuming session tracking');
      recordActivity(); // This will resume if paused and reset timers
      toast({
        title: "Welcome Back",
        description: "Session tracking resumed.",
        variant: "success",
      });
    } else if (!isVisible && wasVisibleRef.current) {
      console.log('🙈 Page became hidden - pausing session tracking');
      setSessionState(prev => ({ ...prev, isPaused: true }));
      clearAllTimeouts();
      toast({
        title: "Session Paused",
        description: "Session paused while tab is hidden.",
        variant: "default",
      });
    }
    
    wasVisibleRef.current = isVisible;
  }, [sessionState.isActive, isOnStudyPage, recordActivity, setSessionState, clearAllTimeouts]);

  // Set up visibility API listener
  useEffect(() => {
    if (!sessionState.isActive || !isOnStudyPage) {
      clearAllTimeouts();
      return;
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [sessionState.isActive, isOnStudyPage, handleVisibilityChange, clearAllTimeouts]);

  // Set up activity listeners
  useEffect(() => {
    if (!sessionState.isActive || !isOnStudyPage) {
      clearAllTimeouts();
      return;
    }

    // Comprehensive list of user interaction events
    const activityEvents = [
      'mousedown', 'mousemove', 'mouseup', 'click',
      'keydown', 'keyup', 'keypress',
      'scroll', 'wheel',
      'touchstart', 'touchmove', 'touchend',
      'focus', 'blur'
    ];
    
    // Throttled activity recording (max once per second)
    let lastRecordTime = 0;
    const throttledRecordActivity = () => {
      const now = Date.now();
      if (now - lastRecordTime >= 1000) { // Throttle to once per second
        recordActivity();
        lastRecordTime = now;
      }
    };
    
    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, throttledRecordActivity, { 
        passive: true,
        capture: true 
      });
    });

    // Initial activity recording when starting
    recordActivity();

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, throttledRecordActivity, true);
      });
      clearAllTimeouts();
    };
  }, [sessionState.isActive, isOnStudyPage, recordActivity, clearAllTimeouts]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  return {
    recordActivity,
    clearAllTimeouts
  };
};
