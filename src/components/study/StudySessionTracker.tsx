
import { useEffect } from 'react';
import { EnhancedStudySessionTracker } from './EnhancedStudySessionTracker';

interface StudySessionTrackerProps {
  flashcardSetId: string;
  flashcardSetName: string;
  cardsStudied: number;
  onSessionStart?: () => void;
  onSessionEnd?: () => void;
}

export const StudySessionTracker = ({ 
  flashcardSetId, 
  flashcardSetName, 
  cardsStudied,
  onSessionStart,
  onSessionEnd 
}: StudySessionTrackerProps) => {
  // Use the enhanced tracker for flashcard activities
  return (
    <EnhancedStudySessionTracker
      activityType="flashcard"
      resourceId={flashcardSetId}
      resourceName={flashcardSetName}
      cardsStudied={cardsStudied}
      correctAnswers={0} // This would need to be passed from the flashcard component
      onSessionStart={onSessionStart}
      onSessionEnd={onSessionEnd}
    />
  );
};
