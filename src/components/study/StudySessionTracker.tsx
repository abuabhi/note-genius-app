
import { StudySessionWithDonutTracker } from './StudySessionWithDonutTracker';

interface StudySessionTrackerProps {
  flashcardSetId: string;
  flashcardSetName: string;
  cardsStudied: number;
  correctAnswers?: number;
  onSessionStart?: () => void;
  onSessionEnd?: () => void;
  triggerStudyActivity?: boolean;
  showDonutCounter?: boolean; // New prop to control donut visibility
  donutSize?: 'small' | 'medium' | 'large'; // New prop for donut size
}

export const StudySessionTracker = ({ 
  flashcardSetId, 
  flashcardSetName, 
  cardsStudied,
  correctAnswers = 0,
  onSessionStart,
  onSessionEnd,
  triggerStudyActivity = false,
  showDonutCounter = true,
  donutSize = 'medium'
}: StudySessionTrackerProps) => {
  return (
    <StudySessionWithDonutTracker
      activityType="flashcard"
      resourceId={flashcardSetId}
      resourceName={flashcardSetName}
      subject="Flashcards"
      cardsStudied={cardsStudied}
      correctAnswers={correctAnswers}
      onSessionStart={onSessionStart}
      onSessionEnd={onSessionEnd}
      triggerStudyActivity={triggerStudyActivity}
      showDonutCounter={showDonutCounter}
      donutSize={donutSize}
      donutPosition="side"
    />
  );
};
