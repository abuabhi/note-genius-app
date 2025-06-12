
// Optimized session tracker that replaces all previous session tracking implementations
export { useOptimizedSessionTracker as useSessionTracker } from './session/useOptimizedSessionTracker';
export type { ActivityType } from './session/useOptimizedSessionTracker';

// Legacy compatibility exports
export { useOptimizedSessionTracker as useGlobalSessionTracker } from './session/useOptimizedSessionTracker';
export { useOptimizedSessionTracker as useBasicSessionTracker } from './session/useOptimizedSessionTracker';
