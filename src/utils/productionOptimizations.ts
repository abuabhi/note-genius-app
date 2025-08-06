// Production optimization utilities

/**
 * Optimized polling intervals for production
 */
export const PRODUCTION_INTERVALS = {
  // Core system checks
  HEALTH_CHECK: 600000, // 10 minutes
  SUBSCRIPTION_CHECK: 600000, // 10 minutes
  REMINDER_CHECK: 300000, // 5 minutes
  
  // Analytics and monitoring
  ANALYTICS_REFRESH: 300000, // 5 minutes
  PERFORMANCE_MONITORING: 120000, // 2 minutes
  
  // Development intervals (much more frequent)
  DEV_HEALTH_CHECK: 300000, // 5 minutes
  DEV_SUBSCRIPTION_CHECK: 30000, // 30 seconds
  DEV_REMINDER_CHECK: 60000, // 1 minute
} as const;

/**
 * Get interval based on environment
 */
export const getOptimizedInterval = (
  productionInterval: number, 
  developmentInterval: number
): number => {
  return process.env.NODE_ENV === 'production' ? productionInterval : developmentInterval;
};

/**
 * Production console.log wrapper - only logs in development
 */
export const debugLog = (message: string, ...args: any[]): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, ...args);
  }
};

/**
 * Performance measurement wrapper
 */
export const measurePerformance = async <T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> => {
  const start = performance.now();
  try {
    const result = await operation();
    const duration = performance.now() - start;
    
    // Only log performance in development
    debugLog(`⚡ ${operationName} completed in ${duration.toFixed(2)}ms`);
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    debugLog(`❌ ${operationName} failed after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
};

/**
 * Check if we should enable expensive features based on environment
 */
export const shouldEnableExpensiveFeatures = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Production-ready error handler
 */
export const handleProductionError = (error: Error, context: string): void => {
  if (process.env.NODE_ENV === 'production') {
    // In production, send to error tracking service
    // For now, just log minimal info
    console.error(`[${context}] Error:`, error.message);
  } else {
    // In development, log full error details
    console.error(`[${context}] Error:`, error);
  }
};