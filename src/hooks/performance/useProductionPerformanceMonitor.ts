
import { useEffect, useRef, useCallback } from 'react';
import { productionErrorTracker } from '@/services/errorTracking/ProductionErrorTracker';
import { config } from '@/config/environment';

interface WebVitalsMetrics {
  CLS?: number;
  FID?: number;
  LCP?: number;
  TTFB?: number;
}

export const useProductionPerformanceMonitor = (componentName: string) => {
  const renderStartTime = useRef<number>();
  const mounted = useRef(false);

  // Track component mount and render time
  useEffect(() => {
    renderStartTime.current = performance.now();
    mounted.current = true;
    
    return () => {
      if (renderStartTime.current && mounted.current) {
        const renderTime = performance.now() - renderStartTime.current;
        
        productionErrorTracker.trackPerformance({
          type: 'component_render',
          name: `${componentName}_render`,
          duration: renderTime,
          success: true,
          component: componentName,
        });
      }
      mounted.current = false;
    };
  }, [componentName]);

  // Measure Web Vitals
  useEffect(() => {
    if (!config.features.enablePerformanceMonitoring) return;

    const measureWebVitals = () => {
      const vitals: WebVitalsMetrics = {};
      
      // Largest Contentful Paint
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        vitals.LCP = lastEntry.startTime;
      });
      
      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Cleanup after 10 seconds
        setTimeout(() => {
          observer.disconnect();
          
          if (Object.keys(vitals).length > 0) {
            productionErrorTracker.trackPerformance({
              type: 'page_load',
              name: 'web_vitals',
              duration: 0,
              success: true,
              component: componentName,
              vitals,
            });
          }
        }, 10000);
      } catch (error) {
        // Performance Observer not supported
        console.debug('Performance Observer not supported');
      }
    };

    measureWebVitals();
  }, [componentName]);

  // Track async operations with error handling
  const measureAsyncOperation = useCallback(async <T>(
    operationName: string,
    operation: () => Promise<T>,
    options?: {
      component?: string;
      critical?: boolean;
    }
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      
      productionErrorTracker.trackPerformance({
        type: 'api_call',
        name: operationName,
        duration,
        success: true,
        component: options?.component || componentName,
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      productionErrorTracker.trackPerformance({
        type: 'api_call',
        name: `${operationName}_error`,
        duration,
        success: false,
        component: options?.component || componentName,
      });

      // Track the error as well
      productionErrorTracker.trackError(error as Error, {
        component: options?.component || componentName,
        action: operationName,
      });
      
      throw error;
    }
  }, [componentName]);

  // Track user interactions
  const trackUserInteraction = useCallback((
    action: string, 
    details?: Record<string, any>
  ) => {
    productionErrorTracker.trackUserAction(action, {
      component: componentName,
      ...details,
    });
  }, [componentName]);

  return {
    measureAsyncOperation,
    trackUserInteraction,
  };
};
