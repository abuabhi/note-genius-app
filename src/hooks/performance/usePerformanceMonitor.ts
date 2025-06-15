import { useState, useCallback, useEffect, useRef } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  cacheHitRatio: number;
  apiResponseTime: number;
  totalNotes: number;
  activeConnections: number;
  loadTime: number;
  bundleSize: number;
  timestamp: number;
}

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    cacheHitRatio: 0,
    apiResponseTime: 0,
    totalNotes: 0,
    activeConnections: 0,
    loadTime: 0,
    bundleSize: 0,
    timestamp: Date.now()
  });

  const renderTimesRef = useRef<number[]>([]);
  const apiTimesRef = useRef<number[]>([]);
  const cacheHitsRef = useRef(0);
  const cacheMissesRef = useRef(0);

  // Track render performance
  const trackRenderTime = useCallback((componentName: string, startTime: number) => {
    const renderTime = performance.now() - startTime;
    renderTimesRef.current.push(renderTime);
    
    // Keep only last 100 measurements
    if (renderTimesRef.current.length > 100) {
      renderTimesRef.current = renderTimesRef.current.slice(-100);
    }
    
    console.log(`🚀 ${componentName} render time: ${renderTime.toFixed(2)}ms`);
  }, []);

  // Track API response times
  const trackApiTime = useCallback((endpoint: string, startTime: number) => {
    const responseTime = performance.now() - startTime;
    apiTimesRef.current.push(responseTime);
    
    // Keep only last 50 measurements
    if (apiTimesRef.current.length > 50) {
      apiTimesRef.current = apiTimesRef.current.slice(-50);
    }
    
    console.log(`📡 API ${endpoint} response time: ${responseTime.toFixed(2)}ms`);
  }, []);

  // Track cache performance
  const trackCacheHit = useCallback(() => {
    cacheHitsRef.current++;
  }, []);

  const trackCacheMiss = useCallback(() => {
    cacheMissesRef.current++;
  }, []);

  // Get memory usage
  const getMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize / 1024 / 1024, // MB
        total: memory.totalJSHeapSize / 1024 / 1024, // MB
        limit: memory.jsHeapSizeLimit / 1024 / 1024 // MB
      };
    }
    return { used: 0, total: 0, limit: 0 };
  }, []);

  // Calculate page load time
  const getLoadTime = useCallback(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        // Use loadEventEnd and fetchStart as fallbacks for navigationStart
        const startTime = navigation.fetchStart || navigation.loadEventStart || 0;
        const endTime = navigation.loadEventEnd || performance.now();
        return endTime - startTime;
      }
    }
    return 0;
  }, []);

  // Update metrics periodically
  const updateMetrics = useCallback(() => {
    const memoryInfo = getMemoryUsage();
    const avgRenderTime = renderTimesRef.current.length > 0 
      ? renderTimesRef.current.reduce((a, b) => a + b, 0) / renderTimesRef.current.length 
      : 0;
    const avgApiTime = apiTimesRef.current.length > 0
      ? apiTimesRef.current.reduce((a, b) => a + b, 0) / apiTimesRef.current.length
      : 0;
    const totalCacheRequests = cacheHitsRef.current + cacheMissesRef.current;
    const cacheHitRatio = totalCacheRequests > 0 ? cacheHitsRef.current / totalCacheRequests : 0;

    setMetrics({
      renderTime: avgRenderTime,
      memoryUsage: memoryInfo.used,
      cacheHitRatio: cacheHitRatio * 100,
      apiResponseTime: avgApiTime,
      totalNotes: 0, // This would be passed from the notes context
      activeConnections: 1, // Placeholder
      loadTime: getLoadTime(),
      bundleSize: 0, // This would need to be calculated during build
      timestamp: Date.now()
    });
  }, [getMemoryUsage, getLoadTime]);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    console.log('📊 Starting performance monitoring...');
    
    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);
    
    // Initial update
    updateMetrics();
    
    return () => {
      clearInterval(interval);
      console.log('⏹️ Stopped performance monitoring');
    };
  }, [updateMetrics]);

  // Performance alerts
  const checkPerformanceAlerts = useCallback(() => {
    const alerts = [];
    
    if (metrics.renderTime > 100) {
      alerts.push('High render time detected');
    }
    
    if (metrics.memoryUsage > 50) {
      alerts.push('High memory usage detected');
    }
    
    if (metrics.cacheHitRatio < 50) {
      alerts.push('Low cache hit ratio');
    }
    
    if (metrics.apiResponseTime > 1000) {
      alerts.push('Slow API responses detected');
    }
    
    return alerts;
  }, [metrics]);

  return {
    metrics,
    trackRenderTime,
    trackApiTime,
    trackCacheHit,
    trackCacheMiss,
    startMonitoring,
    checkPerformanceAlerts,
    getMemoryUsage
  };
};
