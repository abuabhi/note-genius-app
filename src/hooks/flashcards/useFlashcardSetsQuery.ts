
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

      console.log('🔍 Fetching flashcard sets with filters:', filters);
      
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
      if (filters.searchQuery) {
        console.log('🔍 Applying search filter:', filters.searchQuery);
        query = query.ilike('name', `%${filters.searchQuery}%`);
      }

      // Apply subject filter - FIXED: Now properly filters by subject
      if (filters.subjectFilter && filters.subjectFilter !== 'all') {
        console.log('📚 Applying subject filter:', filters.subjectFilter);
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
        console.error('❌ Error fetching flashcard sets:', error);
        throw error;
      }

      console.log('✅ Successfully fetched flashcard sets:', {
        totalSets: data?.length || 0,
        appliedFilters: filters,
        page
      });

      return {
        sets: data || [],
        totalCount: count || 0,
        hasMore: (count || 0) > page * pageSize
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2
  });
};
