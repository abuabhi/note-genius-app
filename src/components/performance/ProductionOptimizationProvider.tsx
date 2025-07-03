import React, { useEffect } from 'react';
import { useTabVisibility } from '@/hooks/performance/useTabVisibility';
import { useOptimizedPerformanceMonitor } from '@/hooks/performance/useOptimizedPerformanceMonitor';

interface ProductionOptimizationProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that enables production optimizations
 * Manages background processes based on tab visibility and environment
 */
export const ProductionOptimizationProvider: React.FC<ProductionOptimizationProviderProps> = ({ 
  children 
}) => {
  const isTabVisible = useTabVisibility();
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Enable performance monitoring only in development or when explicitly needed
  const { isHealthy } = useOptimizedPerformanceMonitor(isDevelopment);

  useEffect(() => {
    // Log tab visibility changes for debugging
    if (isDevelopment) {
      console.log(`🔍 Tab visibility changed: ${isTabVisible ? 'visible' : 'hidden'}`);
    }
  }, [isTabVisible, isDevelopment]);

  // Add performance observer for production monitoring
  useEffect(() => {
    if (!isDevelopment && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        // Log navigation timing for production monitoring
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
    }
  }, [isDevelopment]);

  return <>{children}</>;
};