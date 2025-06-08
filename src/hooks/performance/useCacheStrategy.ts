
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';

interface CacheConfig {
  staleTime: number;
  cacheTime: number;
  refetchOnWindowFocus: boolean;
  refetchOnReconnect: boolean;
}

const CACHE_CONFIGS = {
  // Static data that rarely changes
  static: {
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    cacheTime: 48 * 60 * 60 * 1000, // 48 hours
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  },
  // Frequently updated data
  dynamic: {
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  },
  // User-specific data
  user: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  },
  // Real-time sensitive data
  realtime: {
    staleTime: 0, // Always stale
    cacheTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  }
} as const;

export const useCacheStrategy = () => {
  const queryClient = useQueryClient();

  // Prefetch critical data
  const prefetchCriticalData = useCallback(async (userId: string) => {
    const criticalQueries = [
      ['user-profile', userId],
      ['flashcard-sets', userId],
      ['analytics', userId],
      ['recent-sessions', userId]
    ];

    await Promise.all(
      criticalQueries.map(queryKey =>
        queryClient.prefetchQuery({
          queryKey,
          queryFn: () => Promise.resolve(null),
          ...CACHE_CONFIGS.user
        })
      )
    );
  }, [queryClient]);

  // Implement stale-while-revalidate for specific queries
  const staleWhileRevalidate = useCallback(async (
    queryKey: string[],
    queryFn: () => Promise<any>,
    config: CacheConfig = CACHE_CONFIGS.user
  ) => {
    // Get cached data immediately if available
    const cachedData = queryClient.getQueryData(queryKey);
    
    if (cachedData) {
      // Return cached data immediately
      console.log(`📦 Serving cached data for ${queryKey.join('-')}`);
      
      // Revalidate in background
      queryClient.prefetchQuery({
        queryKey,
        queryFn,
        ...config
      }).catch(error => {
        console.warn(`⚠️ Background revalidation failed for ${queryKey.join('-')}:`, error);
      });
      
      return cachedData;
    }

    // No cached data, fetch fresh
    return queryClient.fetchQuery({
      queryKey,
      queryFn,
      ...config
    });
  }, [queryClient]);

  // Cache invalidation strategies
  const invalidateRelatedQueries = useCallback((pattern: string) => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        return query.queryKey.some(key => 
          typeof key === 'string' && key.includes(pattern)
        );
      }
    });
  }, [queryClient]);

  // Intelligent cache warming
  const warmCache = useCallback(async (userId: string) => {
    console.log('🔥 Warming cache for user:', userId);
    
    // Warm frequently accessed data
    const warmupQueries = [
      { key: ['user-stats', userId], priority: 'high' },
      { key: ['flashcard-progress', userId], priority: 'medium' },
      { key: ['study-goals', userId], priority: 'medium' },
      { key: ['recent-notes', userId], priority: 'low' }
    ];

    // Process high priority first
    const highPriority = warmupQueries.filter(q => q.priority === 'high');
    await Promise.all(
      highPriority.map(({ key }) =>
        queryClient.prefetchQuery({
          queryKey: key,
          queryFn: () => Promise.resolve(null),
          ...CACHE_CONFIGS.user
        })
      )
    );

    // Process medium and low priority in background
    setTimeout(() => {
      const otherQueries = warmupQueries.filter(q => q.priority !== 'high');
      otherQueries.forEach(({ key }) => {
        queryClient.prefetchQuery({
          queryKey: key,
          queryFn: () => Promise.resolve(null),
          ...CACHE_CONFIGS.user
        });
      });
    }, 1000);
  }, [queryClient]);

  // Memory management
  const optimizeMemoryUsage = useCallback(() => {
    // Clear unused queries
    queryClient.getQueryCache().clear();
    
    // Reset to default cache sizes
    queryClient.setDefaultOptions({
      queries: {
        gcTime: CACHE_CONFIGS.user.cacheTime,
        staleTime: CACHE_CONFIGS.user.staleTime,
      }
    });
    
    console.log('🧹 Cache memory optimized');
  }, [queryClient]);

  // Performance monitoring
  useEffect(() => {
    const logCacheStats = () => {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();
      
      console.log('📊 Cache Stats:', {
        totalQueries: queries.length,
        staleQueries: queries.filter(q => q.isStale()).length,
        loadingQueries: queries.filter(q => q.isFetching()).length,
        errorQueries: queries.filter(q => q.isError()).length,
      });
    };

    // Log stats every 5 minutes in development
    const interval = setInterval(logCacheStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [queryClient]);

  return {
    prefetchCriticalData,
    staleWhileRevalidate,
    invalidateRelatedQueries,
    warmCache,
    optimizeMemoryUsage,
    cacheConfigs: CACHE_CONFIGS
  };
};
