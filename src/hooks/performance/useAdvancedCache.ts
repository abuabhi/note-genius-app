
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { Note } from '@/types/note';

interface CacheInvalidationRule {
  queryKey: string[];
  dependencies: string[];
  ttl?: number;
}

interface BackgroundSyncOptions {
  interval: number;
  enabled: boolean;
  queryKeys: string[][];
}

export const useAdvancedCache = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const backgroundSyncRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncRef = useRef<number>(0);

  // Cache invalidation rules
  const invalidationRules: CacheInvalidationRule[] = [
    {
      queryKey: ['optimized-notes'],
      dependencies: ['note-created', 'note-updated', 'note-deleted'],
      ttl: 5 * 60 * 1000 // 5 minutes
    },
    {
      queryKey: ['user-subjects'],
      dependencies: ['subject-created', 'subject-updated'],
      ttl: 30 * 60 * 1000 // 30 minutes
    },
    {
      queryKey: ['note-tags'],
      dependencies: ['tag-created', 'tag-updated'],
      ttl: 15 * 60 * 1000 // 15 minutes
    }
  ];

  // Intelligent cache invalidation
  const invalidateCache = useCallback((event: string, data?: any) => {
    console.log('🔄 Cache invalidation triggered:', event, data);
    
    invalidationRules.forEach(rule => {
      if (rule.dependencies.includes(event)) {
        console.log('♻️ Invalidating cache for:', rule.queryKey);
        queryClient.invalidateQueries({ queryKey: rule.queryKey });
      }
    });
  }, [queryClient]);

  // Smart prefetching based on user behavior
  const prefetchRelatedData = useCallback(async (noteId: string) => {
    if (!user) return;

    try {
      // Prefetch related notes
      await queryClient.prefetchQuery({
        queryKey: ['related-notes', noteId],
        queryFn: async () => {
          // Mock implementation - replace with actual logic
          console.log('🔮 Prefetching related notes for:', noteId);
          return [];
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
      });

      // Prefetch note tags
      await queryClient.prefetchQuery({
        queryKey: ['note-tags', noteId],
        queryFn: async () => {
          console.log('🏷️ Prefetching tags for note:', noteId);
          return [];
        },
        staleTime: 15 * 60 * 1000, // 15 minutes
      });
    } catch (error) {
      console.warn('Failed to prefetch related data:', error);
    }
  }, [queryClient, user]);

  // Background synchronization
  const startBackgroundSync = useCallback((options: BackgroundSyncOptions) => {
    if (!options.enabled || !user) return;

    if (backgroundSyncRef.current) {
      clearInterval(backgroundSyncRef.current);
    }

    backgroundSyncRef.current = setInterval(async () => {
      const now = Date.now();
      const timeSinceLastSync = now - lastSyncRef.current;
      
      // Only sync if enough time has passed
      if (timeSinceLastSync < options.interval) return;

      console.log('🔄 Starting background cache sync...');
      lastSyncRef.current = now;

      try {
        // Refresh critical queries in background
        await Promise.all(
          options.queryKeys.map(queryKey =>
            queryClient.refetchQueries({ 
              queryKey,
              type: 'active' // Only refetch active queries
            })
          )
        );
        console.log('✅ Background sync completed');
      } catch (error) {
        console.warn('⚠️ Background sync failed:', error);
      }
    }, options.interval);
  }, [queryClient, user]);

  // Stop background sync
  const stopBackgroundSync = useCallback(() => {
    if (backgroundSyncRef.current) {
      clearInterval(backgroundSyncRef.current);
      backgroundSyncRef.current = null;
      console.log('⏹️ Background sync stopped');
    }
  }, []);

  // Cache warming - preload commonly accessed data
  const warmCache = useCallback(async () => {
    if (!user) return;

    console.log('🔥 Warming cache...');

    try {
      // Warm up user subjects
      await queryClient.prefetchQuery({
        queryKey: ['user-subjects', user.id],
        queryFn: async () => {
          console.log('📚 Warming subjects cache');
          return [];
        },
        staleTime: 30 * 60 * 1000,
      });

      // Warm up recent notes
      await queryClient.prefetchQuery({
        queryKey: ['recent-notes', user.id],
        queryFn: async () => {
          console.log('📝 Warming recent notes cache');
          return [];
        },
        staleTime: 5 * 60 * 1000,
      });

      console.log('✅ Cache warming completed');
    } catch (error) {
      console.warn('⚠️ Cache warming failed:', error);
    }
  }, [queryClient, user]);

  // Cache metrics and monitoring
  const getCacheStats = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    const stats = {
      totalQueries: queries.length,
      activeQueries: queries.filter(q => q.getObserversCount() > 0).length,
      staleQueries: queries.filter(q => q.isStale()).length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
      successQueries: queries.filter(q => q.state.status === 'success').length,
      loadingQueries: queries.filter(q => q.state.status === 'pending').length,
      memoryUsage: JSON.stringify(queries.map(q => q.state.data)).length,
    };

    return stats;
  }, [queryClient]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopBackgroundSync();
    };
  }, [stopBackgroundSync]);

  return {
    invalidateCache,
    prefetchRelatedData,
    startBackgroundSync,
    stopBackgroundSync,
    warmCache,
    getCacheStats
  };
};
