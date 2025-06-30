
import { useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { useProductionPerformanceMonitor } from '@/hooks/performance/useProductionPerformanceMonitor';
import { productionErrorTracker } from '@/services/errorTracking/ProductionErrorTracker';
import { userSessionTracker } from '@/services/analytics/UserSessionTracker';
import { logger } from '@/services/logging/ProductionLogger';

export const useProductionMonitoring = (componentName: string) => {
  const { user } = useAuth();
  const { measureAsyncOperation, trackUserInteraction } = useProductionPerformanceMonitor(componentName);

  // Update user context when authentication changes
  useEffect(() => {
    if (user?.id) {
      userSessionTracker.setUserId(user.id);
      logger.info('User authenticated', { userId: user.id, component: componentName });
    }
  }, [user?.id, componentName]);

  // Error tracking wrapper
  const trackError = useCallback((error: Error, context?: {
    action?: string;
    props?: Record<string, any>;
  }) => {
    productionErrorTracker.trackError(error, {
      component: componentName,
      userId: user?.id,
      ...context,
    });

    userSessionTracker.trackError(componentName, error.message);
    
    logger.error('Component error tracked', error);
  }, [componentName, user?.id]);

  // Performance tracking wrapper
  const trackPerformance = useCallback((metrics: {
    name: string;
    duration: number;
    success: boolean;
    type?: 'component_render' | 'api_call' | 'user_interaction';
  }) => {
    productionErrorTracker.trackPerformance({
      type: metrics.type || 'component_render',
      name: metrics.name,
      duration: metrics.duration,
      success: metrics.success,
      component: componentName,
      userId: user?.id,
    });

    if (metrics.duration > 100) {
      userSessionTracker.trackSlowComponent(componentName, metrics.duration);
    }
  }, [componentName, user?.id]);

  // User interaction tracking
  const trackInteraction = useCallback((action: string, details?: Record<string, any>) => {
    trackUserInteraction(action, details);
    userSessionTracker.trackInteraction(action, {
      component: componentName,
      ...details,
    });
    
    logger.debug('User interaction tracked', {
      action,
      component: componentName,
      ...details,
    });
  }, [componentName, trackUserInteraction]);

  // Async operation wrapper with full monitoring
  const monitorAsyncOperation = useCallback(async <T>(
    operationName: string,
    operation: () => Promise<T>,
    options?: {
      critical?: boolean;
      context?: Record<string, any>;
    }
  ): Promise<T> => {
    try {
      logger.debug(`Starting async operation: ${operationName}`, {
        ...options?.context,
        component: componentName,
        userId: user?.id,
      });

      const result = await measureAsyncOperation(operationName, operation, {
        component: componentName,
        critical: options?.critical,
      });

      logger.debug(`Completed async operation: ${operationName}`, {
        success: true,
        ...options?.context,
        component: componentName,
        userId: user?.id,
      });

      return result;
    } catch (error) {
      logger.error(`Failed async operation: ${operationName}`, error as Error);
      throw error;
    }
  }, [componentName, user?.id, measureAsyncOperation]);

  return {
    trackError,
    trackPerformance,
    trackInteraction,
    monitorAsyncOperation,
    logger: {
      debug: (message: string, data?: Record<string, any>) => 
        logger.debug(message, { ...data, component: componentName, userId: user?.id }),
      info: (message: string, data?: Record<string, any>) => 
        logger.info(message, { ...data, component: componentName, userId: user?.id }),
      warn: (message: string, data?: Record<string, any>) => 
        logger.warn(message, { ...data, component: componentName, userId: user?.id }),
      error: (message: string, error?: Error | Record<string, any>) => 
        logger.error(message, error || {}),
    },
  };
};
