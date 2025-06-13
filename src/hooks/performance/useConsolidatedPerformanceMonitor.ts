
import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@/config/environment';

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
  memoryUsage: 150, // 150MB
  cacheHitRate: 60, // 60%
  loadTime: 3000, // 3s
  staleQueries: 20
};

// Configurable intervals based on environment
const MONITORING_INTERVALS = {
  development: 15000, // 15 seconds in dev
  production: 300000  // 5 minutes in production
};

const MAX_ALERTS = 3;
const isDevelopment = process.env.NODE_ENV === 'development';

export const useConsolidatedPerformanceMonitor = (enabled = true) => {
  const queryClient = useQueryClient();
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
      renderTime: 0, // Will be set by components that measure render time
      lastUpdate: Date.now()
    };
  }, [queryClient]);

  const createAlert = useCallback((type: PerformanceAlert['type'], message: string, alertKey: string) => {
    // Throttle alerts - only one per key every 5 minutes
    if (alertThrottleRef.current.has(alertKey)) return;
    
    alertThrottleRef.current.add(alertKey);
    setTimeout(() => alertThrottleRef.current.delete(alertKey), 300000); // 5 minutes

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

    if (currentMetrics.cacheHitRate < PERFORMANCE_THRESHOLDS.cacheHitRate && currentMetrics.queryCount > 5) {
      createAlert('warning', `Low cache hit rate: ${currentMetrics.cacheHitRate.toFixed(1)}%`, 'cache');
    }

    if (currentMetrics.loadTime > PERFORMANCE_THRESHOLDS.loadTime) {
      createAlert('warning', `Slow page load: ${(currentMetrics.loadTime / 1000).toFixed(1)}s`, 'load');
    }

    // Auto-cleanup excessive stale queries
    if (currentMetrics.staleQueries > PERFORMANCE_THRESHOLDS.staleQueries) {
      queryClient.getQueryCache().clear();
      createAlert('warning', 'Cache cleared due to excessive stale queries', 'cleanup');
    }
  }, [createAlert, queryClient]);

  const runMonitoring = useCallback(() => {
    if (!enabled) return;
    
    try {
      const currentMetrics = collectMetrics();
      setMetrics(currentMetrics);
      checkPerformanceThresholds(currentMetrics);
    } catch (error) {
      if (isDevelopment) {
        logger.error('Error in performance monitoring:', error);
      }
    }
  }, [enabled, collectMetrics, checkPerformanceThresholds]);

  // Main monitoring effect
  useEffect(() => {
    if (!enabled) return;

    // Run initial check
    runMonitoring();
    
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
  }, [enabled, runMonitoring]);

  const clearAlerts = useCallback(() => setAlerts([]), []);
  
  const forceCleanup = useCallback(() => {
    queryClient.getQueryCache().clear();
    queryClient.getMutationCache().clear();
    alertThrottleRef.current.clear();
    logger.info('Forced performance cleanup completed');
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
    forceCleanup,
    getHealthStatus,
    isHealthy: getHealthStatus() === 'healthy'
  };
};
