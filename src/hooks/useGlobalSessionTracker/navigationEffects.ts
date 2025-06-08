
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { GlobalSessionState, STUDY_ROUTES } from './types';

export const useNavigationEffects = (
  sessionState: GlobalSessionState,
  setSessionState: React.Dispatch<React.SetStateAction<GlobalSessionState>>,
  startSession: () => Promise<void>,
  updateActivityType: () => Promise<void>
) => {
  const location = useLocation();

  // Check if current route is a study route
  const isOnStudyPage = STUDY_ROUTES.some(route => location.pathname.startsWith(route));

  // Handle page navigation - FIXED LOGIC
  useEffect(() => {
    console.log('📍 Navigation detected:', {
      path: location.pathname,
      isOnStudyPage,
      hasActiveSession: sessionState.isActive,
      sessionId: sessionState.sessionId,
      isPaused: sessionState.isPaused
    });

    if (isOnStudyPage) {
      // On a study page
      if (sessionState.isActive) {
        // Session exists - just update activity type and unpause if needed
        console.log('🔄 On study page with existing session - updating activity and unpausing');
        updateActivityType();
        if (sessionState.isPaused) {
          setSessionState(prev => ({ ...prev, isPaused: false }));
          console.log('▶️ Session resumed on study page');
        }
      } else {
        // No session exists - start a new one
        console.log('🚀 On study page with no session - starting new session');
        startSession();
      }
    } else {
      // Not on a study page
      if (sessionState.isActive && !sessionState.isPaused) {
        // Session exists and is active - pause it
        console.log('⏸️ Left study area - pausing session');
        setSessionState(prev => ({ ...prev, isPaused: true }));
      }
    }
  }, [isOnStudyPage, location.pathname]);

  // Separate effect for activity type updates when session exists
  useEffect(() => {
    if (isOnStudyPage && sessionState.isActive && !sessionState.isPaused) {
      updateActivityType();
    }
  }, [location.pathname, isOnStudyPage, sessionState.isActive, sessionState.isPaused]);

  return { isOnStudyPage };
};
