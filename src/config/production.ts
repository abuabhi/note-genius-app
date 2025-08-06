// Production configuration and optimizations

export const PRODUCTION_CONFIG = {
  // Performance thresholds
  MEMORY_WARNING_THRESHOLD: 200, // MB
  MEMORY_CRITICAL_THRESHOLD: 500, // MB
  
  // Polling intervals (in milliseconds)
  INTERVALS: {
    HEALTH_CHECK: 600000,      // 10 minutes
    SUBSCRIPTION_CHECK: 600000, // 10 minutes  
    REMINDER_CHECK: 300000,     // 5 minutes
    ANALYTICS_REFRESH: 300000,  // 5 minutes
    PERFORMANCE_MONITOR: 120000 // 2 minutes
  },
  
  // Feature flags
  FEATURES: {
    ENABLE_DEBUG_LOGS: false,
    ENABLE_PERFORMANCE_MONITORING: false,
    ENABLE_MOCK_DATA: false,
    ENABLE_EXPENSIVE_OPERATIONS: false
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
    HEALTH_CHECK: 300000,      // 5 minutes
    SUBSCRIPTION_CHECK: 30000, // 30 seconds
    REMINDER_CHECK: 60000,     // 1 minute
    ANALYTICS_REFRESH: 60000,  // 1 minute
    PERFORMANCE_MONITOR: 30000 // 30 seconds
  },
  
  FEATURES: {
    ENABLE_DEBUG_LOGS: true,
    ENABLE_PERFORMANCE_MONITORING: true,
    ENABLE_MOCK_DATA: false, // Even in dev, prefer real data
    ENABLE_EXPENSIVE_OPERATIONS: true
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