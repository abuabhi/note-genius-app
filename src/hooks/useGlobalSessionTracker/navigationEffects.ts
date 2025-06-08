
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

  // Check if we're staying within flashcard study context
  const isFlashcardStudyContext = (current: string, previous: string | null) => {
    if (!previous) return false;
    
    // All these paths should maintain the same session
    const flashcardPaths = [
      '/flashcards',
      /^\/flashcards\/[^\/]+\/study$/,
    ];
    
    const isCurrentFlashcard = flashcardPaths.some(path => 
      typeof path === 'string' ? current === path : path.test(current)
    );
    const isPreviousFlashcard = flashcardPaths.some(path => 
      typeof path === 'string' ? previous === path : path.test(previous)
    );
    
    return isCurrentFlashcard && isPreviousFlashcard;
  };

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
      isPaused: sessionState.isPaused,
      isFlashcardStudyContext: isFlashcardStudyContext(currentPath, previousPath)
    });

    // Skip processing on initial load to avoid unwanted session creation
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      previousLocationRef.current = currentPath;
      
      // On initial load, only start session if on study page and no active session
      if (isOnStudyPage && !sessionState.isActive) {
        console.log('🚀 Initial load on study page - starting or restoring session');
        startSession();
      }
      return;
    }

    // Update previous location reference
    previousLocationRef.current = currentPath;

    // Handle flashcard study context - MAINTAIN SESSION
    if (isFlashcardStudyContext(currentPath, previousPath)) {
      console.log('🔄 Staying within flashcard study context - maintaining session');
      if (sessionState.isActive) {
        // Just update activity type without disrupting the session
        updateActivityType();
      } else {
        // No active session but we're in study context, start/restore one
        console.log('🚀 No active session in study context - starting session');
        startSession();
      }
      return;
    }

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
        // Start new session or restore existing one
        console.log('🚀 Entering study area - starting/restoring session');
        startSession();
      } else {
        // Already have active session, just update activity
        updateActivityType();
      }
      
    } else if (!isOnStudyPage && wasOnStudyPage) {
      // Leaving study area for non-study page
      // Only pause if we're truly leaving study context (not flashcard list)
      if (sessionState.isActive && !sessionState.isPaused && !currentPath.startsWith('/flashcards')) {
        console.log('⏸️ Leaving study area for non-study page - pausing session');
        setSessionState(prev => ({ ...prev, isPaused: true }));
      }
    }
    
  }, [location.pathname, isOnStudyPage, wasOnStudyPage, sessionState.isActive, sessionState.isPaused]);

  return { isOnStudyPage };
};
