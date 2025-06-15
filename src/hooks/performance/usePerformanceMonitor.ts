
import { useState, useCallback } from 'react';

interface PerformanceMetrics {
  renderTimes: { component: string; time: number; timestamp: number }[];
  memoryUsage: number;
  queryTimes: { query: string; time: number; timestamp: number }[];
  cacheHitRate: number;
  totalQueries: number;
  slowQueries: number;
}

// On-demand performance monitoring only
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTimes: [],
    memoryUsage: 0,
    queryTimes: [],
    cacheHitRate: 0,
    totalQueries: 0,
    slowQueries: 0
  });

  const [isMonitoring, setIsMonitoring] = useState(false);

  // Start monitoring manually
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    console.log('🔍 Performance monitoring started');
  }, []);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    console.log('⏹️ Performance monitoring stopped');
  }, []);

  // Track render time only when monitoring is active
  const trackRenderTime = useCallback((component: string, startTime: number) => {
    if (!isMonitoring) return;
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    setMetrics(prev => ({
      ...prev,
      renderTimes: [...prev.renderTimes.slice(-9), {
        component,
        time: renderTime,
        timestamp: Date.now()
      }]
    }));
  }, [isMonitoring]);

  // Track query time only when monitoring is active
  const trackQueryTime = useCallback((query: string, startTime: number) => {
    if (!isMonitoring) return;
    
    const endTime = performance.now();
    const queryTime = endTime - startTime;
    
    setMetrics(prev => ({
      ...prev,
      queryTimes: [...prev.queryTimes.slice(-9), {
        query,
        time: queryTime,
        timestamp: Date.now()
      }],
      totalQueries: prev.totalQueries + 1,
      slowQueries: queryTime > 1000 ? prev.slowQueries + 1 : prev.slowQueries
    }));
  }, [isMonitoring]);

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    trackRenderTime,
    trackQueryTime
  };
};
