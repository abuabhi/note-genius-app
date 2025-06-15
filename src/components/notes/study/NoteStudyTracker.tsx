
import React from 'react';
import { useUnifiedSessionTracker } from '@/hooks/useUnifiedSessionTracker';

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
  
  const { recordActivity, updateSessionActivity, isActive, startSession } = useUnifiedSessionTracker();
  
  console.log('📝 [NOTE TRACKER] Using unified session tracker:', {
    noteId,
    noteName,
    isActive,
    triggerStudyActivity
  });
  
  // Auto-start session if not active and user is studying
  React.useEffect(() => {
    if (!isActive && triggerStudyActivity) {
      startSession('note_review', `Studying: ${noteName}`, subject);
      onSessionStart?.();
    }
  }, [isActive, triggerStudyActivity, startSession, noteName, subject, onSessionStart]);
  
  // Record note study activity when triggered
  React.useEffect(() => {
    if (triggerStudyActivity && isActive) {
      recordActivity();
      updateSessionActivity({
        notes_reviewed: 1
      });
    }
  }, [triggerStudyActivity, isActive, recordActivity, updateSessionActivity]);
  
  return (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="text-blue-800 text-sm">
        <strong>Unified Study Tracker</strong>
        <p className="mt-1">
          Studying: {noteName}
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Unified session tracking • Status: {isActive ? 'Active' : 'Inactive'}
        </p>
      </div>
    </div>
  );
};
