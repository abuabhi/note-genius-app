
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { FlashcardFilters } from '@/components/flashcards/components/AdvancedFlashcardFilters';

export const useFlashcardSetsQuery = (filters: FlashcardFilters, page: number = 1) => {
  const { user } = useAuth();
  const pageSize = 12;

  return useQuery({
    queryKey: ['enhanced-flashcard-sets', user?.id, filters, page],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      
      let query = supabase
        .from('flashcard_sets')
        .select(`
          id,
          name,
          description,
          subject,
          card_count,
          created_at,
          updated_at,
          user_id,
          is_built_in
        `)
        .or(`user_id.eq.${user.id},is_built_in.eq.true`);

      // Apply search filter
      if (filters.searchQuery && filters.searchQuery.trim() !== '') {
        query = query.ilike('name', `%${filters.searchQuery}%`);
      }

      // Apply subject filter - ENHANCED: Now properly filters by subject
      if (filters.subjectFilter && filters.subjectFilter !== 'all' && filters.subjectFilter.trim() !== '') {
        query = query.eq('subject', filters.subjectFilter);
      }

      // Apply sorting
      const ascending = filters.sortOrder === 'asc';
      query = query.order(filters.sortBy, { ascending });

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        sets: data || [],
        totalCount: count || 0,
        hasMore: (count || 0) > page * pageSize
      };
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes - reduced for better responsiveness
    gcTime: 5 * 60 * 1000, // 5 minutes - reduced cache time
    retry: 2
  });
};
