
import { useState, useCallback } from 'react';

interface PerformanceMetrics {
  renderTimes: { component: string; time: number; timestamp: number }[];
  memoryUsage: number[];
  queryTimes: { query: string; time: number; timestamp: number }[];
  apiTimes: number[];
  cacheHitRate: number;
  totalQueries: number;
  slowQueries: number;
}

// On-demand performance monitoring only
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTimes: [],
    memoryUsage: [],
    queryTimes: [],
    apiTimes: [],
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

  // Track API time
  const trackApiTime = useCallback((startTime: number) => {
    if (!isMonitoring) return;
    
    const endTime = performance.now();
    const apiTime = endTime - startTime;
    
    setMetrics(prev => ({
      ...prev,
      apiTimes: [...prev.apiTimes.slice(-9), apiTime]
    }));
  }, [isMonitoring]);

  // Track memory usage
  const trackMemoryUsage = useCallback(() => {
    if (!isMonitoring) return;
    
    const memory = (performance as any).memory;
    if (memory) {
      setMetrics(prev => ({
        ...prev,
        memoryUsage: [...prev.memoryUsage.slice(-9), memory.usedJSHeapSize / 1024 / 1024]
      }));
    }
  }, [isMonitoring]);

  // Get current memory usage
  const getMemoryUsage = useCallback(() => {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory?.usedJSHeapSize || 0,
      jsHeapSizeLimit: memory?.jsHeapSizeLimit || 0,
      totalJSHeapSize: memory?.totalJSHeapSize || 0
    };
  }, []);

  // Clear metrics
  const clearMetrics = useCallback(() => {
    setMetrics({
      renderTimes: [],
      memoryUsage: [],
      queryTimes: [],
      apiTimes: [],
      cacheHitRate: 0,
      totalQueries: 0,
      slowQueries: 0
    });
  }, []);

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    trackRenderTime,
    trackQueryTime,
    trackApiTime,
    trackMemoryUsage,
    getMemoryUsage,
    clearMetrics
  };
};
