
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
  const previousLocationRef = useRef<string | null>(null);
  const isInitialLoadRef = useRef(true);

  // Check if current route is a study route
  const isOnStudyPage = STUDY_ROUTES.some(route => location.pathname.startsWith(route));
  
  // Check if previous location was a study page
  const wasOnStudyPage = previousLocationRef.current ? 
    STUDY_ROUTES.some(route => previousLocationRef.current!.startsWith(route)) : null;

  // Handle page navigation - ONLY depend on location.pathname to avoid session state race conditions
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
      
      // On initial load, if we're on a study page and no session exists, start one
      if (isOnStudyPage && !sessionState.isActive) {
        console.log('🚀 Initial load on study page - starting session');
        startSession();
      }
      return;
    }

    // Update previous location reference
    previousLocationRef.current = currentPath;

    if (isOnStudyPage && wasOnStudyPage) {
      // Moving between study pages - just update activity type, don't touch session state
      console.log('🔄 Moving between study pages - updating activity type only');
      updateActivityType();
      
    } else if (isOnStudyPage && !wasOnStudyPage) {
      // Entering study area from non-study page
      if (sessionState.isActive && sessionState.isPaused) {
        // Resume existing paused session
        console.log('▶️ Entering study area - resuming paused session');
        setSessionState(prev => ({ ...prev, isPaused: false }));
        updateActivityType();
      } else if (!sessionState.isActive) {
        // Start new session
        console.log('🚀 Entering study area - starting new session');
        startSession();
      }
      
    } else if (!isOnStudyPage && wasOnStudyPage) {
      // Leaving study area for non-study page
      if (sessionState.isActive && !sessionState.isPaused) {
        console.log('⏸️ Leaving study area - pausing session');
        setSessionState(prev => ({ ...prev, isPaused: true }));
      }
    }
    
    // If moving between non-study pages, do nothing
    
  }, [location.pathname]); // ONLY depend on pathname to avoid race conditions

  return { isOnStudyPage };
};
