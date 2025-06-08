
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
  const sessionStartedRef = useRef(false);

  // Check if current route is a study route
  const isOnStudyPage = STUDY_ROUTES.some(route => location.pathname.startsWith(route));
  
  // Check if previous location was a study page
  const wasOnStudyPage = previousLocationRef.current ? 
    STUDY_ROUTES.some(route => previousLocationRef.current!.startsWith(route)) : null;

  // Check if we're moving between flashcard sets (same study context)
  const isFlashcardNavigation = (current: string, previous: string | null) => {
    if (!previous) return false;
    return current.startsWith('/flashcards/') && previous.startsWith('/flashcards/');
  };

  // Check if we're moving between flashcard study and flashcard list (maintain session)
  const isFlashcardContextNavigation = (current: string, previous: string | null) => {
    if (!previous) return false;
    const isCurrentFlashcardStudy = current.match(/^\/flashcards\/[^\/]+\/study$/);
    const isCurrentFlashcardList = current === '/flashcards';
    const isPreviousFlashcardStudy = previous.match(/^\/flashcards\/[^\/]+\/study$/);
    const isPreviousFlashcardList = previous === '/flashcards';
    
    return (isCurrentFlashcardStudy && isPreviousFlashcardList) || 
           (isCurrentFlashcardList && isPreviousFlashcardStudy) ||
           (isCurrentFlashcardStudy && isPreviousFlashcardStudy); // Moving between different flashcard studies
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
      sessionStarted: sessionStartedRef.current,
      isFlashcardNavigation: isFlashcardNavigation(currentPath, previousPath),
      isFlashcardContextNavigation: isFlashcardContextNavigation(currentPath, previousPath)
    });

    // Skip processing on initial load to avoid unwanted session creation
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      previousLocationRef.current = currentPath;
      
      // On initial load, only start session if on study page and no active session
      if (isOnStudyPage && !sessionState.isActive && !sessionStartedRef.current) {
        console.log('🚀 Initial load on study page - starting session');
        sessionStartedRef.current = true;
        startSession();
      }
      return;
    }

    // Update previous location reference
    previousLocationRef.current = currentPath;

    // Handle flashcard context navigation (maintain session across flashcard study and list)
    if (isFlashcardContextNavigation(currentPath, previousPath)) {
      console.log('🔄 Moving within flashcard context - maintaining session');
      if (sessionState.isActive) {
        // Just update activity type without disrupting the session
        updateActivityType();
      }
      return;
    }

    // Handle general flashcard-to-flashcard navigation (maintain session)
    if (isFlashcardNavigation(currentPath, previousPath)) {
      console.log('🔄 Moving between flashcard sets - maintaining session');
      if (sessionState.isActive) {
        // Just update activity type without disrupting the session
        updateActivityType();
      }
      return;
    }

    if (isOnStudyPage && wasOnStudyPage) {
      // Moving between study pages (but not flashcard-to-flashcard) - just update activity type
      console.log('🔄 Moving between study pages - updating activity type only');
      if (sessionState.isActive) {
        updateActivityType();
      }
      
    } else if (isOnStudyPage && !wasOnStudyPage) {
      // Entering study area from non-study page
      if (sessionState.isActive && sessionState.isPaused) {
        // Resume existing paused session
        console.log('▶️ Entering study area - resuming paused session');
        setSessionState(prev => ({ ...prev, isPaused: false }));
        updateActivityType();
      } else if (!sessionState.isActive && !sessionStartedRef.current) {
        // Start new session only if we haven't already started one
        console.log('🚀 Entering study area - starting new session');
        sessionStartedRef.current = true;
        startSession();
      }
      
    } else if (!isOnStudyPage && wasOnStudyPage) {
      // Leaving study area for non-study page (but not if going to flashcard list from flashcard study)
      const leavingFlashcardContextForNonStudy = previousPath?.match(/^\/flashcards/) && !currentPath.startsWith('/flashcards');
      
      if (sessionState.isActive && !sessionState.isPaused && leavingFlashcardContextForNonStudy) {
        console.log('⏸️ Leaving flashcard study area for non-study page - pausing session');
        setSessionState(prev => ({ ...prev, isPaused: true }));
      }
    }
    
    // Reset session started flag when leaving study pages completely (but not for flashcard context navigation)
    if (!isOnStudyPage && !currentPath.startsWith('/flashcards')) {
      sessionStartedRef.current = false;
    }
    
  }, [location.pathname, isOnStudyPage, wasOnStudyPage, sessionState.isActive, sessionState.isPaused]);

  return { isOnStudyPage };
};
