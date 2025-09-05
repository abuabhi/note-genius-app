import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { useManagedInterval } from '@/utils/performance';

interface QueryOptimizationConfig {
  enablePrefetching: boolean;
  enableBatchInvalidation: boolean;
  enableIntelligentCaching: boolean;
  prefetchThreshold: number; // Minutes before query becomes stale to prefetch
  batchInvalidationDelay: number; // ms to wait before executing batch invalidations
}

const DEFAULT_CONFIG: QueryOptimizationConfig = {
  enablePrefetching: true,
  enableBatchInvalidation: true,
  enableIntelligentCaching: true,
  prefetchThreshold: 2, // 2 minutes
  batchInvalidationDelay: 500, // 500ms
};

export const useQueryOptimization = (config: Partial<QueryOptimizationConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Batch invalidation queue
  const invalidationQueue = useRef<Set<string>>(new Set());
  const invalidationTimeoutRef = useRef<NodeJS.Timeout>();

  // Query patterns for intelligent prefetching
  const commonQueryPatterns = useRef({
    userDataQueries: [
      ['userProfile', user?.id],
      ['studyStats', user?.id],
      ['flashcardSets', user?.id],
    ],
    dashboardQueries: [
      ['todaysFocus', user?.id],
      ['userActivity', user?.id],
      ['goals', user?.id],
    ],
    flashcardQueries: (setId?: string) => [
      ['flashcards', setId, user?.id],
      ['flashcardProgress', setId, user?.id],
    ],
  });

  // Intelligent prefetching based on user navigation patterns
  const prefetchRelatedQueries = useCallback((currentQueryKey: readonly unknown[]) => {
    if (!finalConfig.enablePrefetching || !user) return;

    const keyString = JSON.stringify(currentQueryKey);

    // Prefetch user data when any user-related query is accessed
    if (keyString.includes(user.id)) {
      commonQueryPatterns.current.userDataQueries.forEach(queryKey => {
        queryClient.prefetchQuery({
          queryKey,
          staleTime: 5 * 60 * 1000, // 5 minutes
        });
      });
    }

    // Prefetch dashboard data when navigating to dashboard
    if (keyString.includes('dashboard') || keyString.includes('todaysFocus')) {
      commonQueryPatterns.current.dashboardQueries.forEach(queryKey => {
        queryClient.prefetchQuery({
          queryKey,
          staleTime: 2 * 60 * 1000, // 2 minutes
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
          commonQueryPatterns.current.flashcardQueries(set.id).forEach(queryKey => {
            queryClient.prefetchQuery({
              queryKey,
              staleTime: 3 * 60 * 1000, // 3 minutes
            });
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

    // Clear existing timeout
    if (invalidationTimeoutRef.current) {
      clearTimeout(invalidationTimeoutRef.current);
    }

    // Set new timeout to process batch
    invalidationTimeoutRef.current = setTimeout(() => {
      const queriesToInvalidate = Array.from(invalidationQueue.current);
      
      // Process all queued invalidations at once
      queriesToInvalidate.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });

      // Clear the queue
      invalidationQueue.current.clear();
      
      console.log(`📊 [Query Optimization] Batch invalidated ${queriesToInvalidate.length} query types`);
    }, finalConfig.batchInvalidationDelay);
  }, [queryClient, finalConfig.enableBatchInvalidation, finalConfig.batchInvalidationDelay]);

  // Intelligent cache warming based on user activity
  const warmCache = useCallback(() => {
    if (!finalConfig.enableIntelligentCaching || !user) return;

    const now = Date.now();
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();

    queries.forEach(query => {
      const timeSinceUpdate = now - (query.state.dataUpdatedAt || 0);
      const staleTime = query.options.staleTime || 0;
      
      // Prefetch if approaching stale time
      if (staleTime > 0 && timeSinceUpdate > staleTime - (finalConfig.prefetchThreshold * 60 * 1000)) {
        if (query.queryKey[0] === 'flashcardSets' || 
            query.queryKey[0] === 'userProfile' ||
            query.queryKey[0] === 'studyStats') {
          
          queryClient.prefetchQuery({
            queryKey: query.queryKey,
            staleTime: staleTime,
          });
        }
      }
    });
  }, [queryClient, user, finalConfig.enableIntelligentCaching, finalConfig.prefetchThreshold]);

  // Periodic cache warming
  useManagedInterval('query-cache-warming', warmCache, 2 * 60 * 1000); // Every 2 minutes

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
    batchInvalidateQueries('todos');
  }, [batchInvalidateQueries]);

  const invalidateFlashcardQueries = useCallback((setId?: string) => {
    if (setId) {
      batchInvalidateQueries(`flashcards-${setId}`);
      batchInvalidateQueries(`flashcardProgress-${setId}`);
    }
    batchInvalidateQueries('flashcardSets');
  }, [batchInvalidateQueries]);

  const invalidateStudyQueries = useCallback(() => {
    batchInvalidateQueries('studyStats');
    batchInvalidateQueries('dueCards');
    batchInvalidateQueries('studySessions');
  }, [batchInvalidateQueries]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (invalidationTimeoutRef.current) {
        clearTimeout(invalidationTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Core optimization functions
    prefetchRelatedQueries,
    batchInvalidateQueries,
    warmCache,
    
    // Specialized invalidation strategies
    invalidateUserQueries,
    invalidateFlashcardQueries,
    invalidateStudyQueries,
    
    // Performance monitoring
    getQueryPerformanceStats,
    
    // Configuration
    isOptimizationEnabled: finalConfig.enablePrefetching || 
                          finalConfig.enableBatchInvalidation || 
                          finalConfig.enableIntelligentCaching,
  };
};