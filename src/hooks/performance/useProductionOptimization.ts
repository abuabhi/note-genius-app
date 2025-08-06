import { useEffect, useState } from 'react';
import { PRODUCTION_INTERVALS, getOptimizedInterval, debugLog } from '@/utils/productionOptimizations';

interface ProductionOptimizationConfig {
  enablePerformanceMonitoring: boolean;
  enableDebugLogging: boolean;
  intervalMultiplier: number; // For scaling all intervals
}

export const useProductionOptimization = () => {
  const [config, setConfig] = useState<ProductionOptimizationConfig>({
    enablePerformanceMonitoring: process.env.NODE_ENV === 'development',
    enableDebugLogging: process.env.NODE_ENV === 'development',
    intervalMultiplier: process.env.NODE_ENV === 'production' ? 2 : 1, // Even slower in production
  });

  const [metrics, setMetrics] = useState({
    memoryUsage: 0,
    activeConnections: 0,
    cacheHitRate: 0,
    lastOptimization: new Date(),
  });

  // Performance monitoring
  useEffect(() => {
    if (!config.enablePerformanceMonitoring) return;

    const interval = setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsageMB = memory.usedJSHeapSize / 1024 / 1024;
        
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memoryUsageMB,
          lastOptimization: new Date(),
        }));

        // Trigger optimization if memory usage is high
        if (memoryUsageMB > 200) {
          optimizePerformance();
        }
      }
    }, getOptimizedInterval(PRODUCTION_INTERVALS.PERFORMANCE_MONITORING, 60000));

    return () => clearInterval(interval);
  }, [config.enablePerformanceMonitoring]);

  const optimizePerformance = () => {
    debugLog('🔧 Running performance optimization...');
    
    // Force garbage collection if available
    if ('gc' in window && typeof window.gc === 'function') {
      window.gc();
    }

    // Clear unnecessary caches
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        const oldCaches = cacheNames.filter(name => 
          name.includes('old') || name.includes('temp')
        );
        oldCaches.forEach(cache => caches.delete(cache));
      });
    }

    debugLog('✅ Performance optimization completed');
  };

  const getOptimizedPollingInterval = (baseInterval: number): number => {
    return baseInterval * config.intervalMultiplier;
  };

  const isProductionMode = process.env.NODE_ENV === 'production';

  return {
    config,
    metrics,
    isProductionMode,
    optimizePerformance,
    getOptimizedPollingInterval,
    intervals: PRODUCTION_INTERVALS,
  };
};