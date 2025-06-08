
import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface QueryPerformanceData {
  queryKey: string;
  duration: number;
  cacheHit: boolean;
  timestamp: number;
}

export const useProductionMetrics = (componentName: string) => {
  const queryClient = useQueryClient();
  const renderStartTime = useRef<number>();
  const metricsBuffer = useRef<PerformanceMetric[]>([]);
  const queryMetrics = useRef<QueryPerformanceData[]>([]);

  // Track component render time
  useEffect(() => {
    renderStartTime.current = performance.now();
    
    return () => {
      if (renderStartTime.current) {
        const renderTime = performance.now() - renderStartTime.current;
        recordMetric(`${componentName}_render_time`, renderTime, {
          component: componentName,
          type: 'render_performance'
        });
      }
    };
  });

  // Record a performance metric
  const recordMetric = useCallback((name: string, value: number, metadata?: Record<string, any>) => {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    };
    
    metricsBuffer.current.push(metric);
    
    // In production, send to analytics service
    console.log('📊 Performance Metric:', metric);
    
    // Prevent memory leaks by limiting buffer size
    if (metricsBuffer.current.length > 100) {
      metricsBuffer.current = metricsBuffer.current.slice(-50);
    }
  }, []);

  // Measure async operations with automatic timing
  const measureOperation = useCallback(async <T>(
    name: string,
    operation: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> => {
    const startTime = performance.now();
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      recordMetric(name, duration, { ...metadata, success: true });
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      recordMetric(`${name}_error`, duration, { 
        ...metadata, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }, [recordMetric]);

  // Track query performance
  const trackQueryPerformance = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    queries.forEach((query) => {
      const queryKey = JSON.stringify(query.queryKey);
      const state = query.state;
      
      if (state.status === 'success' && state.dataUpdatedAt > 0) {
        const queryData: QueryPerformanceData = {
          queryKey,
          duration: state.dataUpdatedAt - (state.dataUpdatedAt - 1000), // Approximate
          cacheHit: state.isFetched && !state.isRefetching,
          timestamp: Date.now()
        };
        
        queryMetrics.current.push(queryData);
        
        // Limit metrics buffer
        if (queryMetrics.current.length > 50) {
          queryMetrics.current = queryMetrics.current.slice(-25);
        }
      }
    });
  }, [queryClient]);

  // Get all recorded metrics
  const getMetrics = useCallback(() => ({
    performance: [...metricsBuffer.current],
    queries: [...queryMetrics.current]
  }), []);

  // Clear metrics (useful for testing)
  const clearMetrics = useCallback(() => {
    metricsBuffer.current = [];
    queryMetrics.current = [];
  }, []);

  // Track query cache health
  useEffect(() => {
    const interval = setInterval(trackQueryPerformance, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [trackQueryPerformance]);

  return {
    recordMetric,
    measureOperation,
    getMetrics,
    clearMetrics,
    trackQueryPerformance
  };
};
