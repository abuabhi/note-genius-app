
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { useLocation } from 'react-router-dom';
import { ActivityType, GlobalSessionState, STUDY_ROUTES } from './types';
import { useSessionOperations } from './sessionOperations';
import { useActivityTracking } from './activityTracking';
import { useTimerManagement } from './timerManagement';
import { useNavigationEffects } from './navigationEffects';
import { restoreSession, persistSession } from './sessionPersistence';

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

  // Restore session on mount
  useEffect(() => {
    if (user) {
      const restored = restoreSession();
      if (restored) {
        console.log('🔄 Restoring session on mount:', restored);
        setSessionState(prev => ({ ...prev, ...restored }));
      }
    }
  }, [user]);

  // Persist session state changes
  useEffect(() => {
    if (sessionState.isActive) {
      persistSession(sessionState);
    }
  }, [sessionState]);

  // Determine activity type from current route
  const getCurrentActivityType = useCallback((): ActivityType => {
    const path = location.pathname;
    if (path.startsWith('/flashcards')) return 'flashcard_study';
    if (path.startsWith('/notes')) return 'note_review';
    if (path.startsWith('/quiz')) return 'quiz_taking';
    return 'general';
  }, [location.pathname]);

  // Use session operations
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

  // Use activity tracking
  const { recordActivity } = useActivityTracking(sessionState, setSessionState, isOnStudyPage);

  // Use timer management
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
