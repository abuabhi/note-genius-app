import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { useManagedTimeout } from '@/utils/performance';

interface QueryOptimizationConfig {
  enablePrefetching: boolean;
  enableBatchInvalidation: boolean;
  batchInvalidationDelay: number; // ms to wait before executing batch invalidations
}

const DEFAULT_CONFIG: QueryOptimizationConfig = {
  enablePrefetching: true,
  enableBatchInvalidation: true,
  batchInvalidationDelay: 500, // 500ms
};

export const useQueryOptimization = (config: Partial<QueryOptimizationConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Batch invalidation queue
  const invalidationQueue = useRef<Set<string>>(new Set());
  const [shouldInvalidate, setShouldInvalidate] = useState(false);

  // Managed timeout for batch invalidation
  useManagedTimeout('batch-invalidation', () => {
    const queriesToInvalidate = Array.from(invalidationQueue.current);
    
    // Process all queued invalidations at once
    queriesToInvalidate.forEach(key => {
      queryClient.invalidateQueries({ queryKey: [key] });
    });

    // Clear the queue
    invalidationQueue.current.clear();
    setShouldInvalidate(false);
    
    console.log(`📊 [Query Optimization] Batch invalidated ${queriesToInvalidate.length} query types`);
  }, shouldInvalidate ? finalConfig.batchInvalidationDelay : null);

  // Intelligent prefetching based on user navigation patterns
  const prefetchRelatedQueries = useCallback((currentQueryKey: readonly unknown[]) => {
    if (!finalConfig.enablePrefetching || !user) return;

    const keyString = JSON.stringify(currentQueryKey);

    // Prefetch user data when any user-related query is accessed
    if (keyString.includes(user.id)) {
      const userQueries = [
        ['userProfile', user.id],
        ['studyStats', user.id],
        ['flashcardSets', user.id],
      ];
      
      userQueries.forEach(queryKey => {
        queryClient.prefetchQuery({
          queryKey,
        });
      });
    }

    // Prefetch flashcard data when accessing flashcard sets
    if (keyString.includes('flashcardSets')) {
      const cache = queryClient.getQueryCache();
      const flashcardSetsQuery = cache.find({ queryKey: ['flashcardSets', user.id] });
      
      if (flashcardSetsQuery?.state.data) {
        const sets = flashcardSetsQuery.state.data as any[];
        // Prefetch the first few sets' flashcards
        sets.slice(0, 3).forEach(set => {
          queryClient.prefetchQuery({
            queryKey: ['flashcards', set.id, user.id],
          });
        });
      }
    }
  }, [queryClient, user, finalConfig.enablePrefetching]);

  // Batch invalidation to reduce re-renders
  const batchInvalidateQueries = useCallback((queryKey: string) => {
    if (!finalConfig.enableBatchInvalidation) {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      return;
    }

    // Add to batch queue
    invalidationQueue.current.add(queryKey);
    setShouldInvalidate(true);
  }, [queryClient, finalConfig.enableBatchInvalidation]);

  // Query performance monitoring
  const getQueryPerformanceStats = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    const stats = {
      totalQueries: queries.length,
      staleQueries: queries.filter(q => q.isStale()).length,
      freshQueries: queries.filter(q => !q.isStale()).length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
      loadingQueries: queries.filter(q => q.state.status === 'pending').length,
      cachedQueries: queries.filter(q => q.state.data !== undefined).length,
    };

    const cacheHitRate = stats.totalQueries > 0 
      ? Math.round((stats.cachedQueries / stats.totalQueries) * 100)
      : 0;

    return {
      ...stats,
      cacheHitRate,
      healthScore: Math.round(
        (stats.freshQueries * 0.4 + 
         stats.cachedQueries * 0.3 + 
         (stats.totalQueries - stats.errorQueries) * 0.3) / 
        Math.max(stats.totalQueries, 1) * 100
      ),
    };
  }, [queryClient]);

  // Optimized query invalidation strategies
  const invalidateUserQueries = useCallback(() => {
    batchInvalidateQueries('userProfile');
    batchInvalidateQueries('studyStats');
    batchInvalidateQueries('flashcardSets');
    batchInvalidateQueries('goals');
  }, [batchInvalidateQueries]);

  const invalidateFlashcardQueries = useCallback((setId?: string) => {
    if (setId) {
      batchInvalidateQueries(`flashcards-${setId}`);
      batchInvalidateQueries(`flashcardProgress-${setId}`);
    }
    batchInvalidateQueries('flashcardSets');
  }, [batchInvalidateQueries]);

  return {
    // Core optimization functions
    prefetchRelatedQueries,
    batchInvalidateQueries,
    
    // Specialized invalidation strategies
    invalidateUserQueries,
    invalidateFlashcardQueries,
    
    // Performance monitoring
    getQueryPerformanceStats,
    
    // Configuration
    isOptimizationEnabled: finalConfig.enablePrefetching || finalConfig.enableBatchInvalidation,
  };
};
