import React, { useEffect, useState } from 'react';
import { useTabVisibility } from '@/hooks/performance/useTabVisibility';
import { useOptimizedPerformanceMonitor } from '@/hooks/performance/useOptimizedPerformanceMonitor';

interface ProductionOptimizationProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that enables production optimizations.
 * All monitoring work is deferred until the browser is idle so it never
 * blocks first paint or hydration.
 */
export const ProductionOptimizationProvider: React.FC<ProductionOptimizationProviderProps> = ({
  children,
}) => {
  const [monitoringEnabled, setMonitoringEnabled] = useState(false);
  const isTabVisible = useTabVisibility();
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    const enable = () => setMonitoringEnabled(true);
    if ('requestIdleCallback' in window) {
      const id = (window as any).requestIdleCallback(enable, { timeout: 4000 });
      return () => (window as any).cancelIdleCallback?.(id);
    }
    const t = setTimeout(enable, 2500);
    return () => clearTimeout(t);
  }, []);

  useOptimizedPerformanceMonitor(monitoringEnabled && isDevelopment);

  useEffect(() => {
    if (isDevelopment && monitoringEnabled) {
      console.log(`🔍 Tab visibility changed: ${isTabVisible ? 'visible' : 'hidden'}`);
    }
  }, [isTabVisible, isDevelopment, monitoringEnabled]);

  useEffect(() => {
    if (!monitoringEnabled || isDevelopment || !('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          if (navEntry.loadEventEnd > 5000) {
            console.warn('Slow page load detected:', navEntry.loadEventEnd);
          }
        }
      }
    });
    observer.observe({ type: 'navigation', buffered: true });
    return () => observer.disconnect();
  }, [monitoringEnabled, isDevelopment]);

  return <>{children}</>;
};
