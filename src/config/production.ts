// Production configuration and optimizations

export const PRODUCTION_CONFIG = {
  // Performance thresholds - More lenient for production stability
  MEMORY_WARNING_THRESHOLD: 250, // MB (increased from 200)
  MEMORY_CRITICAL_THRESHOLD: 500, // MB
  
  // Polling intervals (in milliseconds) - Optimized for production
  INTERVALS: {
    HEALTH_CHECK: 1800000,      // 30 minutes (was 10)
    SUBSCRIPTION_CHECK: 1800000, // 30 minutes (was 10)
    REMINDER_CHECK: 900000,     // 15 minutes (was 5)
    ANALYTICS_REFRESH: 900000,  // 15 minutes (was 5)
    PERFORMANCE_MONITOR: 1800000 // 30 minutes (was 2)
  },
  
  // Feature flags - Production optimized
  FEATURES: {
    ENABLE_DEBUG_LOGS: false,
    ENABLE_PERFORMANCE_MONITORING: false, // Disabled by default in production
    ENABLE_MOCK_DATA: false,
    ENABLE_EXPENSIVE_OPERATIONS: false,
    ENABLE_CONSOLE_LOGGING: false, // New flag for console.log elimination
    ENABLE_AGGRESSIVE_MONITORING: false // New flag for intensive monitoring
  },
  
  // Cache settings
  CACHE: {
    STALE_TIME: 300000,    // 5 minutes
    GC_TIME: 600000,       // 10 minutes
    MAX_CACHE_SIZE: 100    // Number of items
  },
  
  // Bundle optimization
  BUNDLE: {
    LAZY_LOAD_ADMIN: true,
    LAZY_LOAD_ANALYTICS: true,
    COMPRESS_IMAGES: true,
    TREE_SHAKE: true
  }
} as const;

export const DEVELOPMENT_CONFIG = {
  INTERVALS: {
    HEALTH_CHECK: 600000,      // 10 minutes (was 5 - less aggressive)
    SUBSCRIPTION_CHECK: 120000, // 2 minutes (was 30s - less aggressive)
    REMINDER_CHECK: 300000,     // 5 minutes (was 1 - less aggressive)
    ANALYTICS_REFRESH: 300000,  // 5 minutes (was 1 - less aggressive)
    PERFORMANCE_MONITOR: 120000 // 2 minutes (was 30s - less aggressive)
  },
  
  FEATURES: {
    ENABLE_DEBUG_LOGS: true,
    ENABLE_PERFORMANCE_MONITORING: true,
    ENABLE_MOCK_DATA: false, // Even in dev, prefer real data
    ENABLE_EXPENSIVE_OPERATIONS: true,
    ENABLE_CONSOLE_LOGGING: true, // Allow console logging in dev
    ENABLE_AGGRESSIVE_MONITORING: true // Allow intensive monitoring in dev
  },
  
  CACHE: {
    STALE_TIME: 30000,     // 30 seconds
    GC_TIME: 120000,       // 2 minutes
    MAX_CACHE_SIZE: 50     // Smaller cache in dev
  }
} as const;

export const getConfig = () => {
  return process.env.NODE_ENV === 'production' ? PRODUCTION_CONFIG : DEVELOPMENT_CONFIG;
};