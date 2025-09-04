// Initialize performance optimizations for Phase 1 implementation
// This module sets up production-optimized logging, intervals, and monitoring

import { initializeProductionOptimizations } from './performance/buildOptimizations';
import { intervalManager } from './performance/intervalManager';
import { pConsole } from './performance/productionConsole';
import { getConfig } from '@/config/production';

/**
 * Initialize all Phase 1 performance optimizations
 * Called once at app startup
 */
export const initializePhase1Optimizations = () => {
  const config = getConfig();
  
  // 1. Initialize build-time optimizations (console stripping, cleanup, etc.)
  initializeProductionOptimizations();
  
  // 2. Set up performance monitoring based on environment
  if (process.env.NODE_ENV === 'development') {
    pConsole.system.info('Phase 1 Performance Optimizations Initialized', {
      environment: 'development',
      features: config.FEATURES,
      intervals: config.INTERVALS
    });
    
    // Log interval manager status every 5 minutes in dev
    intervalManager.createInterval(
      'performance-status-log',
      () => {
        const status = intervalManager.getStatus();
        if (status.total > 0) {
          pConsole.performance.info('Active Timers Status', status);
        }
      },
      300000, // 5 minutes
      { immediate: false }
    );
  } else {
    // Production: Only log critical initialization
    console.log('🚀 Production optimizations active');
  }
  
  // 3. Set up cleanup on app shutdown
  window.addEventListener('beforeunload', () => {
    intervalManager.cleanupAll();
    pConsole.system.info('Performance cleanup completed');
  });
  
  // 4. Monitor memory usage and alert if high
  if (config.FEATURES.ENABLE_PERFORMANCE_MONITORING) {
    intervalManager.createPerformanceMonitor('memory-check', () => {
      if ('memory' in performance) {
        const memoryMB = (performance as any).memory.usedJSHeapSize / 1024 / 1024;
        // Use hardcoded threshold since config structure varies by environment
        const threshold = process.env.NODE_ENV === 'production' ? 250 : 200;
        if (memoryMB > threshold) {
          pConsole.performance.warn(`High memory usage detected: ${memoryMB.toFixed(1)}MB`);
        }
      }
    });
  }
  
  return {
    intervalManager,
    pConsole,
    config: config.FEATURES
  };
};

/**
 * Get current performance metrics for debugging
 */
export const getPerformanceStatus = () => {
  return {
    environment: process.env.NODE_ENV,
    intervalManager: intervalManager.getStatus(),
    logs: pConsole.getLogs().slice(-10), // Last 10 log entries
    memoryUsage: 'memory' in performance 
      ? (performance as any).memory.usedJSHeapSize / 1024 / 1024 
      : 'unavailable'
  };
};

/**
 * Cleanup function for testing or manual intervention
 */
export const forceCleanup = () => {
  intervalManager.cleanupAll();
  pConsole.clearLogs();
  
  // Force garbage collection if available
  if ('gc' in window && process.env.NODE_ENV === 'development') {
    try {
      (window as any).gc();
      pConsole.performance.info('Manual garbage collection triggered');
    } catch (e) {
      pConsole.performance.warn('Garbage collection not available');
    }
  }
};