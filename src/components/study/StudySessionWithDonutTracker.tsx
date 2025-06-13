
import { useEffect } from 'react';
import { StudyTimeDonutCounter } from './StudyTimeDonutCounter';
import { useStudyTimeTracker } from '@/hooks/useStudyTimeTracker';

interface StudySessionWithDonutTrackerProps {
  activityType: 'note' | 'flashcard' | 'quiz';
  resourceId?: string;
  resourceName?: string;
  subject?: string;
  cardsStudied?: number;
  correctAnswers?: number;
  quizScore?: number;
  totalQuestions?: number;
  onSessionStart?: () => void;
  onSessionEnd?: () => void;
  triggerStudyActivity?: boolean;
  showDonutCounter?: boolean;
  donutSize?: 'small' | 'medium' | 'large';
  donutPosition?: 'top' | 'side' | 'bottom';
}

export const StudySessionWithDonutTracker = ({
  activityType,
  resourceId,
  resourceName,
  subject,
  cardsStudied = 0,
  correctAnswers = 0,
  quizScore = 0,
  totalQuestions = 0,
  onSessionStart,
  onSessionEnd,
  triggerStudyActivity = false,
  showDonutCounter = true,
  donutSize = 'medium',
  donutPosition = 'side'
}: StudySessionWithDonutTrackerProps) => {
  
  console.log('🔥 [CONFLICTING TRACKER] StudySessionWithDonutTracker is DISABLED to prevent session conflicts');
  console.log('🔥 [CONFLICTING TRACKER] All session management should go through SessionDock only');
  
  // DISABLED: This component was creating competing sessions
  // All session management should go through SessionDock/useBasicSessionTracker only
  
  return (
    <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
      <div className="text-yellow-800 text-sm">
        <strong>Study Session Tracker Disabled</strong>
        <p className="mt-1">
          Session tracking is now managed centrally by SessionDock to prevent conflicts.
          Your study activity is still being tracked properly.
        </p>
      </div>
    </div>
  );
};
