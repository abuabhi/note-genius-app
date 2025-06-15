
import React, { useEffect } from 'react';
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
  
  // Auto-start note review session when component mounts
  useEffect(() => {
    if (!isActive) {
      const sessionTitle = `Studying: ${noteName}`;
      const sessionSubject = subject || 'Notes';
      
      console.log('🎯 Auto-starting note review session:', sessionTitle);
      startSession('note_review', sessionTitle, sessionSubject);
      onSessionStart?.();
    }
  }, [isActive, startSession, noteName, subject, onSessionStart]);
  
  // Record note study activity when triggered
  useEffect(() => {
    if (triggerStudyActivity && isActive) {
      console.log('📖 Recording note study activity');
      recordActivity();
      updateSessionActivity({
        notes_reviewed: 1
      });
    }
  }, [triggerStudyActivity, isActive, recordActivity, updateSessionActivity]);
  
  return (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="text-blue-800 text-sm">
        <strong>Study Session Active</strong>
        <p className="mt-1">
          Studying: {noteName}
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Session tracking active • Status: {isActive ? 'Recording' : 'Inactive'}
        </p>
      </div>
    </div>
  );
};
