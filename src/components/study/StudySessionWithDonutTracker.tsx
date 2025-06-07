
import { useEffect } from 'react';
import { StudyTimeDonutCounter } from './StudyTimeDonutCounter';
import { useStudyTimeTracker } from '@/hooks/useStudyTimeTracker';
import { EnhancedStudySessionTracker } from './EnhancedStudySessionTracker';

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
  const {
    isActive,
    isPaused,
    startTime,
    elapsedTime,
    startTracking,
    stopTracking,
    togglePause
  } = useStudyTimeTracker(activityType, resourceId, resourceName);

  // Auto-start tracking when study activity is triggered
  useEffect(() => {
    if (triggerStudyActivity && !isActive) {
      startTracking();
      onSessionStart?.();
    }
  }, [triggerStudyActivity, isActive, startTracking, onSessionStart]);

  // Handle session end
  const handleSessionEnd = () => {
    stopTracking();
    onSessionEnd?.();
  };

  const donutCounter = showDonutCounter ? (
    <StudyTimeDonutCounter
      activityType={activityType}
      isActive={isActive}
      startTime={startTime}
      currentSessionTime={elapsedTime}
      onTogglePause={togglePause}
      size={donutSize}
      className="shrink-0"
    />
  ) : null;

  const enhancedTracker = (
    <EnhancedStudySessionTracker
      activityType={activityType}
      resourceId={resourceId}
      resourceName={resourceName}
      subject={subject}
      cardsStudied={cardsStudied}
      correctAnswers={correctAnswers}
      quizScore={quizScore}
      totalQuestions={totalQuestions}
      onSessionStart={onSessionStart}
      onSessionEnd={handleSessionEnd}
      triggerStudyActivity={isActive}
    />
  );

  // Render based on position preference
  if (donutPosition === 'top') {
    return (
      <div className="space-y-4">
        {donutCounter}
        {enhancedTracker}
      </div>
    );
  }

  if (donutPosition === 'bottom') {
    return (
      <div className="space-y-4">
        {enhancedTracker}
        {donutCounter}
      </div>
    );
  }

  // Side by side layout (default)
  return (
    <div className="flex gap-4 items-start">
      <div className="flex-1">
        {enhancedTracker}
      </div>
      {donutCounter}
    </div>
  );
};
