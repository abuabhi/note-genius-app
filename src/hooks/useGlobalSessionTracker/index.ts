
// Re-export the basic session tracker
export { useBasicSessionTracker as useGlobalSessionTracker, ActivityType } from '../useBasicSessionTracker';

// Legacy compatibility
export interface SessionState {
  sessionId: string | null;
  isActive: boolean;
  startTime: Date | null;
  elapsedSeconds: number;
  currentActivity: ActivityType | null;
  isPaused: boolean;
  isOnStudyPage: boolean;
}
