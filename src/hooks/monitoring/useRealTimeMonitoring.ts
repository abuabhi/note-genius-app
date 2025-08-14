import { useEffect, useRef, useCallback } from 'react';
import { useProductionMonitoring } from './useProductionMonitoring';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

interface AlertRule {
  metric: string;
  threshold: number;
  operator: 'gt' | 'lt' | 'eq';
  duration: number; // minutes
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const useRealTimeMonitoring = () => {
  const { trackError } = useProductionMonitoring('RealTimeMonitoring');
  const metricsBuffer = useRef<PerformanceMetric[]>([]);
  const alertRules = useRef<AlertRule[]>([]);
  const alertHistory = useRef<Map<string, number>>(new Map());

  // Default alert rules
  const defaultAlertRules: AlertRule[] = [
    { metric: 'page_load_time', threshold: 3000, operator: 'gt', duration: 2, severity: 'high' },
    { metric: 'api_response_time', threshold: 2000, operator: 'gt', duration: 1, severity: 'medium' },
    { metric: 'error_rate', threshold: 5, operator: 'gt', duration: 5, severity: 'critical' },
    { metric: 'memory_usage', threshold: 80, operator: 'gt', duration: 3, severity: 'high' },
    { metric: 'cpu_usage', threshold: 90, operator: 'gt', duration: 2, severity: 'critical' },
  ];

  // Initialize alert rules
  useEffect(() => {
    alertRules.current = defaultAlertRules;
  }, []);

  // Collect performance metrics
  const collectMetric = useCallback((metric: PerformanceMetric) => {
    metricsBuffer.current.push(metric);
    
    // Check alert rules
    checkAlertRules(metric);

    // Send to monitoring services (Grafana Cloud, etc.)
    sendToMonitoringServices(metric);
  }, []);

  // Check alert rules
  const checkAlertRules = useCallback((metric: PerformanceMetric) => {
    const relevantRules = alertRules.current.filter(rule => rule.metric === metric.name);
    
    relevantRules.forEach(rule => {
      const shouldAlert = evaluateRule(rule, metric.value);
      
      if (shouldAlert) {
        const alertKey = `${rule.metric}_${rule.severity}`;
        const lastAlert = alertHistory.current.get(alertKey) || 0;
        const now = Date.now();
        
        // Rate limit alerts (don't spam)
        if (now - lastAlert > rule.duration * 60 * 1000) {
          triggerAlert(rule, metric);
          alertHistory.current.set(alertKey, now);
        }
      }
    });
  }, []);

  const evaluateRule = (rule: AlertRule, value: number): boolean => {
    switch (rule.operator) {
      case 'gt': return value > rule.threshold;
      case 'lt': return value < rule.threshold;
      case 'eq': return value === rule.threshold;
      default: return false;
    }
  };

  const triggerAlert = (rule: AlertRule, metric: PerformanceMetric) => {
    const alertData = {
      rule,
      metric,
      timestamp: Date.now(),
      message: `${rule.metric} ${rule.operator} ${rule.threshold} (current: ${metric.value})`
    };

    console.warn('🚨 Performance Alert:', alertData);
    
    // Send to external monitoring (if configured)
    if (typeof window !== 'undefined') {
      // Store alert in localStorage for dashboard
      const alerts = JSON.parse(localStorage.getItem('performance_alerts') || '[]');
      alerts.push(alertData);
      
      // Keep only last 100 alerts
      if (alerts.length > 100) {
        alerts.splice(0, alerts.length - 100);
      }
      
      localStorage.setItem('performance_alerts', JSON.stringify(alerts));
    }
  };

  // Send metrics to external monitoring services
  const sendToMonitoringServices = useCallback((metric: PerformanceMetric) => {
    // Grafana Cloud endpoint (if configured)
    const grafanaEndpoint = process.env.GRAFANA_ENDPOINT;
    
    if (grafanaEndpoint) {
      fetch(grafanaEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GRAFANA_API_KEY}`
        },
        body: JSON.stringify({
          streams: [{
            stream: { job: 'study-app', instance: 'web', ...metric.tags },
            values: [[metric.timestamp.toString(), JSON.stringify(metric)]]
          }]
        })
      }).catch(err => console.warn('Failed to send to Grafana:', err));
    }
  }, []);

  // Web Vitals integration
  const trackWebVitals = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Core Web Vitals
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      onCLS(metric => collectMetric({
        name: 'cls',
        value: metric.value,
        timestamp: Date.now(),
        tags: { type: 'web_vital' }
      }));
      
      onFID(metric => collectMetric({
        name: 'fid',
        value: metric.value,
        timestamp: Date.now(),
        tags: { type: 'web_vital' }
      }));
      
      onFCP(metric => collectMetric({
        name: 'fcp',
        value: metric.value,
        timestamp: Date.now(),
        tags: { type: 'web_vital' }
      }));
      
      onLCP(metric => collectMetric({
        name: 'lcp',
        value: metric.value,
        timestamp: Date.now(),
        tags: { type: 'web_vital' }
      }));
      
      onTTFB(metric => collectMetric({
        name: 'ttfb',
        value: metric.value,
        timestamp: Date.now(),
        tags: { type: 'web_vital' }
      }));
    }).catch(err => console.warn('Failed to load web-vitals:', err));
  }, [collectMetric]);

  // Start monitoring
  useEffect(() => {
    trackWebVitals();
    
    // Performance observer for additional metrics
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            collectMetric({
              name: 'page_load_time',
              value: navEntry.loadEventEnd - navEntry.fetchStart,
              timestamp: Date.now(),
              tags: { type: 'navigation' }
            });
          }
          
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            collectMetric({
              name: 'resource_load_time',
              value: resourceEntry.responseEnd - resourceEntry.requestStart,
              timestamp: Date.now(),
              tags: { 
                type: 'resource',
                resource_type: resourceEntry.initiatorType,
                url: resourceEntry.name 
              }
            });
          }
        });
      });

      observer.observe({ entryTypes: ['navigation', 'resource'] });
      
      return () => observer.disconnect();
    }
  }, [trackWebVitals, collectMetric]);

  // Flush metrics to storage periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (metricsBuffer.current.length > 0) {
        // Store metrics locally for dashboard
        const existingMetrics = JSON.parse(localStorage.getItem('performance_metrics') || '[]');
        existingMetrics.push(...metricsBuffer.current);
        
        // Keep only last 1000 metrics
        if (existingMetrics.length > 1000) {
          existingMetrics.splice(0, existingMetrics.length - 1000);
        }
        
        localStorage.setItem('performance_metrics', JSON.stringify(existingMetrics));
        metricsBuffer.current = [];
      }
    }, 30000); // Flush every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    collectMetric,
    addAlertRule: (rule: AlertRule) => {
      alertRules.current.push(rule);
    },
    getMetrics: () => metricsBuffer.current,
    getAlerts: () => {
      if (typeof window === 'undefined') return [];
      return JSON.parse(localStorage.getItem('performance_alerts') || '[]');
    }
  };
};
