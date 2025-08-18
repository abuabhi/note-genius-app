// Debug Configuration - Single source of truth for all debugging
export const DEBUG_CONFIG = {
  // Set to false to completely disable all debugging features
  ENHANCEMENT_FLOW: false,
  
  // Sub-features that can be individually controlled
  NETWORK_LOGGING: false,
  STATE_LOGGING: false,
  UI_DEBUGGER: false,
  FLOW_TRACKER: false,
  SESSION_LOGGING: false, // Session recovery, persistence, and timer logs
} as const;

// Helper function to check if any debugging is enabled
export const isDebugEnabled = () => {
  return Object.values(DEBUG_CONFIG).some(Boolean);
};

// Helper function for conditional debug execution
export const withDebug = <T>(debugEnabled: boolean, debugFn: () => T, fallback?: T): T => {
  return debugEnabled ? debugFn() : (fallback as T);
};