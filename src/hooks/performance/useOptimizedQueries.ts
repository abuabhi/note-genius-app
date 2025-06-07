
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export const useOptimizedQuery = () => {
  const queryClient = useQueryClient();

  const prefetchData = useCallback((queryKeys: string[]) => {
    queryKeys.forEach(key => {
      queryClient.prefetchQuery({
        queryKey: [key],
        queryFn: () => Promise.resolve([]),
        staleTime: 5 * 60 * 1000,
      });
    });
  }, [queryClient]);

  return {
    prefetchData
  };
};
