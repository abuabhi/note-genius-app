
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { logger } from '@/config/environment';

interface CacheConfig {
  staleTime: number;
  gcTime: number;
  maxAge?: number;
}

const CACHE_CONFIGS: Record<string, CacheConfig> = {
  // Static data that rarely changes
  static: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  },
  
  // User-specific data
  user: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  },
  
  // Frequently changing data
  realtime: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  },
  
  // Analytics and reporting data
  analytics: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  }
};

const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE_MB = 50; // 50MB limit

export const useOptimizedCache = () => {
  const queryClient = useQueryClient();
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCleanupRef = useRef<number>(0);

  // Get cache config for query type
  const getCacheConfig = useCallback((queryKey: readonly unknown[]): CacheConfig => {
    const keyString = JSON.stringify([...queryKey]); // Convert readonly to mutable for JSON.stringify
    
    if (keyString.includes('profiles') || keyString.includes('countries') || keyString.includes('grades')) {
      return CACHE_CONFIGS.static;
    }
    
    if (keyString.includes('sessions') || keyString.includes('analytics')) {
      return CACHE_CONFIGS.analytics;
    }
    
    if (keyString.includes('realtime') || keyString.includes('notifications')) {
      return CACHE_CONFIGS.realtime;
    }
    
    return CACHE_CONFIGS.user;
  }, []);

  // Calculate cache size
  const calculateCacheSize = useCallback((): number => {
    try {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();
      const dataSize = JSON.stringify(queries.map(q => q.state.data)).length;
      return dataSize / 1024 / 1024; // Convert to MB
    } catch (error) {
      logger.warn('Error calculating cache size:', error);
      return 0;
    }
  }, [queryClient]);

  // Intelligent cache cleanup
  const performCleanup = useCallback(() => {
    const now = Date.now();
    
    // Prevent too frequent cleanups
    if (now - lastCleanupRef.current < 60000) { // 1 minute minimum between cleanups
      return;
    }
    
    lastCleanupRef.current = now;
    
    try {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();
      let removedCount = 0;
      
      queries.forEach(query => {
        const config = getCacheConfig(query.queryKey);
        const queryAge = now - (query.state.dataUpdatedAt || 0);
        
        // Remove if:
        // 1. No observers and stale
        // 2. Exceeds max age
        // 3. Error state and old
        const shouldRemove = 
          (query.getObserversCount() === 0 && query.isStale()) ||
          (config.maxAge && queryAge > config.maxAge) ||
          (query.state.status === 'error' && queryAge > 60000); // Remove errors after 1 minute
        
        if (shouldRemove) {
          cache.remove(query);
          removedCount++;
        }
      });
      
      if (removedCount > 0) {
        logger.info(`Cache cleanup removed ${removedCount} queries`);
      }
      
      // Force garbage collection if cache is too large
      const cacheSize = calculateCacheSize();
      if (cacheSize > MAX_CACHE_SIZE_MB) {
        logger.warn(`Cache size (${cacheSize.toFixed(1)}MB) exceeds limit, forcing cleanup`);
        cache.clear();
      }
      
    } catch (error) {
      logger.error('Error during cache cleanup:', error);
    }
  }, [queryClient, getCacheConfig, calculateCacheSize]);

  // Optimized prefetch with cache config
  const optimizedPrefetch = useCallback(async (
    queryKey: readonly unknown[],
    queryFn: () => Promise<any>,
    cacheType: keyof typeof CACHE_CONFIGS = 'user'
  ) => {
    const config = CACHE_CONFIGS[cacheType];
    
    return queryClient.prefetchQuery({
      queryKey: [...queryKey], // Convert readonly to mutable
      queryFn,
      staleTime: config.staleTime,
      gcTime: config.gcTime,
    });
  }, [queryClient]);

  // Setup automatic cleanup
  useEffect(() => {
    // Initial cleanup
    performCleanup();
    
    // Set up periodic cleanup
    cleanupIntervalRef.current = setInterval(performCleanup, CLEANUP_INTERVAL);
    
    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
        cleanupIntervalRef.current = null;
      }
    };
  }, [performCleanup]);

  // Monitor cache health
  useEffect(() => {
    const checkCacheHealth = () => {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();
      const cacheSize = calculateCacheSize();
      
      if (queries.length > 100) {
        logger.warn(`High query count: ${queries.length}`);
      }
      
      if (cacheSize > MAX_CACHE_SIZE_MB * 0.8) { // 80% of limit
        logger.warn(`Cache size approaching limit: ${cacheSize.toFixed(1)}MB`);
        performCleanup();
      }
    };
    
    const healthCheckInterval = setInterval(checkCacheHealth, 2 * 60 * 1000); // Every 2 minutes
    
    return () => clearInterval(healthCheckInterval);
  }, [queryClient, calculateCacheSize, performCleanup]);

  return {
    getCacheConfig,
    optimizedPrefetch,
    performCleanup,
    calculateCacheSize,
    cacheConfigs: CACHE_CONFIGS
  };
};
