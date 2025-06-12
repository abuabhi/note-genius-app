
// Simplified session tracker that uses only the basic implementation
export { useBasicSessionTracker as useSessionTracker } from './useBasicSessionTracker';
export type { ActivityType } from './useBasicSessionTracker';

// Legacy compatibility exports
export { useBasicSessionTracker as useGlobalSessionTracker } from './useBasicSessionTracker';
export { useBasicSessionTracker as useOptimizedSessionTracker } from './useBasicSessionTracker';

// Legacy type for compatibility
import type { ActivityType } from './useBasicSessionTracker';

export interface SessionState {
  sessionId: string | null;
  isActive: boolean;
  startTime: Date | null;
  elapsedSeconds: number;
  currentActivity: ActivityType | null;
  isPaused: boolean;
  isOnStudyPage: boolean;
}
