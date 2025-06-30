
import React, { useEffect } from 'react';
import { config } from '@/config/environment';
import { productionErrorTracker } from '@/services/errorTracking/ProductionErrorTracker';
import { userSessionTracker } from '@/services/analytics/UserSessionTracker';
import { logger } from '@/services/logging/ProductionLogger';

interface MonitoringProviderProps {
  children: React.ReactNode;
}

export const MonitoringProvider: React.FC<MonitoringProviderProps> = ({ children }) => {
  useEffect(() => {
    if (!config.features.enableErrorReporting && !config.features.enableAnalytics) {
      return;
    }

    logger.info('Production monitoring initialized', {
      environment: config.name,
      features: {
        errorReporting: config.features.enableErrorReporting,
        analytics: config.features.enableAnalytics,
        performanceMonitoring: config.features.enablePerformanceMonitoring,
      },
    });

    // Track initial page load performance
    if (window.performance && window.performance.navigation) {
      const navigationTiming = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigationTiming) {
        productionErrorTracker.trackPerformance({
          type: 'page_load',
          name: 'initial_page_load',
          duration: navigationTiming.loadEventEnd - navigationTiming.navigationStart,
          success: true,
          component: 'App',
          vitals: {
            TTFB: navigationTiming.responseStart - navigationTiming.requestStart,
          },
        });
      }
    }

    // Cleanup on unmount
    return () => {
      logger.info('Production monitoring cleanup');
      productionErrorTracker.destroy();
      userSessionTracker.destroy();
    };
  }, []);

  // In development, provide access to monitoring data via window object
  useEffect(() => {
    if (config.isDevelopment) {
      (window as any).__monitoring = {
        errorTracker: productionErrorTracker,
        sessionTracker: userSessionTracker,
        logger,
        getErrorReports: () => JSON.parse(localStorage.getItem('production_monitoring') || '{"errors": [], "performance": []}'),
        getSessionData: () => JSON.parse(localStorage.getItem('user_session_data') || '{}'),
        getLogs: () => JSON.parse(localStorage.getItem('production_logs') || '[]'),
      };
      
      console.log('🔍 Monitoring tools available at window.__monitoring');
    }
  }, []);

  return <>{children}</>;
};
