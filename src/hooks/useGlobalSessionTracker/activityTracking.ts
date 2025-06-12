
import { useCallback } from 'react';
import { GlobalSessionState } from './types';
import { useVisibilityAndIdleDetection } from './visibilityAndIdleDetection';

export const useActivityTracking = (
  sessionState: GlobalSessionState,
  setSessionState: React.Dispatch<React.SetStateAction<GlobalSessionState>>,
  isOnStudyPage: boolean
) => {
  // Use the new visibility and idle detection hook
  const { recordActivity: recordUserActivity } = useVisibilityAndIdleDetection({
    sessionState,
    setSessionState,
    isOnStudyPage
  });

  // Legacy recordActivity function for backwards compatibility
  const recordActivity = useCallback(() => {
    recordUserActivity();
  }, [recordUserActivity]);

  return { recordActivity };
};
