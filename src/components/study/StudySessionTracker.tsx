
import { EnhancedStudySessionTracker } from './EnhancedStudySessionTracker';

interface StudySessionTrackerProps {
  flashcardSetId: string;
  flashcardSetName: string;
  cardsStudied: number;
  correctAnswers?: number;
  onSessionStart?: () => void;
  onSessionEnd?: () => void;
  triggerStudyActivity?: boolean; // New prop to control when session starts
}

export const StudySessionTracker = ({ 
  flashcardSetId, 
  flashcardSetName, 
  cardsStudied,
  correctAnswers = 0,
  onSessionStart,
  onSessionEnd,
  triggerStudyActivity = false
}: StudySessionTrackerProps) => {
  // Use the enhanced tracker for flashcard activities with adaptive learning integration
  return (
    <EnhancedStudySessionTracker
      activityType="flashcard"
      resourceId={flashcardSetId}
      resourceName={flashcardSetName}
      subject="Flashcards" // Could be extracted from flashcard set data
      cardsStudied={cardsStudied}
      correctAnswers={correctAnswers}
      onSessionStart={onSessionStart}
      onSessionEnd={onSessionEnd}
      triggerStudyActivity={triggerStudyActivity}
    />
  );
};
