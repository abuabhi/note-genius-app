
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { FlashcardSet } from '@/types/flashcard';

interface OptimizedFlashcardSet extends FlashcardSet {
  card_count: number;
  last_studied_at?: string;
  progress_summary?: {
    total_cards: number;
    mastered_cards: number;
    needs_practice: number;
  };
}

export const useOptimizedFlashcardSets = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Single optimized query for flashcard sets with progress
  const { data: setsData, isLoading, error } = useQuery({
    queryKey: ['optimized-flashcard-sets', user?.id],
    queryFn: async () => {
      if (!user) return [];

      console.log('🚀 Fetching optimized flashcard sets...');
      const startTime = Date.now();

      // Single query with aggregated data
      const { data, error } = await supabase
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
        `)
        .or(`user_id.eq.${user.id},is_built_in.eq.true`)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching flashcard sets:', error);
        throw error;
      }

      const loadTime = Date.now() - startTime;
      console.log(`⚡ Flashcard sets fetched in ${loadTime}ms:`, data?.length || 0);

      return (data || []) as OptimizedFlashcardSet[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  });

  // Prefetch flashcard data for recently accessed sets
  const prefetchFlashcards = useCallback((setId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['optimized-flashcard-study', setId, 'learn', user?.id],
      queryFn: () => {
        // This will be handled by the study hook
        return null;
      },
      staleTime: 2 * 60 * 1000
    });
  }, [queryClient, user?.id]);

  // Optimized delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (setId: string) => {
      // Delete in the correct order to avoid foreign key constraints
      await supabase.from('flashcard_set_cards').delete().eq('set_id', setId);
      await supabase.from('flashcard_sets').delete().eq('id', setId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['optimized-flashcard-sets'] });
      toast.success('Flashcard set deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting flashcard set:', error);
      toast.error('Failed to delete flashcard set');
    }
  });

  const allSets = setsData || [];
  const userSets = allSets.filter(set => set.user_id === user?.id);
  const builtInSets = allSets.filter(set => set.is_built_in);

  return {
    allSets,
    userSets,
    builtInSets,
    loading: isLoading,
    error: error?.message || null,
    deleteFlashcardSet: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    prefetchFlashcards,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['optimized-flashcard-sets'] })
  };
};
