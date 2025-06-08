
import { CompactFloatingTimer } from './CompactFloatingTimer';

interface StudySessionTrackerProps {
  flashcardSetId: string;
  flashcardSetName: string;
  cardsStudied: number;
  correctAnswers?: number;
  onSessionStart?: () => void;
  onSessionEnd?: () => void;
  triggerStudyActivity?: boolean;
  showDonutCounter?: boolean; // Keep for backward compatibility
  donutSize?: 'small' | 'medium' | 'large'; // Keep for backward compatibility
}

export const StudySessionTracker = ({ 
  triggerStudyActivity = false,
}: StudySessionTrackerProps) => {
  return (
    <CompactFloatingTimer
      activityType="flashcard"
      triggerStudyActivity={triggerStudyActivity}
    />
  );
};
