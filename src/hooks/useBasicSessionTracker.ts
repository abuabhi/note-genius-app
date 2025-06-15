
import { useUnifiedSessionTracker } from './useUnifiedSessionTracker';

/**
 * Backwards compatibility wrapper for useUnifiedSessionTracker
 * This allows existing components to continue working while using the unified system
 */
export const useBasicSessionTracker = () => {
  const unified = useUnifiedSessionTracker();
  
  console.log('🔄 [BASIC SESSION TRACKER] Redirecting to unified session tracker');
  
  return {
    // Map unified tracker properties to basic tracker interface
    isActive: unified.isActive,
    elapsedSeconds: unified.elapsedSeconds,
    isPaused: unified.isPaused,
    isOnStudyPage: unified.isOnStudyPage,
    
    // Map methods
    recordActivity: unified.recordActivity,
    updateSessionActivity: unified.updateSessionActivity,
    startSession: (title: string, subject?: string) => {
      return unified.startSession('general', title, subject);
    },
    endSession: unified.endSession,
    togglePause: unified.togglePause
  };
};
