import { useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ConnectionMetrics {
  activeConnections: number;
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
}

export const useConnectionOptimization = () => {
  const metricsRef = useRef<ConnectionMetrics>({
    activeConnections: 0,
    totalRequests: 0,
    averageResponseTime: 0,
    errorRate: 0
  });
  
  const responseTimesRef = useRef<number[]>([]);
  const errorsRef = useRef<number>(0);

  const trackRequest = useCallback(<T>(
    requestFn: () => Promise<T>,
    requestName: string
  ): Promise<T> => {
    const startTime = performance.now();
    metricsRef.current.activeConnections++;
    metricsRef.current.totalRequests++;

    return requestFn()
      .then(result => {
        const duration = performance.now() - startTime;
        responseTimesRef.current.push(duration);
        
        // Keep only last 100 response times for average calculation
        if (responseTimesRef.current.length > 100) {
          responseTimesRef.current.shift();
        }
        
        // Update average response time
        metricsRef.current.averageResponseTime = 
          responseTimesRef.current.reduce((a, b) => a + b, 0) / responseTimesRef.current.length;
        
        console.log(`🚀 [CONNECTION] ${requestName} completed in ${Math.round(duration)}ms`);
        return result;
      })
      .catch(error => {
        errorsRef.current++;
        metricsRef.current.errorRate = 
          (errorsRef.current / metricsRef.current.totalRequests) * 100;
        
        console.error(`❌ [CONNECTION] ${requestName} failed:`, error);
        throw error;
      })
      .finally(() => {
        metricsRef.current.activeConnections--;
      });
  }, []);

  const optimizedSupabaseQuery = useCallback((
    queryBuilder: any,
    queryName: string
  ) => {
    return trackRequest(
      () => queryBuilder,
      `Supabase ${queryName}`
    );
  }, [trackRequest]);

  const batchRequests = useCallback(async <T>(
    requests: Array<() => Promise<T>>,
    batchSize: number = 5
  ): Promise<T[]> => {
    const results: T[] = [];
    
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(req => trackRequest(req, `Batch ${Math.floor(i / batchSize) + 1}`))
      );
      results.push(...batchResults);
      
      // Small delay between batches to prevent overwhelming the server
      if (i + batchSize < requests.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }, [trackRequest]);

  const getConnectionMetrics = useCallback(() => {
    return { ...metricsRef.current };
  }, []);

  const resetMetrics = useCallback(() => {
    metricsRef.current = {
      activeConnections: 0,
      totalRequests: 0,
      averageResponseTime: 0,
      errorRate: 0
    };
    responseTimesRef.current = [];
    errorsRef.current = 0;
  }, []);

  // Log metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const metrics = metricsRef.current;
      if (metrics.totalRequests > 0) {
        console.log('📊 [CONNECTION METRICS]', {
          active: metrics.activeConnections,
          total: metrics.totalRequests,
          avgResponseTime: Math.round(metrics.averageResponseTime) + 'ms',
          errorRate: metrics.errorRate.toFixed(1) + '%'
        });
      }
    }, 30000); // Log every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    trackRequest,
    optimizedSupabaseQuery,
    batchRequests,
    getConnectionMetrics,
    resetMetrics
  };
};
