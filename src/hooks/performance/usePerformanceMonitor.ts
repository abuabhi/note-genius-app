
import { useState, useCallback, useRef } from 'react';

export interface PerformanceMetrics {
  renderTimes: number[];
  apiTimes: number[];
  memoryUsage: number[];
  renderTime: number;
  apiTime: number;
  componentCount: number;
  reRenderCount: number;
}

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTimes: [],
    apiTimes: [],
    memoryUsage: [],
    renderTime: 0,
    apiTime: 0,
    componentCount: 0,
    reRenderCount: 0
  });

  const trackRenderTime = useCallback((componentName: string, startTime: number) => {
    const renderTime = performance.now() - startTime;
    setMetrics(prev => ({
      ...prev,
      renderTimes: [...prev.renderTimes.slice(-19), renderTime],
      renderTime,
      reRenderCount: prev.reRenderCount + 1
    }));
  }, []);

  const trackApiTime = useCallback((endpoint: string, startTime: number) => {
    const apiTime = performance.now() - startTime;
    setMetrics(prev => ({
      ...prev,
      apiTimes: [...prev.apiTimes.slice(-19), apiTime],
      apiTime
    }));
  }, []);

  const trackMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      const usage = memoryInfo.usedJSHeapSize;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: [...prev.memoryUsage.slice(-19), usage]
      }));
    }
  }, []);

  const getMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      return {
        used: memoryInfo.usedJSHeapSize,
        total: memoryInfo.totalJSHeapSize,
        limit: memoryInfo.jsHeapSizeLimit,
        usedJSHeapSize: memoryInfo.usedJSHeapSize,
        jsHeapSizeLimit: memoryInfo.jsHeapSizeLimit
      };
    }
    return {
      used: 0,
      total: 0,
      limit: 0,
      usedJSHeapSize: 0,
      jsHeapSizeLimit: 0
    };
  }, []);

  const clearMetrics = useCallback(() => {
    setMetrics({
      renderTimes: [],
      apiTimes: [],
      memoryUsage: [],
      renderTime: 0,
      apiTime: 0,
      componentCount: 0,
      reRenderCount: 0
    });
  }, []);

  const startMonitoring = useCallback(() => {
    // Start memory tracking interval
    const interval = setInterval(trackMemoryUsage, 5000);
    return () => clearInterval(interval);
  }, [trackMemoryUsage]);

  return {
    metrics,
    trackRenderTime,
    trackApiTime,
    trackMemoryUsage,
    getMemoryUsage,
    clearMetrics,
    startMonitoring
  };
};
