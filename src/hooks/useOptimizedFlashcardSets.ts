
import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FlashcardSet } from '@/types/flashcard';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';

export const useOptimizedFlashcardSets = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Optimized query with proper caching and background updates
  const {
    data: flashcardSets = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['flashcard-sets', user?.id],
    queryFn: async () => {
      if (!user) return [];

      console.log('Fetching optimized flashcard sets for user:', user.id);
      
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching flashcard sets:', error);
        throw error;
      }

      const sets: FlashcardSet[] = (data || []).map(set => ({
        id: set.id,
        name: set.name,
        description: set.description,
        user_id: set.user_id,
        created_at: set.created_at,
        updated_at: set.updated_at,
        is_built_in: set.is_built_in,
        card_count: set.card_count || 0,
        subject: set.subject,
        topic: set.topic,
        country_id: set.country_id,
        category_id: set.category_id,
        education_system: set.education_system,
        section_id: set.section_id,
        subject_categories: undefined
      }));
      
      console.log('Successfully fetched optimized flashcard sets:', sets.length);
      return sets;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Optimized delete function with optimistic updates
  const deleteFlashcardSet = async (setId: string) => {
    try {
      // Optimistic update
      queryClient.setQueryData(['flashcard-sets', user?.id], (old: FlashcardSet[] = []) =>
        old.filter(set => set.id !== setId)
      );

      const { error } = await supabase
        .from('flashcard_sets')
        .delete()
        .eq('id', setId);

      if (error) {
        // Revert optimistic update on error
        queryClient.invalidateQueries({ queryKey: ['flashcard-sets', user?.id] });
        throw error;
      }

      toast.success('Flashcard set deleted successfully');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete flashcard set';
      console.error('Error deleting flashcard set:', err);
      toast.error(errorMsg);
      throw err;
    }
  };

  // Memoized filtered data for better performance
  const filteredSets = useMemo(() => {
    return flashcardSets.filter(set => set.card_count > 0);
  }, [flashcardSets]);

  return {
    flashcardSets: filteredSets,
    allSets: flashcardSets,
    loading: isLoading,
    error: error?.message || null,
    refetch,
    deleteFlashcardSet
  };
};
