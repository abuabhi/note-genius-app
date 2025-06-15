
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUnifiedSessionTracker } from './useUnifiedSessionTracker';

interface StudySessionIntegrationProps {
  setId?: string;
  mode?: string;
  cardsStudied?: number;
  isActive?: boolean;
}

export const useStudySessionIntegration = ({
  setId,
  mode,
  cardsStudied = 0,
  isActive = true
}: StudySessionIntegrationProps) => {
  const location = useLocation();
  const { recordActivity, updateSessionActivity, isActive: sessionActive, startSession } = useUnifiedSessionTracker();
  
  const isOnStudyPage = ['/flashcards', '/notes', '/quiz', '/study'].some(route => 
    location.pathname.startsWith(route)
  );

  // Auto-start session if on study page and not already active
  useEffect(() => {
    if (isOnStudyPage && !sessionActive && setId) {
      const activityType = location.pathname.includes('flashcards') ? 'flashcard_study' :
                          location.pathname.includes('notes') ? 'note_review' :
                          location.pathname.includes('quiz') ? 'quiz_taking' : 'general';
      
      startSession(activityType, `Study Session - ${setId}`);
    }
  }, [isOnStudyPage, sessionActive, setId, location.pathname, startSession]);

  // Record activity when cards are studied
  useEffect(() => {
    if (cardsStudied > 0 && sessionActive) {
      recordActivity();
      updateSessionActivity({
        cards_reviewed: cardsStudied
      });
    }
  }, [cardsStudied, sessionActive, recordActivity, updateSessionActivity]);

  return {
    isSessionActive: sessionActive,
    recordActivity,
    updateSessionActivity
  };
};
