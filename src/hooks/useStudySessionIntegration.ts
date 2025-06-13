
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useBasicSessionTracker } from './useBasicSessionTracker';

interface StudySessionIntegrationProps {
  setId?: string;
  mode?: string;
  cardsStudied?: number;
  isActive?: boolean;
  // Session methods are now handled internally by the unified system
  updateSessionActivity?: (data: any) => void;
  recordActivity?: () => void;
}

export const useStudySessionIntegration = ({
  setId,
  mode,
  cardsStudied = 0,
  isActive = true,
  updateSessionActivity: externalUpdate = () => {},
  recordActivity: externalRecord = () => {}
}: StudySessionIntegrationProps) => {
  const location = useLocation();
  const isOnStudyPage = ['/flashcards', '/notes', '/quiz', '/study'].some(route => 
    location.pathname.startsWith(route)
  );

  // Use the unified session tracker
  const { recordActivity, updateSessionActivity } = useBasicSessionTracker();

  console.log('🔗 [SESSION INTEGRATION] Using unified session system:', {
    setId,
    mode,
    cardsStudied,
    isActive,
    isOnStudyPage
  });

  // Record activity when cards are studied
  useEffect(() => {
    if (cardsStudied > 0 && isActive && isOnStudyPage) {
      console.log('📚 [SESSION INTEGRATION] Recording flashcard study activity:', cardsStudied);
      recordActivity();
      updateSessionActivity({
        cards_reviewed: cardsStudied
      });
    }
  }, [cardsStudied, isActive, isOnStudyPage, recordActivity, updateSessionActivity]);

  // Record activity on page interactions
  useEffect(() => {
    if (!isActive || !isOnStudyPage) return;

    const handleUserInteraction = () => {
      console.log('👆 [SESSION INTEGRATION] User interaction detected');
      recordActivity();
    };

    const events = ['click', 'keydown', 'scroll', 'mousemove'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [isActive, isOnStudyPage, recordActivity]);

  return {
    recordActivity,
    updateSessionActivity
  };
};
