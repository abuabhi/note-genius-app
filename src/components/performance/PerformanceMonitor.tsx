
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  queryCount: number;
  cacheHitRate: number;
  memoryUsage: number;
}

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    queryCount: 0,
    cacheHitRate: 0,
    memoryUsage: 0
  });
  
  const queryClient = useQueryClient();

  useEffect(() => {
    const startTime = performance.now();
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          setMetrics(prev => ({
            ...prev,
            loadTime: navEntry.loadEventEnd - navEntry.loadEventStart
          }));
        }
        
        if (entry.entryType === 'measure') {
          setMetrics(prev => ({
            ...prev,
            renderTime: entry.duration
          }));
        }
      });
    });

    observer.observe({ entryTypes: ['navigation', 'measure'] });

    // Monitor memory usage
    const memoryInterval = setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / 1024 / 1024 // MB
        }));
      }
    }, 5000);

    // Monitor query cache performance
    const cacheInterval = setInterval(() => {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();
      const totalQueries = queries.length;
      const cachedQueries = queries.filter(q => q.state.data !== undefined).length;
      
      setMetrics(prev => ({
        ...prev,
        queryCount: totalQueries,
        cacheHitRate: totalQueries > 0 ? (cachedQueries / totalQueries) * 100 : 0
      }));
    }, 10000);

    return () => {
      observer.disconnect();
      clearInterval(memoryInterval);
      clearInterval(cacheInterval);
    };
  }, [queryClient]);

  const logPerformanceIssue = (issue: string, data?: any) => {
    console.warn(`Performance Issue: ${issue}`, data);
    
    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Send to analytics/monitoring service
      console.log('Would send to monitoring:', { issue, data, metrics });
    }
  };

  useEffect(() => {
    // Alert on performance issues
    if (metrics.loadTime > 3000) {
      logPerformanceIssue('Slow page load', { loadTime: metrics.loadTime });
    }
    
    if (metrics.memoryUsage > 100) { // 100MB
      logPerformanceIssue('High memory usage', { memoryUsage: metrics.memoryUsage });
    }
    
    if (metrics.cacheHitRate < 60) { // Less than 60% cache hit rate
      logPerformanceIssue('Low cache efficiency', { cacheHitRate: metrics.cacheHitRate });
    }
  }, [metrics]);

  return {
    metrics,
    logPerformanceIssue
  };
};

export const PerformanceDebugger = () => {
  const { metrics } = usePerformanceMonitor();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-2 rounded text-xs">
      <div>Load: {metrics.loadTime.toFixed(0)}ms</div>
      <div>Render: {metrics.renderTime.toFixed(0)}ms</div>
      <div>Queries: {metrics.queryCount}</div>
      <div>Cache Hit: {metrics.cacheHitRate.toFixed(1)}%</div>
      <div>Memory: {metrics.memoryUsage.toFixed(1)}MB</div>
    </div>
  );
};
