
import { useEffect, useRef, useCallback } from 'react';
import { performanceBudgetMonitor } from '@/utils/performanceBudget';
import { intelligentCacheManager } from '@/services/cache/IntelligentCacheStrategy';

interface AdvancedPerformanceMetrics {
  bundleSize: number;
  cacheMetrics: ReturnType<typeof intelligentCacheManager.getMetrics>;
  webVitals: {
    lcp?: number;
    fid?: number;
    cls?: number;
    fcp?: number;
  };
  memoryUsage: number;
  loadTime: number;
}

export const useAdvancedPerformanceMonitor = () => {
  const metricsRef = useRef<AdvancedPerformanceMetrics>({
    bundleSize: 0,
    cacheMetrics: intelligentCacheManager.getMetrics(),
    webVitals: {},
    memoryUsage: 0,
    loadTime: 0,
  });

  // Collect Web Vitals
  const collectWebVitals = useCallback(() => {
    // LCP (Largest Contentful Paint)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      metricsRef.current.webVitals.lcp = lastEntry.startTime;
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // FCP (First Contentful Paint)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        metricsRef.current.webVitals.fcp = fcpEntry.startTime;
      }
    }).observe({ entryTypes: ['paint'] });

    // CLS (Cumulative Layout Shift)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      metricsRef.current.webVitals.cls = clsValue;
    }).observe({ entryTypes: ['layout-shift'] });

    // FID (First Input Delay)
    new PerformanceObserver((list) => {
      const firstInput = list.getEntries()[0];
      if (firstInput) {
        metricsRef.current.webVitals.fid = (firstInput as any).processingStart - firstInput.startTime;
      }
    }).observe({ entryTypes: ['first-input'] });
  }, []);

  // Memory monitoring
  const monitorMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      metricsRef.current.memoryUsage = memInfo.usedJSHeapSize / 1024 / 1024; // MB
      
      // Trigger cache cleanup if memory usage is high
      if (memInfo.usedJSHeapSize > 150 * 1024 * 1024) { // 150MB threshold
        intelligentCacheManager.handleMemoryPressure();
      }
    }
  }, []);

  // Bundle size estimation
  const estimateBundleSize = useCallback(() => {
    // Rough estimation based on loaded scripts
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;
    
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src && !src.startsWith('http')) {
        // Estimate based on typical sizes (this is approximate)
        totalSize += 200; // KB per script (rough estimate)
      }
    });
    
    metricsRef.current.bundleSize = totalSize;
    performanceBudgetMonitor.checkBundleSize(totalSize);
  }, []);

  // Initialize monitoring
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initial measurements
    collectWebVitals();
    estimateBundleSize();
    
    // Set up periodic monitoring
    const interval = setInterval(() => {
      monitorMemoryUsage();
      metricsRef.current.cacheMetrics = intelligentCacheManager.getMetrics();
    }, 30000); // Every 30 seconds

    // Monitor page load time
    if (document.readyState === 'complete') {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        metricsRef.current.loadTime = navigation.loadEventEnd - navigation.fetchStart;
      }
    } else {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          metricsRef.current.loadTime = navigation.loadEventEnd - navigation.fetchStart;
        }
      });
    }

    return () => {
      clearInterval(interval);
    };
  }, [collectWebVitals, estimateBundleSize, monitorMemoryUsage]);

  const getPerformanceReport = useCallback(() => {
    const budgetReport = performanceBudgetMonitor.getBudgetReport();
    
    return {
      metrics: { ...metricsRef.current },
      budgetCompliance: budgetReport,
      recommendations: generateRecommendations(metricsRef.current, budgetReport),
    };
  }, []);

  return {
    getPerformanceReport,
    forceMemoryCleanup: intelligentCacheManager.handleMemoryPressure.bind(intelligentCacheManager),
  };
};

function generateRecommendations(
  metrics: AdvancedPerformanceMetrics,
  budgetReport: ReturnType<typeof performanceBudgetMonitor.getBudgetReport>
): string[] {
  const recommendations: string[] = [];

  if (metrics.bundleSize > budgetReport.budgets.maxBundleSize) {
    recommendations.push('Consider code splitting or removing unused dependencies');
  }

  if (metrics.webVitals.lcp && metrics.webVitals.lcp > budgetReport.budgets.maxLCP) {
    recommendations.push('Optimize largest contentful paint by optimizing images and critical resources');
  }

  if (metrics.webVitals.cls && metrics.webVitals.cls > budgetReport.budgets.maxCLS) {
    recommendations.push('Reduce cumulative layout shift by reserving space for dynamic content');
  }

  if (metrics.memoryUsage > 100) {
    recommendations.push('High memory usage detected - consider reducing cache size or clearing unused data');
  }

  const cacheHitRate = parseFloat(metrics.cacheMetrics.hitRate.replace('%', ''));
  if (cacheHitRate < 70) {
    recommendations.push('Cache hit rate is low - consider adjusting cache strategies');
  }

  if (recommendations.length === 0) {
    recommendations.push('Performance is within acceptable limits');
  }

  return recommendations;
}
