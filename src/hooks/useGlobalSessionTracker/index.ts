
// Re-export the unified session tracker as the main interface
export { useUnifiedSessionTracker as useGlobalSessionTracker } from '../useUnifiedSessionTracker';
export type { ActivityType, SessionState, SessionEvent, SessionEventData } from '../useUnifiedSessionTracker';

// Also export the analytics hooks
export { useSessionAnalytics } from '../useSessionAnalytics';
