
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';

const QUERY_STALE_TIME = 2 * 60 * 1000; // 2 minutes

export const useFlashcardSetPrefetch = (filters: any, page: number, hasMore: boolean) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const prefetchNextPage = useCallback(() => {
    if (hasMore && user) {
      queryClient.prefetchQuery({
        queryKey: ['enhanced-flashcard-sets', user.id, filters, page + 1],
        queryFn: () => null,
        staleTime: QUERY_STALE_TIME / 2,
      }).catch(error => {
        console.warn('⚠️ Prefetch failed (non-critical):', error.message);
      });
    }
  }, [queryClient, user?.id, filters, page, hasMore]);

  return { prefetchNextPage };
};
