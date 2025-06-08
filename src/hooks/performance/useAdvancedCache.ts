
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useProductionMetrics } from './useProductionMetrics';

interface BackgroundSyncConfig {
  interval: number;
  enabled: boolean;
  queryKeys: string[][];
}

let backgroundSyncInterval: NodeJS.Timeout | null = null;

export const useAdvancedCache = () => {
  const queryClient = useQueryClient();
  const { recordMetric } = useProductionMetrics('AdvancedCache');

  // Smart cache invalidation - only invalidate specific queries
  const invalidateCache = useCallback((reason: string, metadata?: Record<string, any>) => {
    recordMetric('cache_invalidation', 1, { reason, ...metadata });
    
    // Only invalidate the specific notes query, not all cache
    queryClient.invalidateQueries({ 
      queryKey: ['optimized-notes'],
      exact: false,
      refetchType: 'active' // Only refetch active queries
    });
  }, [queryClient, recordMetric]);

  // Prefetch related data based on user behavior
  const prefetchRelatedData = useCallback(async (noteId: string) => {
    try {
      // Prefetch note details if user is likely to view it
      recordMetric('prefetch_related_data', 1, { noteId });
    } catch (error) {
      recordMetric('prefetch_error', 1, { error: error instanceof Error ? error.message : 'Unknown' });
    }
  }, [recordMetric]);

  // Warm cache with essential data
  const warmCache = useCallback(async () => {
    try {
      // Pre-populate cache with first page of notes
      await queryClient.prefetchQuery({
        queryKey: ['optimized-notes'],
        staleTime: 60 * 1000, // 1 minute
      });
      recordMetric('cache_warm_success', 1);
    } catch (error) {
      recordMetric('cache_warm_error', 1, { error: error instanceof Error ? error.message : 'Unknown' });
    }
  }, [queryClient, recordMetric]);

  // Start background sync
  const startBackgroundSync = useCallback((config: BackgroundSyncConfig) => {
    if (backgroundSyncInterval) {
      clearInterval(backgroundSyncInterval);
    }

    if (config.enabled) {
      backgroundSyncInterval = setInterval(() => {
        config.queryKeys.forEach(queryKey => {
          queryClient.invalidateQueries({ 
            queryKey,
            refetchType: 'active'
          });
        });
        recordMetric('background_sync', 1);
      }, config.interval);
    }
  }, [queryClient, recordMetric]);

  // Stop background sync
  const stopBackgroundSync = useCallback(() => {
    if (backgroundSyncInterval) {
      clearInterval(backgroundSyncInterval);
      backgroundSyncInterval = null;
      recordMetric('background_sync_stopped', 1);
    }
  }, [recordMetric]);

  // Get cache statistics
  const getCacheStats = useCallback(() => {
    const queryCache = queryClient.getQueryCache();
    const queries = queryCache.getAll();
    
    return {
      totalQueries: queries.length,
      activeQueries: queries.filter(q => q.isActive()).length,
      staleQueries: queries.filter(q => q.isStale()).length,
      errorQueries: queries.filter(q => q.state.status === 'error').length
    };
  }, [queryClient]);

  return {
    invalidateCache,
    prefetchRelatedData,
    warmCache,
    startBackgroundSync,
    stopBackgroundSync,
    getCacheStats
  };
};
