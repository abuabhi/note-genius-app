
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';

interface CacheMetrics {
  totalQueries: number;
  activeQueries: number;
  staleQueries: number;
  errorQueries: number;
  cacheSize: number;
}

export const useCacheStrategy = () => {
  const queryClient = useQueryClient();

  // Get cache metrics
  const getCacheMetrics = useCallback((): CacheMetrics => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    return {
      totalQueries: queries.length,
      activeQueries: queries.filter(q => q.getObserversCount() > 0).length,
      staleQueries: queries.filter(q => q.isStale()).length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
      cacheSize: JSON.stringify(queries.map(q => q.state.data)).length
    };
  }, [queryClient]);

  // Implement cache cleanup strategy
  const cleanupStaleQueries = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    queries.forEach(query => {
      // Remove queries that are stale and have no observers
      if (query.isStale() && query.getObserversCount() === 0) {
        cache.remove(query);
      }
    });
    
    console.log('🧹 Cleaned up stale queries');
  }, [queryClient]);

  // Prefetch strategy for better UX
  const prefetchStrategy = useCallback((queryKey: string[], queryFn: () => Promise<any>) => {
    return queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    });
  }, [queryClient]);

  // Monitor cache health
  useEffect(() => {
    const interval = setInterval(() => {
      const metrics = getCacheMetrics();
      
      // Log cache health (in production, send to monitoring service)
      console.log('📊 Cache Health:', metrics);
      
      // Auto-cleanup if cache gets too large
      if (metrics.cacheSize > 10 * 1024 * 1024) { // 10MB
        console.log('🔧 Cache size exceeded threshold, cleaning up...');
        cleanupStaleQueries();
      }
    }, 60000); // Every minute
    
    return () => clearInterval(interval);
  }, [getCacheMetrics, cleanupStaleQueries]);

  return {
    getCacheMetrics,
    cleanupStaleQueries,
    prefetchStrategy,
    queryClient
  };
};
