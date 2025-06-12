
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { useLocation } from 'react-router-dom';
import { ActivityType, GlobalSessionState, STUDY_ROUTES } from './types';
import { useSessionOperations } from './sessionOperations';
import { useActivityTracking } from './activityTracking';
import { useTimerManagement } from './timerManagement';
import { useNavigationEffects } from './navigationEffects';
import { restoreSession, persistSession } from './sessionPersistence';
import { validateSessionState, calculateContinuousElapsedTime } from './sessionValidation';

export const useGlobalSessionTracker = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  const [sessionState, setSessionState] = useState<GlobalSessionState>({
    sessionId: null,
    isActive: false,
    startTime: null,
    elapsedSeconds: 0,
    currentActivity: null,
    isPaused: false
  });

  // Restore session on mount with continuous timing calculation
  useEffect(() => {
    if (user) {
      const restored = restoreSession();
      if (restored && validateSessionState(restored)) {
        console.log('🔄 Restoring session with continuous timing:', restored);
        
        // Recalculate elapsed time based on start time for accuracy
        const correctedElapsedSeconds = calculateContinuousElapsedTime(new Date(restored.startTime));
        
        const restoredState = {
          ...restored,
          startTime: new Date(restored.startTime), // Ensure it's a Date object
          elapsedSeconds: correctedElapsedSeconds
        };
        
        setSessionState(restoredState);
        persistSession(restoredState);
        
        console.log('✅ Session restored with corrected timing:', {
          original: restored.elapsedSeconds,
          corrected: correctedElapsedSeconds,
          difference: correctedElapsedSeconds - restored.elapsedSeconds
        });
      }
    }
  }, [user]);

  // Persist session state changes (but don't interfere with timing)
  useEffect(() => {
    if (sessionState.isActive && sessionState.sessionId) {
      persistSession(sessionState);
    }
  }, [sessionState.isActive, sessionState.sessionId, sessionState.currentActivity, sessionState.isPaused]);

  // Determine activity type from current route
  const getCurrentActivityType = useCallback((): ActivityType => {
    const path = location.pathname;
    if (path.startsWith('/flashcards')) return 'flashcard_study';
    if (path.startsWith('/notes')) return 'note_review';
    if (path.startsWith('/quiz')) return 'quiz_taking';
    return 'general';
  }, [location.pathname]);

  // Use session operations with improved continuity
  const {
    updateSessionActivity,
    startSession,
    endSession,
    updateActivityType,
    togglePause
  } = useSessionOperations(user, sessionState, setSessionState, getCurrentActivityType);

  // Use navigation effects
  const { isOnStudyPage } = useNavigationEffects(
    sessionState,
    setSessionState,
    startSession,
    updateActivityType
  );

  // Use enhanced activity tracking with visibility and idle detection
  const { recordActivity } = useActivityTracking(sessionState, setSessionState, isOnStudyPage);

  // Use timer management with continuous counting
  useTimerManagement(sessionState, setSessionState);

  return {
    ...sessionState,
    isOnStudyPage,
    startSession,
    endSession,
    togglePause,
    recordActivity,
    updateSessionActivity,
    getCurrentActivityType: getCurrentActivityType()
  };
};

// Export types for use in other files
export type { ActivityType, GlobalSessionState, ActivityData } from './types';
