
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCallback, useMemo } from 'react';

// Query key factory for consistent cache keys
export const queryKeys = {
  all: ['app'] as const,
  users: () => [...queryKeys.all, 'users'] as const,
  user: (id: string) => [...queryKeys.users(), id] as const,
  notes: () => [...queryKeys.all, 'notes'] as const,
  notesBySubject: (subject: string) => [...queryKeys.notes(), 'subject', subject] as const,
  flashcards: () => [...queryKeys.all, 'flashcards'] as const,
  flashcardSets: () => [...queryKeys.flashcards(), 'sets'] as const,
  flashcardSet: (id: string) => [...queryKeys.flashcardSets(), id] as const,
  progress: () => [...queryKeys.all, 'progress'] as const,
  sessions: () => [...queryKeys.all, 'sessions'] as const,
};

// Optimized database query with caching and error handling
export const useOptimizedQuery = <T>(
  queryKey: readonly string[],
  queryFn: () => Promise<T>,
  options?: {
    staleTime?: number;
    cacheTime?: number;
    enabled?: boolean;
    retry?: number;
  }
) => {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    gcTime: options?.cacheTime || 10 * 60 * 1000, // 10 minutes
    enabled: options?.enabled !== false,
    retry: options?.retry || 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
  });
};

// Batch query optimization for related data
export const useBatchQueries = () => {
  const queryClient = useQueryClient();

  const batchFetch = useCallback(async (queries: Array<{ key: string[]; fn: () => Promise<any> }>) => {
    const results = await Promise.allSettled(
      queries.map(async ({ key, fn }) => {
        // Check if data is already cached
        const cached = queryClient.getQueryData(key);
        if (cached) {
          return { key, data: cached, fromCache: true };
        }
        
        try {
          const data = await fn();
          queryClient.setQueryData(key, data);
          return { key, data, fromCache: false };
        } catch (error) {
          return { key, error, fromCache: false };
        }
      })
    );

    return results.map((result, index) => ({
      key: queries[index].key,
      ...(result.status === 'fulfilled' ? result.value : { error: result.reason })
    }));
  }, [queryClient]);

  return { batchFetch };
};

// Optimized mutation with cache invalidation
export const useOptimizedMutation = <T, V>(
  mutationFn: (variables: V) => Promise<T>,
  options?: {
    onSuccess?: (data: T, variables: V) => void;
    onError?: (error: Error, variables: V) => void;
    invalidateQueries?: string[][];
  }
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      // Invalidate related queries
      options?.invalidateQueries?.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });
      
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
    retry: 1,
  });
};

// Prefetch utility for predictive loading
export const usePrefetchUtils = () => {
  const queryClient = useQueryClient();

  const prefetchUserData = useCallback(async (userId: string) => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.user(userId),
        queryFn: () => supabase.from('profiles').select('*').eq('id', userId).single(),
        staleTime: 10 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.notesBySubject('recent'),
        queryFn: () => supabase.from('notes').select('*').eq('user_id', userId).limit(5),
        staleTime: 5 * 60 * 1000,
      }),
    ]);
  }, [queryClient]);

  const prefetchStudyData = useCallback(async () => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.sessions(),
        queryFn: () => supabase.from('study_sessions').select('*').limit(10),
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.progress(),
        queryFn: () => supabase.from('study_analytics').select('*').limit(10),
        staleTime: 10 * 60 * 1000,
      }),
    ]);
  }, [queryClient]);

  return {
    prefetchUserData,
    prefetchStudyData,
  };
};

// Cache warming for critical data
export const useCacheWarming = () => {
  const { prefetchUserData, prefetchStudyData } = usePrefetchUtils();

  const warmCache = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Warm cache with user's most likely needed data
      await Promise.all([
        prefetchUserData(user.id),
        prefetchStudyData(),
      ]);
    }
  }, [prefetchUserData, prefetchStudyData]);

  return { warmCache };
};
