
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

  // Main flashcard sets query with database-level filtering
  const { data: setsData, isLoading, error, refetch } = useQuery({
    queryKey: ['enhanced-flashcard-sets', user?.id, filters, page],
    queryFn: async () => {
      if (!user) return { sets: [], totalCount: 0, hasMore: false };

      console.log('🚀 Enhanced flashcard sets fetch starting...', { filters, page });
      const startTime = Date.now();

      const offset = (page - 1) * ITEMS_PER_PAGE;
      const timeFilterCondition = getTimeFilterCondition();

      // Build the base query
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

      // Apply filters
      if (filters.searchQuery) {
        query = query.or(`name.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
      }

      if (filters.subjectFilter) {
        query = query.eq('subject', filters.subjectFilter);
      }

      if (timeFilterCondition) {
        query = query.gte('updated_at', timeFilterCondition);
      }

      // Apply sorting
      switch (filters.sortBy) {
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
        console.error('❌ Error fetching flashcard sets:', setsError);
        throw setsError;
      }

      if (!setsWithCounts || setsWithCounts.length === 0) {
        console.log('✅ No flashcard sets found');
        return { sets: [], totalCount: count || 0, hasMore: false };
      }

      // For pinned filter, we'll handle this in the frontend for now
      // In a real app, you'd want a pinned_sets table or pinned column
      let filteredSets = setsWithCounts;
      
      if (filters.showPinnedOnly) {
        // For demo purposes, consider sets with card_count > 10 as "pinned"
        // In production, you'd query a proper pinned_sets table
        filteredSets = setsWithCounts.filter(set => (set.card_count || 0) > 10);
      }

      // Light progress calculation - only for visible sets
      const setsWithProgress: EnhancedFlashcardSet[] = filteredSets.map(set => ({
        ...set,
        is_pinned: (set.card_count || 0) > 10, // Demo logic
        progress_summary: {
          total_cards: set.card_count || 0,
          mastered_cards: Math.floor((set.card_count || 0) * 0.3), // Demo data
          needs_practice: Math.floor((set.card_count || 0) * 0.7),
          mastery_percentage: Math.floor(Math.random() * 100),
        }
      }));

      const loadTime = Date.now() - startTime;
      console.log(`⚡ Enhanced flashcard sets loaded in ${loadTime}ms`, {
        totalSets: setsWithProgress.length,
        totalCount: count,
        page,
        filters
      });

      return {
        sets: setsWithProgress,
        totalCount: count || 0,
        hasMore: (count || 0) > offset + ITEMS_PER_PAGE
      };
    },
    enabled: !!user,
    staleTime: 60 * 1000, // 1 minute - shorter for real-time feel
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData, // Keep previous data while loading
  });

  // Prefetch next page
  const prefetchNextPage = useCallback(() => {
    if (setsData?.hasMore) {
      queryClient.prefetchQuery({
        queryKey: ['enhanced-flashcard-sets', user?.id, filters, page + 1],
        queryFn: () => null, // Will be handled by the main query
        staleTime: 30 * 1000,
      });
    }
  }, [queryClient, user?.id, filters, page, setsData?.hasMore]);

  // Toggle pinned mutation (demo - in production, you'd update a database table)
  const togglePinnedMutation = useMutation({
    mutationFn: async ({ setId, isPinned }: { setId: string; isPinned: boolean }) => {
      // In production, you'd update a pinned_sets table or add a pinned column
      console.log('Toggle pinned:', setId, isPinned);
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API call
      return { setId, isPinned };
    },
    onMutate: async ({ setId, isPinned }) => {
      // Optimistic update
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
      if (context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
      toast.error('Failed to update pinned status');
    },
    onSuccess: () => {
      toast.success('Pinned status updated');
    },
  });

  // Delete mutation with optimistic updates
  const deleteMutation = useMutation({
    mutationFn: async (setId: string) => {
      const { error: cardsError } = await supabase
        .from('flashcard_set_cards')
        .delete()
        .eq('set_id', setId);

      if (cardsError) throw cardsError;

      const { error: setError } = await supabase
        .from('flashcard_sets')
        .delete()
        .eq('id', setId);

      if (setError) throw setError;
    },
    onMutate: async (setId) => {
      // Optimistic update
      const queryKey = ['enhanced-flashcard-sets', user?.id, filters, page];
      await queryClient.cancelQueries({ queryKey });
      
      const previousData = queryClient.getQueryData(queryKey);
      
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
      if (context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
      toast.error('Failed to delete flashcard set');
    },
    onSuccess: () => {
      toast.success('Flashcard set deleted successfully');
      // Invalidate to refresh counts
      queryClient.invalidateQueries({ 
        queryKey: ['enhanced-flashcard-sets', user?.id] 
      });
    },
  });

  // Memoized results
  const results = useMemo(() => ({
    sets: setsData?.sets || [],
    totalCount: setsData?.totalCount || 0,
    hasMore: setsData?.hasMore || false,
    loading: isLoading,
    error: error?.message || null,
  }), [setsData, isLoading, error]);

  return {
    ...results,
    deleteFlashcardSet: deleteMutation.mutate,
    togglePinned: togglePinnedMutation.mutate,
    isDeleting: deleteMutation.isPending,
    prefetchNextPage,
    refetch: () => queryClient.invalidateQueries({ 
      queryKey: ['enhanced-flashcard-sets', user?.id] 
    }),
  };
};
