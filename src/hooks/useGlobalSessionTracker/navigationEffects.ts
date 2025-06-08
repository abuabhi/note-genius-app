
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { GlobalSessionState, STUDY_ROUTES } from './types';

export const useNavigationEffects = (
  sessionState: GlobalSessionState,
  setSessionState: React.Dispatch<React.SetStateAction<GlobalSessionState>>,
  startSession: () => Promise<void>,
  updateActivityType: () => Promise<void>
) => {
  const location = useLocation();
  const previousIsOnStudyPageRef = useRef<boolean | null>(null);

  // Check if current route is a study route
  const isOnStudyPage = STUDY_ROUTES.some(route => location.pathname.startsWith(route));

  // Handle page navigation with improved logic for session continuity
  useEffect(() => {
    const previousIsOnStudyPage = previousIsOnStudyPageRef.current;
    
    console.log('📍 Navigation detected:', {
      path: location.pathname,
      isOnStudyPage,
      previousIsOnStudyPage,
      hasActiveSession: sessionState.isActive,
      sessionId: sessionState.sessionId,
      isPaused: sessionState.isPaused
    });

    // Update the ref for next navigation
    previousIsOnStudyPageRef.current = isOnStudyPage;

    if (isOnStudyPage) {
      // On a study page
      if (sessionState.isActive) {
        // Session exists - update activity type and unpause if needed
        console.log('🔄 On study page with existing session - updating activity and unpausing');
        updateActivityType();
        if (sessionState.isPaused) {
          setSessionState(prev => ({ ...prev, isPaused: false }));
          console.log('▶️ Session resumed on study page');
        }
      } else if (previousIsOnStudyPage === false || previousIsOnStudyPage === null) {
        // No session exists AND we came from a non-study page (or initial load) - start a new one
        console.log('🚀 Entering study area - starting new session');
        startSession();
      }
      // If previousIsOnStudyPage === true, we're moving between study pages with no active session
      // This shouldn't happen in normal flow, but we don't want to start a new session
    } else {
      // Not on a study page
      if (sessionState.isActive && !sessionState.isPaused && previousIsOnStudyPage === true) {
        // Session exists, is active, and we just left the study area - pause it
        console.log('⏸️ Left study area - pausing session');
        setSessionState(prev => ({ ...prev, isPaused: true }));
      }
    }
  }, [location.pathname, sessionState.isActive, sessionState.isPaused]);

  return { isOnStudyPage };
};
