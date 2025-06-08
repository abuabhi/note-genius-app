
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
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
    mastery_percentage: number;
  };
}

export const useOptimizedFlashcardSets = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Ultra-optimized single query for flashcard sets with progress
  const { data: setsData, isLoading, error, refetch } = useQuery({
    queryKey: ['ultra-optimized-flashcard-sets', user?.id],
    queryFn: async () => {
      if (!user) return [];

      console.log('🚀 Ultra-optimized flashcard sets fetch starting...');
      const startTime = Date.now();

      // Single query to get sets with card counts - much faster than multiple queries
      const { data: setsWithCounts, error: setsError } = await supabase
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

      if (setsError) {
        console.error('❌ Error fetching flashcard sets:', setsError);
        throw setsError;
      }

      if (!setsWithCounts || setsWithCounts.length === 0) {
        console.log('✅ No flashcard sets found - returning empty array');
        return [];
      }

      // Get all set IDs for batch progress query
      const setIds = setsWithCounts.map(set => set.id);

      // Batch query for progress data - much more efficient than individual queries
      const [learningProgressData, userProgressData] = await Promise.allSettled([
        supabase
          .from('learning_progress')
          .select('flashcard_id, user_id, is_known, confidence_level, times_seen, times_correct')
          .eq('user_id', user.id)
          .in('flashcard_id', 
            // Get flashcard IDs that belong to our sets
            supabase
              .from('flashcard_set_cards')
              .select('flashcard_id')
              .in('set_id', setIds)
              .then(({ data }) => data?.map(card => card.flashcard_id) || [])
          ),
        supabase
          .from('user_flashcard_progress')
          .select('flashcard_id, user_id, last_reviewed_at, mastery_level')
          .eq('user_id', user.id)
          .in('flashcard_id',
            supabase
              .from('flashcard_set_cards')
              .select('flashcard_id')
              .in('set_id', setIds)
              .then(({ data }) => data?.map(card => card.flashcard_id) || [])
          )
      ]);

      // Process progress data efficiently
      const learningProgress = learningProgressData.status === 'fulfilled' ? learningProgressData.value.data || [] : [];
      const userProgress = userProgressData.status === 'fulfilled' ? userProgressData.value.data || [] : [];

      // Create lookup maps for O(1) access
      const learningMap = new Map(learningProgress.map(p => [p.flashcard_id, p]));
      const progressMap = new Map(userProgress.map(p => [p.flashcard_id, p]));

      // Get flashcard set mappings
      const { data: setCards } = await supabase
        .from('flashcard_set_cards')
        .select('set_id, flashcard_id')
        .in('set_id', setIds);

      // Group flashcards by set for efficient processing
      const setToCards = new Map<string, string[]>();
      setCards?.forEach(card => {
        if (!setToCards.has(card.set_id)) {
          setToCards.set(card.set_id, []);
        }
        setToCards.get(card.set_id)!.push(card.flashcard_id);
      });

      // Process each set with optimized progress calculation
      const optimizedSets: OptimizedFlashcardSet[] = setsWithCounts.map(set => {
        const cardIds = setToCards.get(set.id) || [];
        const totalCards = cardIds.length;
        
        let masteredCards = 0;
        let lastStudiedAt: string | undefined;

        // Fast mastery calculation
        cardIds.forEach(cardId => {
          const learning = learningMap.get(cardId);
          const progress = progressMap.get(cardId);
          
          // Simplified mastery criteria for faster calculation
          const isKnown = learning?.is_known;
          const highConfidence = learning?.confidence_level >= 4;
          const goodAccuracy = learning?.times_seen > 0 && (learning.times_correct / learning.times_seen) > 0.8;
          
          if (isKnown || highConfidence || (learning?.times_seen >= 3 && goodAccuracy)) {
            masteredCards++;
          }
          
          // Track most recent study time
          if (progress?.last_reviewed_at) {
            if (!lastStudiedAt || progress.last_reviewed_at > lastStudiedAt) {
              lastStudiedAt = progress.last_reviewed_at;
            }
          }
        });

        const masteryPercentage = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;

        return {
          ...set,
          card_count: totalCards,
          last_studied_at: lastStudiedAt,
          progress_summary: {
            total_cards: totalCards,
            mastered_cards: masteredCards,
            needs_practice: totalCards - masteredCards,
            mastery_percentage: masteryPercentage
          }
        };
      });

      const loadTime = Date.now() - startTime;
      console.log(`⚡ Ultra-optimized flashcard sets loaded in ${loadTime}ms:`, {
        totalSets: optimizedSets.length,
        avgMastery: optimizedSets.reduce((sum, set) => sum + (set.progress_summary?.mastery_percentage || 0), 0) / optimizedSets.length
      });

      return optimizedSets;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes - longer for better performance
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on every mount
    retry: 1 // Reduce retries for faster failure
  });

  // Simplified prefetch for study data
  const prefetchFlashcards = useCallback((setId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['optimized-flashcard-study', setId, 'learn', user?.id],
      queryFn: () => null, // Will be handled by study hook
      staleTime: 30 * 1000 // Short prefetch cache
    });
  }, [queryClient, user?.id]);

  // Optimized delete mutation with immediate UI update
  const deleteMutation = useMutation({
    mutationFn: async (setId: string) => {
      // Optimistic update - remove from UI immediately
      queryClient.setQueryData(['ultra-optimized-flashcard-sets', user?.id], (old: OptimizedFlashcardSet[] = []) => 
        old.filter(set => set.id !== setId)
      );

      // Delete in background
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
    onSuccess: () => {
      toast.success('Flashcard set deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting flashcard set:', error);
      toast.error('Failed to delete flashcard set');
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['ultra-optimized-flashcard-sets'] });
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
    refetch: () => queryClient.invalidateQueries({ queryKey: ['ultra-optimized-flashcard-sets'] })
  };
};
