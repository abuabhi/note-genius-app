
import { useBasicSessionTracker } from '@/hooks/useBasicSessionTracker';

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
  
  const { recordActivity, updateSessionActivity, isActive } = useBasicSessionTracker();
  
  console.log('📝 [NOTE TRACKER] Using unified session via SessionDock:', {
    noteId,
    noteName,
    isActive,
    triggerStudyActivity
  });
  
  // Record note study activity when triggered
  if (triggerStudyActivity && isActive) {
    recordActivity();
    updateSessionActivity({
      notes_reviewed: 1
    });
  }
  
  return (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="text-blue-800 text-sm">
        <strong>Note Study Tracker</strong>
        <p className="mt-1">
          Studying: {noteName}
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Session managed by SessionDock • Status: {isActive ? 'Active' : 'Inactive'}
        </p>
      </div>
    </div>
  );
};
