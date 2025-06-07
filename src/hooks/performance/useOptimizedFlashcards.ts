
import { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FlashcardFilters {
  subject?: string;
  difficulty?: number;
  searchTerm?: string;
}

const ITEMS_PER_PAGE = 12;

export const useOptimizedFlashcards = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FlashcardFilters>({});
  const queryClient = useQueryClient();

  // Optimized flashcard sets query with pagination
  const { data: flashcardSetsData, isLoading: setsLoading } = useQuery({
    queryKey: ['flashcardSets', currentPage, filters],
    queryFn: async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      
      let query = supabase
        .from('flashcard_sets')
        .select(`
          id, name, description, subject, card_count, created_at, updated_at,
          flashcard_set_cards!inner(flashcard_id)
        `)
        .or(`user_id.eq.${userId},is_built_in.eq.true`)
        .range(offset, offset + ITEMS_PER_PAGE - 1)
        .order('updated_at', { ascending: false });

      if (filters.subject) {
        query = query.eq('subject', filters.subject);
      }

      if (filters.searchTerm) {
        query = query.ilike('name', `%${filters.searchTerm}%`);
      }

      const { data, error, count } = await query;
      
      if (error) throw error;

      return {
        sets: data || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE)
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Prefetch next page
  const prefetchNextPage = useCallback(() => {
    if (flashcardSetsData && currentPage < flashcardSetsData.totalPages) {
      queryClient.prefetchQuery({
        queryKey: ['flashcardSets', currentPage + 1, filters],
        queryFn: async () => {
          const userId = (await supabase.auth.getUser()).data.user?.id;
          const offset = currentPage * ITEMS_PER_PAGE;
          
          let query = supabase
            .from('flashcard_sets')
            .select(`
              id, name, description, subject, card_count, created_at, updated_at,
              flashcard_set_cards!inner(flashcard_id)
            `)
            .or(`user_id.eq.${userId},is_built_in.eq.true`)
            .range(offset, offset + ITEMS_PER_PAGE - 1)
            .order('updated_at', { ascending: false });

          if (filters.subject) {
            query = query.eq('subject', filters.subject);
          }

          if (filters.searchTerm) {
            query = query.ilike('name', `%${filters.searchTerm}%`);
          }

          const { data, error, count } = await query;
          
          if (error) throw error;

          return {
            sets: data || [],
            totalCount: count || 0,
            totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE)
          };
        },
        staleTime: 5 * 60 * 1000,
      });
    }
  }, [queryClient, currentPage, filters, flashcardSetsData]);

  // Get subjects for filter dropdown
  const { data: subjects } = useQuery({
    queryKey: ['flashcardSubjects'],
    queryFn: async () => {
      const { data } = await supabase
        .from('flashcard_sets')
        .select('subject')
        .not('subject', 'is', null);
      
      const uniqueSubjects = [...new Set(data?.map(item => item.subject).filter(Boolean))];
      return uniqueSubjects;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Prefetch next page after changing
    setTimeout(prefetchNextPage, 100);
  }, [prefetchNextPage]);

  const handleFilterChange = useCallback((newFilters: FlashcardFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page on filter change
  }, []);

  const memoizedData = useMemo(() => ({
    sets: flashcardSetsData?.sets || [],
    totalCount: flashcardSetsData?.totalCount || 0,
    totalPages: flashcardSetsData?.totalPages || 1,
    subjects: subjects || []
  }), [flashcardSetsData, subjects]);

  return {
    data: memoizedData,
    isLoading: setsLoading,
    currentPage,
    filters,
    handlePageChange,
    handleFilterChange,
    prefetchNextPage
  };
};
