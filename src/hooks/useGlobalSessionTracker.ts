
// Simple re-export of the basic session tracker
export { useBasicSessionTracker as useGlobalSessionTracker, type ActivityType } from './useBasicSessionTracker';

// Legacy type for compatibility
export interface SessionState {
  sessionId: string | null;
  isActive: boolean;
  startTime: Date | null;
  elapsedSeconds: number;
  currentActivity: ActivityType | null;
  isPaused: boolean;
  isOnStudyPage: boolean;
}
