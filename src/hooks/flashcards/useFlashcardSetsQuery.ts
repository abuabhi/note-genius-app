
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

      console.log('🔍 useFlashcardSetsQuery - Fetching with filters:', {
        subjectFilter: filters.subjectFilter,
        searchQuery: filters.searchQuery,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });
      
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
        console.log('🔍 Applying search filter:', filters.searchQuery);
        query = query.ilike('name', `%${filters.searchQuery}%`);
      }

      // Apply subject filter - ENHANCED: Now properly filters by subject
      if (filters.subjectFilter && filters.subjectFilter !== 'all' && filters.subjectFilter.trim() !== '') {
        console.log('📚 Applying subject filter:', filters.subjectFilter);
        // Use exact match for subject filtering
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
        totalCount: count,
        appliedFilters: filters,
        page,
        sampleSets: data?.slice(0, 3).map(s => ({ 
          id: s.id.slice(0, 8), 
          name: s.name, 
          subject: s.subject 
        }))
      });

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
