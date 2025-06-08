import { useEffect, useRef } from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

export const usePerformanceMetrics = (componentName: string) => {
  const renderStartTime = useRef<number>();
  const metricsRef = useRef<PerformanceMetric[]>([]);

  // Track component render time
  useEffect(() => {
    renderStartTime.current = performance.now();
    
    return () => {
      if (renderStartTime.current) {
        const renderTime = performance.now() - renderStartTime.current;
        recordMetric(`${componentName}_render_time`, renderTime);
      }
    };
  });

  const recordMetric = (name: string, value: number) => {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now()
    };
    
    metricsRef.current.push(metric);
    
    // In production, send to analytics service
    console.log('Performance Metric:', metric);
    
    // Keep only recent metrics to prevent memory leaks
    if (metricsRef.current.length > 100) {
      metricsRef.current = metricsRef.current.slice(-50);
    }
  };

  const measureOperation = async <T>(
    name: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    try {
      const result = await operation();
      recordMetric(name, performance.now() - startTime);
      return result;
    } catch (error) {
      recordMetric(`${name}_error`, performance.now() - startTime);
      throw error;
    }
  };

  const getMetrics = () => [...metricsRef.current];

  return {
    recordMetric,
    measureOperation,
    getMetrics
  };
};
