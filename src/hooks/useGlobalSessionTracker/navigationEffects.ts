
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { GlobalSessionState, isStudyRoute } from './types';

export const useNavigationEffects = (
  sessionState: GlobalSessionState,
  setSessionState: React.Dispatch<React.SetStateAction<GlobalSessionState>>,
  startSession: () => Promise<void>,
  updateActivityType: () => Promise<void>
) => {
  const location = useLocation();
  const previousLocationRef = useRef<string | null>(null);
  const isInitialLoadRef = useRef(true);

  // Check if current route is a study route using the helper function
  const isOnStudyPage = isStudyRoute(location.pathname);
  
  // Check if previous location was a study page
  const wasOnStudyPage = previousLocationRef.current ? 
    isStudyRoute(previousLocationRef.current) : false;

  console.log('🔍 Route analysis:', {
    currentPath: location.pathname,
    previousPath: previousLocationRef.current,
    isOnStudyPage,
    wasOnStudyPage,
    hasActiveSession: sessionState.isActive
  });

  // Handle page navigation with improved session management
  useEffect(() => {
    const currentPath = location.pathname;
    const previousPath = previousLocationRef.current;
    
    console.log('📍 Navigation detected:', {
      currentPath,
      previousPath,
      isOnStudyPage,
      wasOnStudyPage,
      isInitialLoad: isInitialLoadRef.current,
      hasActiveSession: sessionState.isActive,
      sessionId: sessionState.sessionId,
      isPaused: sessionState.isPaused
    });

    // Skip processing on initial load to avoid unwanted session creation
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      previousLocationRef.current = currentPath;
      
      // On initial load, only start session if on study page and no active session
      if (isOnStudyPage && !sessionState.isActive) {
        console.log('🚀 Initial load on study page - starting session');
        startSession();
      }
      return;
    }

    // Update previous location reference
    previousLocationRef.current = currentPath;

    if (isOnStudyPage && wasOnStudyPage) {
      // Moving between different study pages - maintain session, update activity
      console.log('🔄 Moving between study pages - updating activity type only');
      if (sessionState.isActive) {
        updateActivityType();
      } else {
        // Should have a session when on study pages
        console.log('🚀 On study page without session - starting session');
        startSession();
      }
      
    } else if (isOnStudyPage && !wasOnStudyPage) {
      // Entering study area from non-study page
      if (sessionState.isActive && sessionState.isPaused) {
        // Resume existing paused session
        console.log('▶️ Entering study area - resuming paused session');
        setSessionState(prev => ({ ...prev, isPaused: false }));
        updateActivityType();
      } else if (!sessionState.isActive) {
        // Start new session
        console.log('🚀 Entering study area - starting session');
        startSession();
      } else {
        // Already have active session, just update activity
        updateActivityType();
      }
      
    } else if (!isOnStudyPage && wasOnStudyPage) {
      // Leaving study area for non-study page - pause session
      if (sessionState.isActive && !sessionState.isPaused) {
        console.log('⏸️ Leaving study area for non-study page - pausing session');
        setSessionState(prev => ({ ...prev, isPaused: true }));
      }
    } else if (!isOnStudyPage && !wasOnStudyPage) {
      // Moving between non-study pages - ensure no active session
      if (sessionState.isActive && !sessionState.isPaused) {
        console.log('⏸️ On non-study page with active session - pausing');
        setSessionState(prev => ({ ...prev, isPaused: true }));
      }
    }
    
  }, [location.pathname, isOnStudyPage, wasOnStudyPage, sessionState.isActive, sessionState.isPaused]);

  return { isOnStudyPage };
};
