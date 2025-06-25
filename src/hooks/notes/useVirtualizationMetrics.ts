
import { useEffect, useRef, useState, useCallback } from 'react';

interface VirtualizationMetrics {
  renderTime: number;
  memoryUsage: number;
  scrollPerformance: number;
  totalItems: number;
  visibleItems: number;
  isVirtualized: boolean;
}

interface UseVirtualizationMetricsProps {
  totalItems: number;
  isVirtualized: boolean;
  debugMode?: boolean;
}

export const useVirtualizationMetrics = ({
  totalItems,
  isVirtualized,
  debugMode = false,
}: UseVirtualizationMetricsProps) => {
  const [metrics, setMetrics] = useState<VirtualizationMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    scrollPerformance: 0,
    totalItems: 0,
    visibleItems: 0,
    isVirtualized: false,
  });
  
  const renderStartTime = useRef<number>(0);
  const scrollStartTime = useRef<number>(0);
  const frameCount = useRef<number>(0);

  // Start render timing
  const startRenderTiming = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  // End render timing
  const endRenderTiming = useCallback(() => {
    if (renderStartTime.current > 0) {
      const renderTime = performance.now() - renderStartTime.current;
      setMetrics(prev => ({ ...prev, renderTime }));
    }
  }, []);

  // Track scroll performance
  const trackScrollPerformance = useCallback(() => {
    scrollStartTime.current = performance.now();
    frameCount.current = 0;

    const measureFrame = () => {
      frameCount.current++;
      if (frameCount.current < 60) { // Measure for 60 frames
        requestAnimationFrame(measureFrame);
      } else {
        const scrollPerformance = performance.now() - scrollStartTime.current;
        setMetrics(prev => ({ ...prev, scrollPerformance }));
      }
    };

    requestAnimationFrame(measureFrame);
  }, []);

  // Get memory usage (if available)
  const updateMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
      setMetrics(prev => ({ ...prev, memoryUsage }));
    }
  }, []);

  // Update metrics
  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      totalItems,
      isVirtualized,
      visibleItems: isVirtualized ? Math.min(20, totalItems) : totalItems, // Estimate visible items
    }));
  }, [totalItems, isVirtualized]);

  // Log metrics in debug mode
  useEffect(() => {
    if (debugMode && isVirtualized) {
      console.log('🚀 Virtualization Metrics:', {
        ...metrics,
        memoryReduction: `${((1 - metrics.visibleItems / metrics.totalItems) * 100).toFixed(1)}%`,
        performanceGain: metrics.renderTime < 16 ? 'Excellent' : metrics.renderTime < 33 ? 'Good' : 'Needs Optimization',
      });
    }
  }, [metrics, debugMode, isVirtualized]);

  return {
    metrics,
    startRenderTiming,
    endRenderTiming,
    trackScrollPerformance,
    updateMemoryUsage,
  };
};

export default useVirtualizationMetrics;
