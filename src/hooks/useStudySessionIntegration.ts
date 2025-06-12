
import { useEffect } from 'react';
import { useBasicSessionTracker } from '@/hooks/useBasicSessionTracker';
import { useLocation } from 'react-router-dom';

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
  const { updateSessionActivity, recordActivity, isOnStudyPage } = useBasicSessionTracker();
  const location = useLocation();

  // Record activity when cards are studied
  useEffect(() => {
    if (cardsStudied > 0 && isActive && isOnStudyPage) {
      updateSessionActivity({
        cards_reviewed: cardsStudied
      });
    }
  }, [cardsStudied, isActive, isOnStudyPage, updateSessionActivity]);

  // Record activity on page interactions
  useEffect(() => {
    if (!isActive || !isOnStudyPage) return;

    const handleUserInteraction = () => {
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
