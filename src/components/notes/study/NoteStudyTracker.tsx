
import { StudySessionWithDonutTracker } from '@/components/study/StudySessionWithDonutTracker';

interface NoteStudyTrackerProps {
  noteId: string;
  noteName: string;
  subject?: string;
  onSessionStart?: () => void;
  onSessionEnd?: () => void;
  triggerStudyActivity?: boolean;
  showDonutCounter?: boolean;
  donutSize?: 'small' | 'medium' | 'large';
  donutPosition?: 'top' | 'side' | 'bottom';
}

export const NoteStudyTracker = ({
  noteId,
  noteName,
  subject,
  onSessionStart,
  onSessionEnd,
  triggerStudyActivity = false,
  showDonutCounter = true,
  donutSize = 'medium',
  donutPosition = 'top'
}: NoteStudyTrackerProps) => {
  return (
    <StudySessionWithDonutTracker
      activityType="note"
      resourceId={noteId}
      resourceName={noteName}
      subject={subject}
      onSessionStart={onSessionStart}
      onSessionEnd={onSessionEnd}
      triggerStudyActivity={triggerStudyActivity}
      showDonutCounter={showDonutCounter}
      donutSize={donutSize}
      donutPosition={donutPosition}
    />
  );
};
