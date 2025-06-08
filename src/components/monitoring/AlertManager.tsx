
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { config, logger } from '@/config/environment';

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  dismissed: boolean;
}

interface AlertManagerProps {
  children: React.ReactNode;
}

export const AlertManager = ({ children }: AlertManagerProps) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Monitor performance metrics
  useEffect(() => {
    if (!config.features.enablePerformanceMonitoring) return;

    const checkPerformance = () => {
      // Check memory usage
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        
        if (usedMB > 150) {
          createAlert('warning', 'High Memory Usage', 
            `Application is using ${usedMB.toFixed(1)}MB of memory`);
        }
      }

      // Check navigation timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        if (loadTime > 3000) {
          createAlert('warning', 'Slow Page Load', 
            `Page took ${(loadTime / 1000).toFixed(1)}s to load`);
        }
      }
    };

    // Check performance every 30 seconds
    const interval = setInterval(checkPerformance, 30 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Monitor error patterns
  useEffect(() => {
    if (!config.features.enableErrorReporting) return;

    const originalConsoleError = console.error;
    console.error = (...args) => {
      originalConsoleError(...args);
      
      // Check for critical errors
      const errorMessage = args[0]?.toString() || '';
      if (errorMessage.includes('Network Error') || errorMessage.includes('Failed to fetch')) {
        createAlert('error', 'Network Error', 
          'Unable to connect to the server. Please check your internet connection.');
      } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        createAlert('error', 'Authentication Error', 
          'Your session has expired. Please log in again.');
      }
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  const createAlert = (type: Alert['type'], title: string, message: string) => {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      timestamp: new Date(),
      dismissed: false
    };

    setAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep only last 10 alerts

    // Show toast notification
    const toastConfig = {
      duration: type === 'error' ? 10000 : 5000,
    };

    switch (type) {
      case 'error':
        toast.error(title, toastConfig);
        break;
      case 'warning':
        toast.warning(title, toastConfig);
        break;
      case 'info':
        toast.info(title, toastConfig);
        break;
    }

    logger.warn('Alert created:', { type, title, message });
  };

  // Global error handler
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      createAlert('error', 'Application Error', 
        `An unexpected error occurred: ${event.message}`);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      createAlert('error', 'Promise Rejection', 
        `Unhandled promise rejection: ${event.reason}`);
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return <>{children}</>;
};
