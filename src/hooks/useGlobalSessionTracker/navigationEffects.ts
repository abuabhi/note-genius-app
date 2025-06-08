
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

  // Helper function to determine if both routes are related study routes
  const areRelatedStudyRoutes = (current: string, previous: string | null): boolean => {
    if (!previous) return false;
    
    // Both are flashcard-related routes (including main flashcards page and specific sets)
    if (current.startsWith('/flashcards') && previous.startsWith('/flashcards')) {
      return true;
    }
    
    // Both are note-related routes
    if (current.startsWith('/notes') && previous.startsWith('/notes')) {
      return true;
    }
    
    // Both are quiz-related routes
    if ((current.startsWith('/quiz') || current.startsWith('/quizzes')) && 
        (previous.startsWith('/quiz') || previous.startsWith('/quizzes'))) {
      return true;
    }
    
    return false;
  };

  // Handle page navigation with improved session management - only when path actually changes
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

    // Check if we're moving between related study routes
    const areRelated = areRelatedStudyRoutes(currentPath, previousPath);

    if (isOnStudyPage && wasOnStudyPage && areRelated) {
      // Moving between related study pages - maintain session, just update activity
      console.log('🔄 Moving between related study pages - maintaining session, updating activity only');
      if (sessionState.isActive) {
        updateActivityType();
      } else {
        // Should have a session when on study pages
        console.log('🚀 On study page without session - starting session');
        startSession();
      }
      
    } else if (isOnStudyPage && (!wasOnStudyPage || !areRelated)) {
      // Entering study area from non-study page OR switching between unrelated study areas
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
      // Moving between non-study pages - ensure session is paused if active
      if (sessionState.isActive && !sessionState.isPaused) {
        console.log('⏸️ On non-study page with active session - pausing');
        setSessionState(prev => ({ ...prev, isPaused: true }));
      }
    }
    
  }, [currentPath]); // Only depend on currentPath to prevent excessive calls

  return { isOnStudyPage };
};
