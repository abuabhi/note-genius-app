
import { useEffect, useRef, useState, useCallback } from 'react';

interface VirtualizationMetrics {
  renderTime: number;
  memoryUsage: number;
  scrollPerformance: number;
  totalItems: number;
  visibleItems: number;
  isVirtualized: boolean;
  frameRate: number;
  memoryReduction: number;
  performanceGrade: 'excellent' | 'good' | 'needs-optimization';
  cacheHitRate: number;
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
    frameRate: 60,
    memoryReduction: 0,
    performanceGrade: 'excellent',
    cacheHitRate: 100,
  });
  
  const renderStartTime = useRef<number>(0);
  const scrollStartTime = useRef<number>(0);
  const frameCount = useRef<number>(0);
  const frameRateHistory = useRef<number[]>([]);
  const lastFrameTime = useRef<number>(0);
  const cacheAccess = useRef<{ hits: number; total: number }>({ hits: 0, total: 0 });

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

  // Track scroll performance and frame rate
  const trackScrollPerformance = useCallback(() => {
    scrollStartTime.current = performance.now();
    frameCount.current = 0;
    lastFrameTime.current = performance.now();

    const measureFrame = () => {
      const currentTime = performance.now();
      const frameDelta = currentTime - lastFrameTime.current;
      const currentFPS = Math.round(1000 / frameDelta);
      
      frameRateHistory.current.push(currentFPS);
      if (frameRateHistory.current.length > 60) {
        frameRateHistory.current.shift();
      }
      
      lastFrameTime.current = currentTime;
      frameCount.current++;
      
      if (frameCount.current < 60) { // Measure for 60 frames
        requestAnimationFrame(measureFrame);
      } else {
        const scrollPerformance = performance.now() - scrollStartTime.current;
        const avgFrameRate = frameRateHistory.current.reduce((a, b) => a + b, 0) / frameRateHistory.current.length;
        
        setMetrics(prev => ({ 
          ...prev, 
          scrollPerformance,
          frameRate: Math.round(avgFrameRate)
        }));
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

  // Cache performance tracking
  const trackCachePerformance = useCallback((hit: boolean) => {
    cacheAccess.current.total++;
    if (hit) {
      cacheAccess.current.hits++;
    }
    
    const hitRate = (cacheAccess.current.hits / cacheAccess.current.total) * 100;
    setMetrics(prev => ({ ...prev, cacheHitRate: Math.round(hitRate) }));
  }, []);

  // Update metrics with calculated values
  useEffect(() => {
    const visibleItems = isVirtualized ? Math.min(20, totalItems) : totalItems;
    const memoryReduction = totalItems > 0 ? ((totalItems - visibleItems) / totalItems) * 100 : 0;
    
    let performanceGrade: 'excellent' | 'good' | 'needs-optimization' = 'excellent';
    if (metrics.renderTime > 33) {
      performanceGrade = 'needs-optimization';
    } else if (metrics.renderTime > 16) {
      performanceGrade = 'good';
    }

    setMetrics(prev => ({
      ...prev,
      totalItems,
      isVirtualized,
      visibleItems,
      memoryReduction: Math.round(memoryReduction),
      performanceGrade,
    }));
  }, [totalItems, isVirtualized, metrics.renderTime]);

  // Advanced performance monitoring and alerts
  useEffect(() => {
    if (debugMode && isVirtualized) {
      const performanceReport = {
        ...metrics,
        memoryReduction: `${metrics.memoryReduction}%`,
        performanceGrade: metrics.performanceGrade,
        frameRateStatus: metrics.frameRate >= 58 ? '🟢 Smooth' : metrics.frameRate >= 45 ? '🟡 Acceptable' : '🔴 Choppy',
        cacheEfficiency: metrics.cacheHitRate >= 90 ? '🟢 Excellent' : metrics.cacheHitRate >= 70 ? '🟡 Good' : '🔴 Poor',
      };
      
      console.log('🚀 Advanced Virtualization Metrics:', performanceReport);
      
      // Performance budget warnings
      if (metrics.renderTime > 16) {
        console.warn('⚠️ Performance Budget Exceeded: Render time is', metrics.renderTime.toFixed(2), 'ms (target: <16ms)');
      }
      
      if (metrics.frameRate < 45) {
        console.warn('⚠️ Low Frame Rate Detected:', metrics.frameRate, 'fps (target: 60fps)');
      }
      
      if (metrics.memoryUsage > 100) {
        console.warn('⚠️ High Memory Usage:', metrics.memoryUsage.toFixed(1), 'MB');
      }
    }
  }, [metrics, debugMode, isVirtualized]);

  return {
    metrics,
    startRenderTiming,
    endRenderTiming,
    trackScrollPerformance,
    updateMemoryUsage,
    trackCachePerformance,
  };
};

export default useVirtualizationMetrics;
