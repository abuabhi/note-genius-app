
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useProductionMetrics } from './useProductionMetrics';

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
      // This is a placeholder - implement based on your routing
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

  return {
    invalidateCache,
    prefetchRelatedData,
    warmCache
  };
};
