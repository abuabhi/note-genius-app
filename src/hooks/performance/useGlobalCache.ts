
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';

interface CacheConfig {
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
}

export const useGlobalCache = () => {
  const queryClient = useQueryClient();

  const invalidateQueries = useCallback((queryKeys: string[]) => {
    queryKeys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: [key] });
    });
  }, [queryClient]);

  const prefetchQuery = useCallback(async (
    queryKey: string[], 
    queryFn: () => Promise<any>, 
    config?: CacheConfig
  ) => {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime: config?.staleTime || 5 * 60 * 1000, // 5 minutes
      gcTime: config?.cacheTime || 10 * 60 * 1000, // 10 minutes
    });
  }, [queryClient]);

  const clearCache = useCallback(() => {
    queryClient.clear();
  }, [queryClient]);

  return {
    invalidateQueries,
    prefetchQuery,
    clearCache,
    queryClient
  };
};
