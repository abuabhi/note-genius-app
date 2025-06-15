
import { useEffect, useCallback, useRef, useState } from 'react';
import { useBackgroundProcessor } from './useBackgroundProcessor';

interface PerformanceMetrics {
  pageLoadTime: number;
  renderTime: number;
  apiResponseTimes: number[];
  memoryUsage: number;
  errorRate: number;
  userInteractionDelay: number;
  cacheHitRate: number;
  networkLatency: number;
}

interface PerformanceAlert {
  type: 'warning' | 'error' | 'info';
  message: string;
  metric: keyof PerformanceMetrics;
  value: number;
  threshold: number;
  timestamp: number;
}

interface PerformanceThresholds {
  pageLoadTime: number;
  renderTime: number;
  apiResponseTime: number;
  memoryUsage: number;
  errorRate: number;
  userInteractionDelay: number;
  cacheHitRate: number;
  networkLatency: number;
}

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    renderTime: 0,
    apiResponseTimes: [],
    memoryUsage: 0,
    errorRate: 0,
    userInteractionDelay: 0,
    cacheHitRate: 0,
    networkLatency: 0
  });
  
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  const { addJob, registerWorker } = useBackgroundProcessor();
  const metricsRef = useRef<PerformanceMetrics>(metrics);
  const performanceObserverRef = useRef<PerformanceObserver | null>(null);
  
  // Performance thresholds
  const thresholds: PerformanceThresholds = {
    pageLoadTime: 3000, // 3 seconds
    renderTime: 100, // 100ms
    apiResponseTime: 1000, // 1 second
    memoryUsage: 100 * 1024 * 1024, // 100MB
    errorRate: 0.05, // 5%
    userInteractionDelay: 50, // 50ms
    cacheHitRate: 0.8, // 80%
    networkLatency: 200 // 200ms
  };

  // Track page load performance
  const trackPageLoad = useCallback(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const loadTime = navigation.loadEventEnd - navigation.navigationStart;
      
      setMetrics(prev => ({
        ...prev,
        pageLoadTime: loadTime
      }));
      
      if (loadTime > thresholds.pageLoadTime) {
        addAlert('warning', 'Slow page load detected', 'pageLoadTime', loadTime, thresholds.pageLoadTime);
      }
      
      console.log('📊 Page load time:', loadTime + 'ms');
    }
  }, []);

  // Track render performance
  const trackRenderTime = useCallback((componentName: string, startTime: number) => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    setMetrics(prev => ({
      ...prev,
      renderTime: renderTime
    }));
    
    if (renderTime > thresholds.renderTime) {
      addAlert('warning', `Slow render: ${componentName}`, 'renderTime', renderTime, thresholds.renderTime);
    }
    
    console.log(`⚡ ${componentName} render time:`, renderTime + 'ms');
  }, []);

  // Track API response times
  const trackApiResponse = useCallback((url: string, responseTime: number) => {
    setMetrics(prev => ({
      ...prev,
      apiResponseTimes: [...prev.apiResponseTimes.slice(-19), responseTime] // Keep last 20
    }));
    
    if (responseTime > thresholds.apiResponseTime) {
      addAlert('warning', `Slow API response: ${url}`, 'apiResponseTime', responseTime, thresholds.apiResponseTime);
    }
    
    console.log(`🌐 API response time for ${url}:`, responseTime + 'ms');
  }, []);

  // Track memory usage
  const trackMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const used = memory.usedJSHeapSize;
      
      setMetrics(prev => ({
        ...prev,
        memoryUsage: used
      }));
      
      if (used > thresholds.memoryUsage) {
        addAlert('error', 'High memory usage detected', 'memoryUsage', used, thresholds.memoryUsage);
      }
      
      console.log('💾 Memory usage:', (used / 1024 / 1024).toFixed(2) + 'MB');
    }
  }, []);

  // Track user interaction delays
  const trackInteractionDelay = useCallback((eventType: string, delay: number) => {
    setMetrics(prev => ({
      ...prev,
      userInteractionDelay: delay
    }));
    
    if (delay > thresholds.userInteractionDelay) {
      addAlert('warning', `Slow ${eventType} interaction`, 'userInteractionDelay', delay, thresholds.userInteractionDelay);
    }
    
    console.log(`👆 ${eventType} interaction delay:`, delay + 'ms');
  }, []);

  // Track cache performance
  const trackCachePerformance = useCallback((hits: number, misses: number) => {
    const hitRate = hits / (hits + misses);
    
    setMetrics(prev => ({
      ...prev,
      cacheHitRate: hitRate
    }));
    
    if (hitRate < thresholds.cacheHitRate) {
      addAlert('info', 'Low cache hit rate', 'cacheHitRate', hitRate, thresholds.cacheHitRate);
    }
    
    console.log('🎯 Cache hit rate:', (hitRate * 100).toFixed(1) + '%');
  }, []);

  // Add performance alert
  const addAlert = useCallback((
    type: 'warning' | 'error' | 'info',
    message: string,
    metric: keyof PerformanceMetrics,
    value: number,
    threshold: number
  ) => {
    const alert: PerformanceAlert = {
      type,
      message,
      metric,
      value,
      threshold,
      timestamp: Date.now()
    };
    
    setAlerts(prev => [...prev.slice(-9), alert]); // Keep last 10 alerts
    
    console.warn('⚠️ Performance alert:', alert);
    
    // Send alert to background processing
    addJob('process_performance_alert', alert, 'high');
  }, [addJob]);

  // Setup performance observers
  useEffect(() => {
    if (!isMonitoring) return;

    // Observe page performance
    if ('PerformanceObserver' in window) {
      performanceObserverRef.current = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            trackPageLoad();
          } else if (entry.entryType === 'measure') {
            console.log('📏 Performance measure:', entry.name, entry.duration + 'ms');
          }
        });
      });
      
      performanceObserverRef.current.observe({ 
        entryTypes: ['navigation', 'measure', 'mark'] 
      });
    }

    // Monitor memory usage periodically
    const memoryInterval = setInterval(trackMemoryUsage, 30000); // Every 30 seconds

    return () => {
      if (performanceObserverRef.current) {
        performanceObserverRef.current.disconnect();
      }
      clearInterval(memoryInterval);
    };
  }, [isMonitoring, trackPageLoad, trackMemoryUsage]);

  // Register background workers for performance processing
  useEffect(() => {
    registerWorker('process_performance_alert', async (alert: PerformanceAlert) => {
      // Process performance alerts (could send to analytics service)
      console.log('📊 Processing performance alert:', alert);
      
      // Store in local storage for persistence
      const existingAlerts = JSON.parse(localStorage.getItem('performance_alerts') || '[]');
      existingAlerts.push(alert);
      localStorage.setItem('performance_alerts', JSON.stringify(existingAlerts.slice(-50)));
    });
    
    registerWorker('generate_performance_report', async () => {
      const report = {
        timestamp: Date.now(),
        metrics: metricsRef.current,
        alerts: alerts.slice(-10),
        summary: {
          avgApiResponseTime: metricsRef.current.apiResponseTimes.reduce((a, b) => a + b, 0) / metricsRef.current.apiResponseTimes.length || 0,
          totalAlerts: alerts.length,
          criticalIssues: alerts.filter(a => a.type === 'error').length
        }
      };
      
      console.log('📈 Performance report generated:', report);
      return report;
    });
  }, [registerWorker, alerts]);

  // Start/stop monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    console.log('🔍 Performance monitoring started');
  }, []);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    console.log('⏹️ Performance monitoring stopped');
  }, []);

  // Get performance summary
  const getPerformanceSummary = useCallback(() => {
    const avgApiTime = metrics.apiResponseTimes.reduce((a, b) => a + b, 0) / metrics.apiResponseTimes.length || 0;
    
    return {
      overall: alerts.filter(a => a.type === 'error').length === 0 ? 'good' : 'poor',
      pageLoadTime: metrics.pageLoadTime,
      avgApiResponseTime: avgApiTime,
      memoryUsage: (metrics.memoryUsage / 1024 / 1024).toFixed(2) + 'MB',
      cacheHitRate: (metrics.cacheHitRate * 100).toFixed(1) + '%',
      alertCount: alerts.length,
      criticalIssues: alerts.filter(a => a.type === 'error').length
    };
  }, [metrics, alerts]);

  // Update ref when metrics change
  useEffect(() => {
    metricsRef.current = metrics;
  }, [metrics]);

  return {
    metrics,
    alerts,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    trackPageLoad,
    trackRenderTime,
    trackApiResponse,
    trackMemoryUsage,
    trackInteractionDelay,
    trackCachePerformance,
    getPerformanceSummary,
    addAlert
  };
};
