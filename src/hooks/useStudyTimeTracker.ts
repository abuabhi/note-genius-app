
import { useState, useEffect, useCallback } from 'react';

interface StudyTimeTrackerState {
  isActive: boolean;
  isPaused: boolean;
  startTime: Date | null;
  elapsedTime: number;
  sessionId: string | null;
}

export const useStudyTimeTracker = (
  activityType: 'note' | 'flashcard' | 'quiz',
  resourceId?: string,
  resourceName?: string
) => {
  const [state, setState] = useState<StudyTimeTrackerState>({
    isActive: false,
    isPaused: false,
    startTime: null,
    elapsedTime: 0,
    sessionId: null
  });

  console.log('🚫 [STUDY TIME TRACKER] DISABLED - All session tracking now handled by SessionDock to prevent conflicts');
  console.log('🚫 [STUDY TIME TRACKER] Activity type received but ignored:', activityType);

  // DISABLED: All tracking functions now return no-ops
  const startTracking = useCallback(async () => {
    console.log('🚫 [STUDY TIME TRACKER] startTracking DISABLED - Use SessionDock instead');
    // Don't start tracking - SessionDock handles this
  }, []);

  const stopTracking = useCallback(async () => {
    console.log('🚫 [STUDY TIME TRACKER] stopTracking DISABLED - Use SessionDock instead');
    // Don't stop tracking - SessionDock handles this
  }, []);

  const togglePause = useCallback(() => {
    console.log('🚫 [STUDY TIME TRACKER] togglePause DISABLED - Use SessionDock instead');
    // Don't toggle pause - SessionDock handles this
  }, []);

  return {
    ...state,
    startTracking,
    stopTracking,
    togglePause,
    isLoading: false
  };
};
