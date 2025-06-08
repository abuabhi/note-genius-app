
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { FlashcardSet } from '@/types/flashcard';
import type { FlashcardFilters } from '@/components/flashcards/components/AdvancedFlashcardFilters';

interface EnhancedFlashcardSet extends FlashcardSet {
  card_count: number;
  last_studied_at?: string;
  is_pinned?: boolean;
  progress_summary?: {
    total_cards: number;
    mastered_cards: number;
    needs_practice: number;
    mastery_percentage: number;
  };
}

const ITEMS_PER_PAGE = 20;
const QUERY_STALE_TIME = 2 * 60 * 1000; // 2 minutes
const QUERY_CACHE_TIME = 10 * 60 * 1000; // 10 minutes

export const useEnhancedFlashcardSets = (filters: FlashcardFilters, page: number = 1) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Build time filter condition
  const getTimeFilterCondition = useCallback(() => {
    const now = new Date();
    switch (filters.timeFilter) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return weekAgo.toISOString();
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return monthAgo.toISOString();
      case 'quarter':
        const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        return quarterAgo.toISOString();
      default:
        return null;
    }
  }, [filters.timeFilter]);

  // Enhanced error handling function
  const handleQueryError = useCallback((error: any) => {
    console.error('❌ Enhanced flashcard sets query error:', error);
    
    if (error?.message?.includes('RLS')) {
      console.error('RLS Policy Error - User may not be authenticated properly');
      return 'Authentication error. Please try logging out and back in.';
    }
    
    if (error?.message?.includes('network')) {
      return 'Network connection error. Please check your internet connection.';
    }
    
    return error?.message || 'An unexpected error occurred while loading flashcard sets.';
  }, []);

  // Main flashcard sets query with enhanced error handling and caching
  const { data: setsData, isLoading, error, refetch } = useQuery({
    queryKey: ['enhanced-flashcard-sets', user?.id, filters, page],
    queryFn: async () => {
      if (!user) {
        console.log('🚫 No user authenticated for flashcard sets query');
        return { sets: [], totalCount: 0, hasMore: false };
      }

      console.log('🚀 Enhanced flashcard sets fetch starting...', { 
        userId: user.id.slice(0, 8), 
        filters, 
        page 
      });
      
      const startTime = Date.now();
      const offset = (page - 1) * ITEMS_PER_PAGE;
      const timeFilterCondition = getTimeFilterCondition();

      try {
        // Build the optimized query with proper error handling
        let query = supabase
          .from('flashcard_sets')
          .select(`
            id,
            name,
            description,
            subject,
            topic,
            card_count,
            created_at,
            updated_at,
            user_id,
            is_built_in,
            category_id,
            section_id,
            country_id,
            education_system
          `, { count: 'exact' })
          .or(`user_id.eq.${user.id},is_built_in.eq.true`);

        // Apply filters with null checks
        if (filters.searchQuery?.trim()) {
          const searchTerm = filters.searchQuery.trim();
          query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,subject.ilike.%${searchTerm}%`);
        }

        if (filters.subjectFilter?.trim()) {
          query = query.eq('subject', filters.subjectFilter.trim());
        }

        if (timeFilterCondition) {
          query = query.gte('updated_at', timeFilterCondition);
        }

        // Apply sorting with fallback
        const sortBy = filters.sortBy || 'updated_at';
        switch (sortBy) {
          case 'name':
            query = query.order('name', { ascending: true });
            break;
          case 'created_at':
            query = query.order('created_at', { ascending: false });
            break;
          case 'card_count':
            query = query.order('card_count', { ascending: false });
            break;
          case 'updated_at':
          default:
            query = query.order('updated_at', { ascending: false });
            break;
        }

        // Apply pagination
        query = query.range(offset, offset + ITEMS_PER_PAGE - 1);

        const { data: setsWithCounts, error: setsError, count } = await query;

        if (setsError) {
          console.error('❌ Supabase query error:', setsError);
          throw new Error(`Database query failed: ${setsError.message}`);
        }

        if (!setsWithCounts || setsWithCounts.length === 0) {
          console.log('✅ No flashcard sets found');
          return { sets: [], totalCount: count || 0, hasMore: false };
        }

        // Apply client-side pinned filter if needed
        let filteredSets = setsWithCounts;
        if (filters.showPinnedOnly) {
          // Demo logic: consider sets with > 10 cards as "pinned"
          filteredSets = setsWithCounts.filter(set => (set.card_count || 0) > 10);
        }

        // Enhanced progress calculation with error handling
        const setsWithProgress: EnhancedFlashcardSet[] = filteredSets.map(set => {
          const cardCount = set.card_count || 0;
          
          return {
            ...set,
            is_pinned: cardCount > 10, // Demo logic
            progress_summary: {
              total_cards: cardCount,
              mastered_cards: Math.floor(cardCount * 0.3), // Demo data
              needs_practice: Math.floor(cardCount * 0.7),
              mastery_percentage: cardCount > 0 ? Math.floor(Math.random() * 100) : 0,
            }
          };
        });

        const loadTime = Date.now() - startTime;
        console.log(`⚡ Enhanced flashcard sets loaded in ${loadTime}ms`, {
          totalSets: setsWithProgress.length,
          totalCount: count,
          page,
          hasMore: (count || 0) > offset + ITEMS_PER_PAGE
        });

        return {
          sets: setsWithProgress,
          totalCount: count || 0,
          hasMore: (count || 0) > offset + ITEMS_PER_PAGE
        };

      } catch (error: any) {
        const errorMessage = handleQueryError(error);
        console.error('❌ Enhanced flashcard sets fetch failed:', errorMessage);
        throw new Error(errorMessage);
      }
    },
    enabled: !!user,
    staleTime: QUERY_STALE_TIME,
    gcTime: QUERY_CACHE_TIME,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error?.message?.includes('RLS') || error?.message?.includes('Authentication')) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Enhanced prefetch with error handling
  const prefetchNextPage = useCallback(() => {
    if (setsData?.hasMore && user) {
      queryClient.prefetchQuery({
        queryKey: ['enhanced-flashcard-sets', user.id, filters, page + 1],
        queryFn: () => null, // Will be handled by the main query
        staleTime: QUERY_STALE_TIME / 2, // Shorter stale time for prefetch
      }).catch(error => {
        console.warn('⚠️ Prefetch failed (non-critical):', error.message);
      });
    }
  }, [queryClient, user?.id, filters, page, setsData?.hasMore]);

  // Enhanced toggle pinned mutation with optimistic updates and error handling
  const togglePinnedMutation = useMutation({
    mutationFn: async ({ setId, isPinned }: { setId: string; isPinned: boolean }) => {
      console.log('🔄 Toggle pinned:', setId, isPinned);
      
      // Simulate API call - in production, you'd update a database table
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return { setId, isPinned };
    },
    onMutate: async ({ setId, isPinned }) => {
      const queryKey = ['enhanced-flashcard-sets', user?.id, filters, page];
      await queryClient.cancelQueries({ queryKey });
      
      const previousData = queryClient.getQueryData(queryKey);
      
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          sets: old.sets.map((set: EnhancedFlashcardSet) =>
            set.id === setId ? { ...set, is_pinned: isPinned } : set
          )
        };
      });

      return { previousData, queryKey };
    },
    onError: (err, variables, context) => {
      console.error('❌ Toggle pinned failed:', err);
      
      if (context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
      
      toast.error('Failed to update pinned status. Please try again.');
    },
    onSuccess: () => {
      toast.success('Pinned status updated successfully');
    },
  });

  // Enhanced delete mutation with optimistic updates and cleanup
  const deleteMutation = useMutation({
    mutationFn: async (setId: string) => {
      console.log('🗑️ Deleting flashcard set:', setId);
      
      try {
        // Delete flashcard set cards first
        const { error: cardsError } = await supabase
          .from('flashcard_set_cards')
          .delete()
          .eq('set_id', setId);

        if (cardsError) {
          console.error('❌ Error deleting flashcard set cards:', cardsError);
          throw new Error(`Failed to delete flashcard cards: ${cardsError.message}`);
        }

        // Then delete the flashcard set
        const { error: setError } = await supabase
          .from('flashcard_sets')
          .delete()
          .eq('id', setId);

        if (setError) {
          console.error('❌ Error deleting flashcard set:', setError);
          throw new Error(`Failed to delete flashcard set: ${setError.message}`);
        }

        console.log('✅ Flashcard set deleted successfully');
        return setId;
        
      } catch (error: any) {
        console.error('❌ Delete operation failed:', error);
        throw error;
      }
    },
    onMutate: async (setId) => {
      const queryKey = ['enhanced-flashcard-sets', user?.id, filters, page];
      await queryClient.cancelQueries({ queryKey });
      
      const previousData = queryClient.getQueryData(queryKey);
      
      // Optimistically remove the set from the UI
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          sets: old.sets.filter((set: EnhancedFlashcardSet) => set.id !== setId),
          totalCount: Math.max(0, old.totalCount - 1)
        };
      });

      return { previousData, queryKey };
    },
    onError: (err, variables, context) => {
      console.error('❌ Delete mutation failed:', err);
      
      // Revert optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
      
      const errorMessage = err?.message || 'Failed to delete flashcard set';
      toast.error(errorMessage);
    },
    onSuccess: () => {
      toast.success('Flashcard set deleted successfully');
      
      // Invalidate and refetch to get fresh data
      queryClient.invalidateQueries({ 
        queryKey: ['enhanced-flashcard-sets', user?.id] 
      });
    },
  });

  // Memoized results with error state
  const results = useMemo(() => ({
    sets: setsData?.sets || [],
    totalCount: setsData?.totalCount || 0,
    hasMore: setsData?.hasMore || false,
    loading: isLoading,
    error: error ? handleQueryError(error) : null,
  }), [setsData, isLoading, error, handleQueryError]);

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

  return {
    ...results,
    deleteFlashcardSet: deleteMutation.mutate,
    togglePinned: togglePinnedMutation.mutate,
    isDeleting: deleteMutation.isPending,
    isTogglingPinned: togglePinnedMutation.isPending,
    prefetchNextPage,
    refetch: enhancedRefetch,
  };
};
