
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';

interface CacheMetrics {
  totalQueries: number;
  activeQueries: number;
  staleQueries: number;
  errorQueries: number;
  cacheSize: number;
}

interface CacheConfigs {
  static: {
    staleTime: number;
    gcTime: number;
  };
  user: {
    staleTime: number;
    gcTime: number;
  };
  frequent: {
    staleTime: number;
    gcTime: number;
  };
}

export const useCacheStrategy = () => {
  const queryClient = useQueryClient();

  // Cache configuration presets
  const cacheConfigs: CacheConfigs = {
    static: {
      staleTime: 30 * 60 * 1000, // 30 minutes
      gcTime: 60 * 60 * 1000, // 1 hour
    },
    user: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
    frequent: {
      staleTime: 1 * 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
    },
  };

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
      gcTime: 10 * 60 * 1000, // 10 minutes
    });
  }, [queryClient]);

  // Stale-while-revalidate pattern
  const staleWhileRevalidate = useCallback(async (queryKey: string[], queryFn: () => Promise<any>) => {
    // First, try to get cached data
    const cachedData = queryClient.getQueryData(queryKey);
    
    if (cachedData) {
      // Return cached data immediately
      setTimeout(() => {
        // Revalidate in background
        queryClient.prefetchQuery({
          queryKey,
          queryFn,
          staleTime: 0, // Force refetch
        });
      }, 0);
      
      return cachedData;
    }
    
    // No cached data, fetch normally
    return queryClient.fetchQuery({
      queryKey,
      queryFn,
      staleTime: cacheConfigs.user.staleTime,
      gcTime: cacheConfigs.user.gcTime,
    });
  }, [queryClient, cacheConfigs]);

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
    staleWhileRevalidate,
    cacheConfigs,
    queryClient
  };
};
