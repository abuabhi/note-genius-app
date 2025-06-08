import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface CacheMetrics {
  hitRate: number;
  missRate: number;
  totalQueries: number;
  activeQueries: number;
  staleQueries: number;
  errorQueries: number;
  memoryUsage: number;
  averageQueryTime: number;
  topSlowQueries: Array<{ queryKey: string; duration: number }>;
}

interface PerformanceAlert {
  type: 'warning' | 'error';
  message: string;
  timestamp: number;
  metric: string;
  value: number;
  threshold: number;
}

export const useCacheMonitoring = () => {
  const queryClient = useQueryClient();
  const [metrics, setMetrics] = useState<CacheMetrics>({
    hitRate: 0,
    missRate: 0,
    totalQueries: 0,
    activeQueries: 0,
    staleQueries: 0,
    errorQueries: 0,
    memoryUsage: 0,
    averageQueryTime: 0,
    topSlowQueries: []
  });
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  
  const metricsRef = useRef({
    hits: 0,
    misses: 0,
    queryTimes: [] as number[],
    slowQueries: [] as Array<{ queryKey: string; duration: number }>
  });

  // Performance thresholds
  const thresholds = {
    hitRate: 0.8, // 80% minimum hit rate
    averageQueryTime: 1000, // 1 second max average
    memoryUsage: 50 * 1024 * 1024, // 50MB max
    staleQueriesPercent: 0.3 // 30% max stale queries
  };

  // Track query performance
  const trackQueryPerformance = useCallback((queryKey: string[], duration: number, isHit: boolean) => {
    const metrics = metricsRef.current;
    
    if (isHit) {
      metrics.hits++;
    } else {
      metrics.misses++;
    }

    metrics.queryTimes.push(duration);
    if (metrics.queryTimes.length > 100) {
      metrics.queryTimes.shift(); // Keep only last 100
    }

    if (duration > 500) { // Track slow queries (>500ms)
      metrics.slowQueries.push({
        queryKey: queryKey.join(':'),
        duration
      });
      
      // Keep only top 10 slowest
      metrics.slowQueries.sort((a, b) => b.duration - a.duration);
      metrics.slowQueries = metrics.slowQueries.slice(0, 10);
    }
  }, []);

  // Calculate current metrics
  const calculateMetrics = useCallback((): CacheMetrics => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    const metrics = metricsRef.current;
    
    const total = metrics.hits + metrics.misses;
    const hitRate = total > 0 ? metrics.hits / total : 0;
    const missRate = total > 0 ? metrics.misses / total : 0;
    
    const averageQueryTime = metrics.queryTimes.length > 0
      ? metrics.queryTimes.reduce((a, b) => a + b, 0) / metrics.queryTimes.length
      : 0;

    const memoryUsage = JSON.stringify(queries.map(q => q.state.data)).length;

    return {
      hitRate,
      missRate,
      totalQueries: queries.length,
      activeQueries: queries.filter(q => q.getObserversCount() > 0).length,
      staleQueries: queries.filter(q => q.isStale()).length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
      memoryUsage,
      averageQueryTime,
      topSlowQueries: [...metrics.slowQueries]
    };
  }, [queryClient]);

  // Check for performance issues and create alerts
  const checkPerformanceAlerts = useCallback((currentMetrics: CacheMetrics) => {
    const newAlerts: PerformanceAlert[] = [];
    const now = Date.now();

    // Hit rate too low
    if (currentMetrics.hitRate < thresholds.hitRate && currentMetrics.totalQueries > 10) {
      newAlerts.push({
        type: 'warning',
        message: `Cache hit rate is low: ${(currentMetrics.hitRate * 100).toFixed(1)}%`,
        timestamp: now,
        metric: 'hitRate',
        value: currentMetrics.hitRate,
        threshold: thresholds.hitRate
      });
    }

    // Average query time too high
    if (currentMetrics.averageQueryTime > thresholds.averageQueryTime) {
      newAlerts.push({
        type: 'warning',
        message: `Average query time is high: ${currentMetrics.averageQueryTime.toFixed(0)}ms`,
        timestamp: now,
        metric: 'averageQueryTime',
        value: currentMetrics.averageQueryTime,
        threshold: thresholds.averageQueryTime
      });
    }

    // Memory usage too high
    if (currentMetrics.memoryUsage > thresholds.memoryUsage) {
      newAlerts.push({
        type: 'error',
        message: `Cache memory usage is high: ${(currentMetrics.memoryUsage / 1024 / 1024).toFixed(1)}MB`,
        timestamp: now,
        metric: 'memoryUsage',
        value: currentMetrics.memoryUsage,
        threshold: thresholds.memoryUsage
      });
    }

    // Too many stale queries
    const stalePercent = currentMetrics.totalQueries > 0 
      ? currentMetrics.staleQueries / currentMetrics.totalQueries 
      : 0;
    
    if (stalePercent > thresholds.staleQueriesPercent) {
      newAlerts.push({
        type: 'warning',
        message: `High percentage of stale queries: ${(stalePercent * 100).toFixed(1)}%`,
        timestamp: now,
        metric: 'staleQueries',
        value: stalePercent,
        threshold: thresholds.staleQueriesPercent
      });
    }

    setAlerts(prev => [...newAlerts, ...prev.slice(0, 9)]); // Keep last 10 alerts
  }, []);

  // Periodic monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      const currentMetrics = calculateMetrics();
      setMetrics(currentMetrics);
      checkPerformanceAlerts(currentMetrics);
      
      // Log metrics in development
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Cache Metrics:', {
          hitRate: `${(currentMetrics.hitRate * 100).toFixed(1)}%`,
          activeQueries: currentMetrics.activeQueries,
          avgTime: `${currentMetrics.averageQueryTime.toFixed(0)}ms`,
          memory: `${(currentMetrics.memoryUsage / 1024).toFixed(0)}KB`
        });
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [calculateMetrics, checkPerformanceAlerts]);

  // Clear alerts
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Reset metrics
  const resetMetrics = useCallback(() => {
    metricsRef.current = {
      hits: 0,
      misses: 0,
      queryTimes: [],
      slowQueries: []
    };
    setMetrics({
      hitRate: 0,
      missRate: 0,
      totalQueries: 0,
      activeQueries: 0,
      staleQueries: 0,
      errorQueries: 0,
      memoryUsage: 0,
      averageQueryTime: 0,
      topSlowQueries: []
    });
    clearAlerts();
  }, [clearAlerts]);

  return {
    metrics,
    alerts,
    trackQueryPerformance,
    clearAlerts,
    resetMetrics
  };
};
