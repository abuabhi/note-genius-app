
// Simple re-export of the basic session tracker
export { useBasicSessionTracker as useGlobalSessionTracker } from './useBasicSessionTracker';
export type { ActivityType } from './useBasicSessionTracker';

// Import ActivityType for local use in the interface
import type { ActivityType } from './useBasicSessionTracker';

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
