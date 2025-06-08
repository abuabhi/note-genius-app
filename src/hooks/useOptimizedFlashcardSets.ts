
import { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { useFlashcardSetsQuery } from './flashcards/useFlashcardSetsQuery';
import { useFlashcardSetMutations } from './flashcards/useFlashcardSetMutations';
import { useFlashcardSetPrefetch } from './flashcards/useFlashcardSetPrefetch';
import type { FlashcardFilters } from '@/components/flashcards/components/AdvancedFlashcardFilters';

interface UseOptimizedFlashcardSetsProps {
  filters?: FlashcardFilters;
  page?: number;
  pageSize?: number;
}

export const useOptimizedFlashcardSets = (props: UseOptimizedFlashcardSetsProps = {}) => {
  const { 
    filters = {
      searchQuery: '',
      subjectFilter: 'all',
      difficultyFilter: 'all',
      progressFilter: 'all',
      sortBy: 'updated_at',
      sortOrder: 'desc',
      viewMode: 'grid',
      showPinnedOnly: false
    }, 
    page = 1, 
    pageSize = 12 
  } = props;

  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Use the separated query hook
  const { data: setsData, isLoading, error, refetch } = useFlashcardSetsQuery(filters, page);

  // Use the mutations hook
  const mutations = useFlashcardSetMutations(filters, page);

  // Use the prefetch hook
  const { prefetchNextPage } = useFlashcardSetPrefetch(filters, page, setsData?.hasMore || false);

  // Enhanced refetch function
  const enhancedRefetch = useCallback(async () => {
    try {
      console.log('🔄 Manual refetch triggered');
      await queryClient.invalidateQueries({ 
        queryKey: ['enhanced-flashcard-sets', user?.id] 
      });
      return refetch();
    } catch (error) {
      console.error('❌ Manual refetch failed:', error);
      toast.error('Failed to refresh data. Please try again.');
    }
  }, [queryClient, user?.id, refetch]);

  // Handle query error for consistent error messaging
  const handleQueryError = useCallback((error: any) => {
    if (error?.message?.includes('RLS')) {
      return 'Authentication error. Please try logging out and back in.';
    }
    
    if (error?.message?.includes('network')) {
      return 'Network connection error. Please check your internet connection.';
    }
    
    return error?.message || 'An unexpected error occurred while loading flashcard sets.';
  }, []);

  // Memoized results with error state
  const results = useMemo(() => ({
    allSets: setsData?.sets || [],
    totalCount: setsData?.totalCount || 0,
    hasMore: setsData?.hasMore || false,
    loading: isLoading,
    error: error ? handleQueryError(error) : null,
  }), [setsData, isLoading, error, handleQueryError]);

  return {
    ...results,
    ...mutations,
    prefetchNextPage,
    refetch: enhancedRefetch,
  };
};
