
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
  const lastProcessedPathRef = useRef<string | null>(null);

  // Only check route when location actually changes
  const currentPath = location.pathname;
  const isOnStudyPage = isStudyRoute(currentPath);
  
  // Check if previous location was a study page
  const wasOnStudyPage = previousLocationRef.current ? 
    isStudyRoute(previousLocationRef.current) : false;

  // Updated helper function - ALL study routes are now considered related
  const areRelatedStudyRoutes = (current: string, previous: string | null): boolean => {
    if (!previous) return false;
    
    // If both are study routes, they are considered related
    // This prevents session resets when switching between flashcards, notes, and quiz pages
    return isStudyRoute(current) && isStudyRoute(previous);
  };

  // Handle page navigation with improved session management
  useEffect(() => {
    const previousPath = previousLocationRef.current;
    
    // Skip if we've already processed this path to prevent excessive calls
    if (lastProcessedPathRef.current === currentPath) {
      return;
    }
    
    console.log('📍 Navigation detected:', {
      currentPath,
      previousPath,
      isOnStudyPage,
      wasOnStudyPage,
      isInitialLoad: isInitialLoadRef.current,
      hasActiveSession: sessionState.isActive,
      sessionId: sessionState.sessionId,
      isPaused: sessionState.isPaused,
      areRelated: areRelatedStudyRoutes(currentPath, previousPath)
    });

    // Update processed path reference
    lastProcessedPathRef.current = currentPath;

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

    // Check if we're moving between study routes (now all study routes are related)
    const areRelated = areRelatedStudyRoutes(currentPath, previousPath);

    if (isOnStudyPage && wasOnStudyPage && areRelated) {
      // Moving between study pages - maintain session, just update activity type
      console.log('🔄 Moving between study pages - maintaining session, updating activity only');
      if (sessionState.isActive) {
        // Ensure session is not paused when on study pages
        if (sessionState.isPaused) {
          console.log('▶️ Resuming session when moving between study pages');
          setSessionState(prev => ({ ...prev, isPaused: false }));
        }
        updateActivityType();
      } else {
        // Should have a session when on study pages
        console.log('🚀 On study page without session - starting session');
        startSession();
      }
      
    } else if (isOnStudyPage && !wasOnStudyPage) {
      // Entering study area from non-study page
      if (sessionState.isActive) {
        // Resume existing session and ensure it's not paused
        console.log('▶️ Entering study area - resuming existing session');
        setSessionState(prev => ({ ...prev, isPaused: false }));
        updateActivityType();
      } else {
        // Start new session
        console.log('🚀 Entering study area - starting new session');
        startSession();
      }
      
    } else if (!isOnStudyPage && wasOnStudyPage) {
      // Leaving study area for non-study page - pause but don't end session
      // This allows users to return to studying and continue their session
      if (sessionState.isActive && !sessionState.isPaused) {
        console.log('⏸️ Leaving study area - pausing session (can be resumed)');
        setSessionState(prev => ({ ...prev, isPaused: true }));
      }
    } else if (!isOnStudyPage && !wasOnStudyPage) {
      // Moving between non-study pages - ensure session is paused if active
      if (sessionState.isActive && !sessionState.isPaused) {
        console.log('⏸️ On non-study page with active session - pausing');
        setSessionState(prev => ({ ...prev, isPaused: true }));
      }
    }
    
  }, [currentPath]); // Only depend on currentPath to prevent excessive calls

  return { isOnStudyPage };
};
