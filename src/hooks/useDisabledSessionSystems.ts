
// This hook disables all other session tracking systems to prevent conflicts
// Only useUnifiedSessionTracker should be used for session management

export const useDisabledSessionSystems = () => {
  console.warn('⚠️ [DISABLED SESSION SYSTEM] This session system has been disabled. Use useUnifiedSessionTracker instead.');
  
  return {
    // Return disabled/no-op functions to prevent crashes
    startSession: () => Promise.resolve(false),
    endSession: () => Promise.resolve(),
    isActive: false,
    sessionId: null,
    recordActivity: () => {},
    updateSession: () => {},
    // Add any other common session system methods as no-ops
  };
};
