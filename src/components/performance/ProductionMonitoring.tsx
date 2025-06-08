
import { useEffect } from 'react';
import { useProductionMetrics } from '@/hooks/performance/useProductionMetrics';
import { useCacheStrategy } from '@/hooks/performance/useCacheStrategy';

export const ProductionMonitoring = () => {
  const { recordMetric, getMetrics, trackQueryPerformance } = useProductionMetrics('ProductionApp');
  const { getCacheMetrics } = useCacheStrategy();

  useEffect(() => {
    // Track Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          recordMetric('page_load_time', navEntry.loadEventEnd - navEntry.loadEventStart);
          recordMetric('dom_content_loaded', navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart);
        }
        
        if (entry.entryType === 'largest-contentful-paint') {
          recordMetric('largest_contentful_paint', entry.startTime);
        }
        
        if (entry.entryType === 'first-input') {
          recordMetric('first_input_delay', (entry as any).processingStart - entry.startTime);
        }
      });
    });

    observer.observe({ entryTypes: ['navigation', 'largest-contentful-paint', 'first-input'] });

    // Track memory usage
    const trackMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        recordMetric('memory_used_mb', memory.usedJSHeapSize / 1024 / 1024);
        recordMetric('memory_total_mb', memory.totalJSHeapSize / 1024 / 1024);
      }
    };

    // Track cache health
    const trackCacheHealth = () => {
      const cacheMetrics = getCacheMetrics();
      recordMetric('cache_total_queries', cacheMetrics.totalQueries);
      recordMetric('cache_stale_queries', cacheMetrics.staleQueries);
      recordMetric('cache_error_queries', cacheMetrics.errorQueries);
      recordMetric('cache_size_bytes', cacheMetrics.cacheSize);
    };

    const interval = setInterval(() => {
      trackMemory();
      trackCacheHealth();
      trackQueryPerformance();
    }, 30000); // Every 30 seconds

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, [recordMetric, getCacheMetrics, trackQueryPerformance]);

  // Track user interactions
  useEffect(() => {
    const trackClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const className = target.className;
      
      recordMetric('user_interaction', 1, {
        type: 'click',
        element: tagName,
        className: className.substring(0, 50) // Limit className length
      });
    };

    const trackScroll = () => {
      recordMetric('user_interaction', 1, { type: 'scroll' });
    };

    document.addEventListener('click', trackClick);
    document.addEventListener('scroll', trackScroll, { passive: true });

    return () => {
      document.removeEventListener('click', trackClick);
      document.removeEventListener('scroll', trackScroll);
    };
  }, [recordMetric]);

  return null; // This component doesn't render anything
};
