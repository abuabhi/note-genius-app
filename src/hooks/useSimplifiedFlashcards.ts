
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FlashcardSet {
  id: string;
  name: string;
  description?: string;
  subject?: string;
  card_count: number;
  created_at: string;
  updated_at: string;
}

interface Flashcard {
  id: string;
  front_content: string;
  back_content: string;
  difficulty?: number;
  set_id?: string;
}

// Simplified flashcards hook
export const useSimplifiedFlashcards = () => {
  const queryClient = useQueryClient();

  // Fetch flashcard sets with simple query
  const { data: sets = [], isLoading: setsLoading, error: setsError } = useQuery({
    queryKey: ['flashcard-sets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as FlashcardSet[];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Create flashcard set mutation
  const createSetMutation = useMutation({
    mutationFn: async (setData: Omit<FlashcardSet, 'id' | 'created_at' | 'updated_at' | 'card_count'>) => {
      const { data, error } = await supabase
        .from('flashcard_sets')
        .insert(setData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcard-sets'] });
      toast.success('Flashcard set created successfully');
    },
    onError: (error) => {
      console.error('Error creating flashcard set:', error);
      toast.error('Failed to create flashcard set');
    },
  });

  // Delete flashcard set mutation
  const deleteSetMutation = useMutation({
    mutationFn: async (setId: string) => {
      const { error } = await supabase
        .from('flashcard_sets')
        .delete()
        .eq('id', setId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcard-sets'] });
      toast.success('Flashcard set deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting flashcard set:', error);
      toast.error('Failed to delete flashcard set');
    },
  });

  // Get flashcards for a specific set
  const useFlashcardsForSet = (setId: string | null) => {
    return useQuery({
      queryKey: ['flashcards', setId],
      queryFn: async () => {
        if (!setId) return [];
        
        const { data, error } = await supabase
          .from('flashcards')
          .select('*')
          .eq('set_id', setId)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        return data as Flashcard[];
      },
      enabled: !!setId,
      staleTime: 5 * 60 * 1000,
    });
  };

  return {
    // Data
    sets,
    setsLoading,
    setsError,
    
    // Mutations
    createSet: createSetMutation.mutate,
    deleteSet: deleteSetMutation.mutate,
    isCreating: createSetMutation.isPending,
    isDeleting: deleteSetMutation.isPending,
    
    // Helpers
    useFlashcardsForSet,
  };
};
