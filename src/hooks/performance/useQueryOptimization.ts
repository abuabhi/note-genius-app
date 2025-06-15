
import { useCallback, useRef } from 'react';
import { useMemoryOptimization } from './useMemoryOptimization';

interface QueryOptimizationConfig {
  enableCaching: boolean;
  cacheTTL: number;
  maxRetries: number;
  retryDelay: number;
}

export const useQueryOptimization = (config: QueryOptimizationConfig = {
  enableCaching: true,
  cacheTTL: 300000, // 5 minutes
  maxRetries: 3,
  retryDelay: 1000
}) => {
  const { addToCache, getFromCache } = useMemoryOptimization();
  const queryStatsRef = useRef({ hits: 0, misses: 0, errors: 0 });

  const generateCacheKey = useCallback((queryKey: any[]) => {
    return JSON.stringify(queryKey);
  }, []);

  const optimizedQuery = useCallback(async <T>(
    queryKey: any[],
    queryFn: () => Promise<T>,
    options: { skipCache?: boolean; ttl?: number } = {}
  ): Promise<T> => {
    const cacheKey = generateCacheKey(queryKey);
    const startTime = performance.now();

    // Try cache first (if enabled and not skipped)
    if (config.enableCaching && !options.skipCache) {
      const cachedResult = getFromCache(cacheKey);
      if (cachedResult) {
        queryStatsRef.current.hits++;
        console.log('🎯 [QUERY] Cache hit for:', queryKey, 'in', Math.round(performance.now() - startTime), 'ms');
        return cachedResult;
      }
    }

    // Execute query with retry logic
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
      try {
        const result = await queryFn();
        const duration = Math.round(performance.now() - startTime);
        
        // Cache the result
        if (config.enableCaching) {
          addToCache(cacheKey, result);
        }
        
        queryStatsRef.current.misses++;
        console.log('📊 [QUERY] Executed:', queryKey, 'in', duration, 'ms', attempt > 1 ? `(retry ${attempt})` : '');
        
        return result;
      } catch (error) {
        lastError = error as Error;
        queryStatsRef.current.errors++;
        
        if (attempt < config.maxRetries) {
          console.log('⚠️ [QUERY] Retry', attempt, 'for:', queryKey, 'Error:', error);
          await new Promise(resolve => setTimeout(resolve, config.retryDelay * attempt));
        }
      }
    }

    console.error('❌ [QUERY] Failed after', config.maxRetries, 'attempts:', queryKey, lastError);
    throw lastError;
  }, [config, addToCache, getFromCache, generateCacheKey]);

  const invalidateCache = useCallback((queryKeyPattern: any[]) => {
    const pattern = generateCacheKey(queryKeyPattern);
    console.log('🗑️ [QUERY] Invalidating cache for pattern:', pattern);
    // Note: This is a simple implementation. In a real app, you'd want more sophisticated cache invalidation
  }, [generateCacheKey]);

  const getQueryStats = useCallback(() => {
    const stats = queryStatsRef.current;
    const total = stats.hits + stats.misses;
    const hitRate = total > 0 ? (stats.hits / total * 100).toFixed(1) : '0';
    
    return {
      ...stats,
      total,
      hitRate: `${hitRate}%`
    };
  }, []);

  return {
    optimizedQuery,
    invalidateCache,
    getQueryStats
  };
};
