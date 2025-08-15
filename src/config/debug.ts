// Debug Configuration - Single source of truth for all debugging
export const DEBUG_CONFIG = {
  // Set to false to completely disable all debugging features
  ENHANCEMENT_FLOW: true,
  
  // Sub-features that can be individually controlled
  NETWORK_LOGGING: true,
  STATE_LOGGING: true,
  UI_DEBUGGER: true,
  FLOW_TRACKER: true,
} as const;

// Helper function to check if any debugging is enabled
export const isDebugEnabled = () => {
  return Object.values(DEBUG_CONFIG).some(Boolean);
};

// Helper function for conditional debug execution
export const withDebug = <T>(debugEnabled: boolean, debugFn: () => T, fallback?: T): T => {
  return debugEnabled ? debugFn() : (fallback as T);
};