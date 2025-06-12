import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@/config/environment';

interface PerformanceMetrics {
  // Core metrics
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  
  // Cache metrics
  queryCount: number;
  cacheHitRate: number;
  staleQueries: number;
  errorQueries: number;
  
  // User interactions
  totalInteractions: number;
  averageResponseTime: number;
}

interface PerformanceAlert {
  type: 'warning' | 'error';
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: number;
}

const PERFORMANCE_THRESHOLDS = {
  loadTime: 3000, // 3s
  memoryUsage: 150, // 150MB
  cacheHitRate: 60, // 60%
  renderTime: 100 // 100ms
};

const MONITORING_INTERVAL = 30000; // 30 seconds
const MAX_ALERTS = 5;
const MAX_METRICS_HISTORY = 20;

export const useUnifiedPerformanceMonitor = (componentName?: string) => {
  const queryClient = useQueryClient();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    queryCount: 0,
    cacheHitRate: 0,
    staleQueries: 0,
    errorQueries: 0,
    totalInteractions: 0,
    averageResponseTime: 0
  });
  
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const metricsHistoryRef = useRef<PerformanceMetrics[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const renderStartRef = useRef<number>();
  const interactionCountRef = useRef(0);
  const responseTimesRef = useRef<number[]>([]);

  // Track component render time
  useEffect(() => {
    if (componentName) {
      renderStartRef.current = performance.now();
      
      return () => {
        if (renderStartRef.current) {
          const renderTime = performance.now() - renderStartRef.current;
          if (renderTime > PERFORMANCE_THRESHOLDS.renderTime) {
            logger.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
          }
        }
      };
    }
  });

  // Optimized metrics collection
  const collectMetrics = useCallback((): PerformanceMetrics => {
    // Memory usage
    const memoryUsage = 'memory' in performance 
      ? (performance as any).memory.usedJSHeapSize / 1024 / 1024 
      : 0;

    // Navigation timing (only once per page load)
    let loadTime = 0;
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
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
    
    // Response time calculation
    const averageResponseTime = responseTimesRef.current.length > 0
      ? responseTimesRef.current.reduce((a, b) => a + b, 0) / responseTimesRef.current.length
      : 0;

    return {
      loadTime,
      renderTime: renderStartRef.current ? performance.now() - renderStartRef.current : 0,
      memoryUsage,
      queryCount: totalQueries,
      cacheHitRate,
      staleQueries,
      errorQueries,
      totalInteractions: interactionCountRef.current,
      averageResponseTime
    };
  }, [queryClient]);

  // Create alert with throttling
  const createAlert = useCallback((type: PerformanceAlert['type'], message: string, metric: string, value: number, threshold: number) => {
    const now = Date.now();
    
    // Prevent duplicate alerts within 5 minutes
    const recentAlert = alerts.find(alert => 
      alert.metric === metric && 
      now - alert.timestamp < 300000 // 5 minutes
    );
    
    if (recentAlert) return;

    const newAlert: PerformanceAlert = {
      type,
      message,
      metric,
      value,
      threshold,
      timestamp: now
    };

    setAlerts(prev => [newAlert, ...prev.slice(0, MAX_ALERTS - 1)]);
    
    // Log critical alerts
    if (type === 'error') {
      logger.error('Performance Alert:', newAlert);
    } else {
      logger.warn('Performance Alert:', newAlert);
    }
  }, [alerts]);

  // Check for performance issues
  const checkPerformanceThresholds = useCallback((currentMetrics: PerformanceMetrics) => {
    if (currentMetrics.loadTime > PERFORMANCE_THRESHOLDS.loadTime) {
      createAlert('warning', `Slow page load: ${(currentMetrics.loadTime / 1000).toFixed(1)}s`, 'loadTime', currentMetrics.loadTime, PERFORMANCE_THRESHOLDS.loadTime);
    }

    if (currentMetrics.memoryUsage > PERFORMANCE_THRESHOLDS.memoryUsage) {
      createAlert('error', `High memory usage: ${currentMetrics.memoryUsage.toFixed(1)}MB`, 'memoryUsage', currentMetrics.memoryUsage, PERFORMANCE_THRESHOLDS.memoryUsage);
    }

    if (currentMetrics.cacheHitRate < PERFORMANCE_THRESHOLDS.cacheHitRate && currentMetrics.queryCount > 5) {
      createAlert('warning', `Low cache hit rate: ${currentMetrics.cacheHitRate.toFixed(1)}%`, 'cacheHitRate', currentMetrics.cacheHitRate, PERFORMANCE_THRESHOLDS.cacheHitRate);
    }

    // Auto-cleanup cache if too many stale queries
    if (currentMetrics.staleQueries > 20) {
      logger.info('Auto-cleaning stale queries');
      queryClient.getQueryCache().clear();
      createAlert('warning', 'Cache cleared due to excessive stale queries', 'staleQueries', currentMetrics.staleQueries, 20);
    }
  }, [createAlert, queryClient]);

  // Main monitoring loop with proper cleanup
  useEffect(() => {
    const runMonitoring = () => {
      try {
        const currentMetrics = collectMetrics();
        setMetrics(currentMetrics);
        
        // Add to history with size limit
        metricsHistoryRef.current = [
          currentMetrics,
          ...metricsHistoryRef.current.slice(0, MAX_METRICS_HISTORY - 1)
        ];
        
        checkPerformanceThresholds(currentMetrics);
      } catch (error) {
        logger.error('Error in performance monitoring:', error);
      }
    };

    // Run initial check
    runMonitoring();
    
    // Set up interval
    intervalRef.current = setInterval(runMonitoring, MONITORING_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [collectMetrics, checkPerformanceThresholds]);

  // Track user interactions efficiently
  useEffect(() => {
    const trackInteraction = (event: Event) => {
      interactionCountRef.current++;
      const startTime = performance.now();
      
      // Measure response time for clicks
      if (event.type === 'click') {
        requestAnimationFrame(() => {
          const responseTime = performance.now() - startTime;
          responseTimesRef.current.push(responseTime);
          
          // Keep only recent response times
          if (responseTimesRef.current.length > 50) {
            responseTimesRef.current = responseTimesRef.current.slice(-25);
          }
        });
      }
    };

    // Use passive listeners for better performance
    document.addEventListener('click', trackInteraction, { passive: true });
    document.addEventListener('keydown', trackInteraction, { passive: true });

    return () => {
      document.removeEventListener('click', trackInteraction);
      document.removeEventListener('keydown', trackInteraction);
    };
  }, []);

  // Utility functions
  const clearAlerts = useCallback(() => setAlerts([]), []);
  
  const getMetricsHistory = useCallback(() => [...metricsHistoryRef.current], []);
  
  const forceCleanup = useCallback(() => {
    queryClient.getQueryCache().clear();
    queryClient.getMutationCache().clear();
    
    // Reset counters
    interactionCountRef.current = 0;
    responseTimesRef.current = [];
    
    logger.info('Forced performance cleanup completed');
  }, [queryClient]);

  return {
    metrics,
    alerts,
    clearAlerts,
    getMetricsHistory,
    forceCleanup,
    isHealthy: metrics.memoryUsage < PERFORMANCE_THRESHOLDS.memoryUsage && 
               metrics.cacheHitRate > PERFORMANCE_THRESHOLDS.cacheHitRate
  };
};
