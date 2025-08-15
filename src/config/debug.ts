// Debug Configuration - Single source of truth for all debugging
export const DEBUG_CONFIG = {
  // Set to false to completely disable all debugging features in production
  ENHANCEMENT_FLOW: process.env.NODE_ENV === 'development',
  
  // Sub-features that can be individually controlled
  NETWORK_LOGGING: process.env.NODE_ENV === 'development',
  STATE_LOGGING: process.env.NODE_ENV === 'development',
  UI_DEBUGGER: process.env.NODE_ENV === 'development',
  FLOW_TRACKER: process.env.NODE_ENV === 'development',
} as const;

// Helper function to check if any debugging is enabled
export const isDebugEnabled = () => {
  return Object.values(DEBUG_CONFIG).some(Boolean);
};

// Helper function for conditional debug execution
export const withDebug = <T>(debugEnabled: boolean, debugFn: () => T, fallback?: T): T => {
  return debugEnabled ? debugFn() : (fallback as T);
};