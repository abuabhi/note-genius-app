
import { useUnifiedSessionTracker } from './useUnifiedSessionTracker';

/**
 * Backwards compatibility wrapper for useUnifiedSessionTracker
 * This ensures existing components continue working with the unified session system
 * READ-ONLY: Does not write to database, only uses unified tracker
 */
export const useBasicSessionTracker = () => {
  const unified = useUnifiedSessionTracker();
  
  return {
    // Map unified tracker properties to basic tracker interface
    isActive: unified.isActive,
    elapsedSeconds: unified.elapsedSeconds,
    isPaused: unified.isPaused,
    isOnStudyPage: unified.isOnStudyPage,
    
    // Map methods - all delegate to unified tracker
    recordActivity: unified.recordActivity,
    updateSessionActivity: unified.updateSessionActivity,
    startSession: (title: string, subject?: string) => {
      return unified.startSession('general', title, subject);
    },
    endSession: unified.endSession,
    togglePause: unified.togglePause
  };
};
