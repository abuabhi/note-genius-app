import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@/config/environment';
import { useStableTabVisibility } from './useStableTabVisibility';

interface ConsolidatedMetrics {
  memoryUsage: number;
  queryCount: number;
  cacheHitRate: number;
  staleQueries: number;
  errorQueries: number;
  loadTime: number;
  renderTime: number;
  lastUpdate: number;
}

interface PerformanceAlert {
  type: 'warning' | 'error';
  message: string;
  timestamp: number;
}

const PERFORMANCE_THRESHOLDS = {
  memoryUsage: 200, // Increased from 150MB to 200MB for production
  cacheHitRate: 50, // Reduced from 60% to 50% to be less aggressive
  loadTime: 5000, // Increased from 3s to 5s for production
  staleQueries: 50 // Increased from 20 to 50 to be less aggressive
};

// Optimized intervals for production
const MONITORING_INTERVALS = {
  development: 30000, // 30 seconds in dev (increased from 15s)
  production: 600000  // 10 minutes in production (increased from 5min)
};

const MAX_ALERTS = 3;
const isDevelopment = process.env.NODE_ENV === 'development';

export const useOptimizedPerformanceMonitor = (enabled = true) => {
  const queryClient = useQueryClient();
  const isTabVisible = useStableTabVisibility(1000); // 1 second debounce for performance
  const [metrics, setMetrics] = useState<ConsolidatedMetrics>({
    memoryUsage: 0,
    queryCount: 0,
    cacheHitRate: 0,
    staleQueries: 0,
    errorQueries: 0,
    loadTime: 0,
    renderTime: 0,
    lastUpdate: 0
  });
  
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const alertThrottleRef = useRef<Set<string>>(new Set());

  const collectMetrics = useCallback((): ConsolidatedMetrics => {
    // Memory usage (only if available)
    const memoryUsage = 'memory' in performance 
      ? (performance as any).memory.usedJSHeapSize / 1024 / 1024 
      : 0;

    // Navigation timing (cached after first load)
    let loadTime = 0;
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation && navigation.loadEventEnd > 0) {
      loadTime = navigation.loadEventEnd - navigation.loadEventStart;
    }

    // Cache metrics
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    const totalQueries = queries.length;
    const cachedQueries = queries.filter(q => q.state.data !== undefined).length;
    const staleQueries = queries.filter(q => q.isStale()).length;
    const errorQueries = queries.filter(q => q.state.status === 'error').length;
    
    const cacheHitRate = totalQueries > 0 ? (cachedQueries / totalQueries) * 100 : 0;

    return {
      memoryUsage,
      queryCount: totalQueries,
      cacheHitRate,
      staleQueries,
      errorQueries,
      loadTime,
      renderTime: 0,
      lastUpdate: Date.now()
    };
  }, [queryClient]);

  const createAlert = useCallback((type: PerformanceAlert['type'], message: string, alertKey: string) => {
    // Throttle alerts - only one per key every 10 minutes in production
    if (alertThrottleRef.current.has(alertKey)) return;
    
    alertThrottleRef.current.add(alertKey);
    const throttleTime = isDevelopment ? 300000 : 600000; // 5min dev, 10min prod
    setTimeout(() => alertThrottleRef.current.delete(alertKey), throttleTime);

    const newAlert: PerformanceAlert = {
      type,
      message,
      timestamp: Date.now()
    };

    setAlerts(prev => [newAlert, ...prev.slice(0, MAX_ALERTS - 1)]);
    
    if (isDevelopment) {
      logger.warn('Performance Alert:', newAlert);
    }
  }, []);

  const checkPerformanceThresholds = useCallback((currentMetrics: ConsolidatedMetrics) => {
    if (currentMetrics.memoryUsage > PERFORMANCE_THRESHOLDS.memoryUsage) {
      createAlert('error', `High memory usage: ${currentMetrics.memoryUsage.toFixed(1)}MB`, 'memory');
    }

    if (currentMetrics.cacheHitRate < PERFORMANCE_THRESHOLDS.cacheHitRate && currentMetrics.queryCount > 10) {
      createAlert('warning', `Low cache hit rate: ${currentMetrics.cacheHitRate.toFixed(1)}%`, 'cache');
    }

    if (currentMetrics.loadTime > PERFORMANCE_THRESHOLDS.loadTime) {
      createAlert('warning', `Slow page load: ${(currentMetrics.loadTime / 1000).toFixed(1)}s`, 'load');
    }

    // Less aggressive cache cleanup - only warn, don't auto-clear
    if (currentMetrics.staleQueries > PERFORMANCE_THRESHOLDS.staleQueries) {
      createAlert('warning', `Many stale queries: ${currentMetrics.staleQueries}. Consider manual cleanup.`, 'stale');
    }
  }, [createAlert]);

  const runMonitoring = useCallback(() => {
    // Don't run if disabled, tab not visible, or in production and not explicitly enabled
    if (!enabled || !isTabVisible || (!isDevelopment && !enabled)) return;
    
    try {
      const currentMetrics = collectMetrics();
      setMetrics(currentMetrics);
      checkPerformanceThresholds(currentMetrics);
    } catch (error) {
      if (isDevelopment) {
        logger.error('Error in performance monitoring:', error);
      }
    }
  }, [enabled, isTabVisible, collectMetrics, checkPerformanceThresholds]);

  // Main monitoring effect
  useEffect(() => {
    if (!enabled) return;

    // Run initial check only if tab is visible
    if (isTabVisible) {
      runMonitoring();
    }
    
    // Set up interval based on environment
    const interval = isDevelopment 
      ? MONITORING_INTERVALS.development 
      : MONITORING_INTERVALS.production;
    
    intervalRef.current = setInterval(runMonitoring, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, runMonitoring, isTabVisible]);

  const clearAlerts = useCallback(() => setAlerts([]), []);
  
  const manualCleanup = useCallback(() => {
    // Only clear on manual request, not automatically
    queryClient.getQueryCache().clear();
    queryClient.getMutationCache().clear();
    alertThrottleRef.current.clear();
    logger.info('Manual performance cleanup completed');
  }, [queryClient]);

  const getHealthStatus = useCallback(() => {
    const { memoryUsage, cacheHitRate } = metrics;
    const hasIssues = memoryUsage > PERFORMANCE_THRESHOLDS.memoryUsage || 
                     cacheHitRate < PERFORMANCE_THRESHOLDS.cacheHitRate;
    return hasIssues ? 'warning' : 'healthy';
  }, [metrics]);

  return {
    metrics,
    alerts,
    clearAlerts,
    manualCleanup,
    getHealthStatus,
    isHealthy: getHealthStatus() === 'healthy',
    isTabVisible
  };
};