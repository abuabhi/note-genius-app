
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
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
  const { user } = useAuth();

  // Fetch flashcard sets with simple query
  const { data: sets = [], isLoading: setsLoading, error: setsError } = useQuery({
    queryKey: ['flashcard-sets'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as FlashcardSet[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Create flashcard set mutation
  const createSetMutation = useMutation({
    mutationFn: async (setData: Omit<FlashcardSet, 'id' | 'created_at' | 'updated_at' | 'card_count'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('flashcard_sets')
        .insert({
          ...setData,
          user_id: user.id,
        })
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
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('flashcard_sets')
        .delete()
        .eq('id', setId)
        .eq('user_id', user.id);
      
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
  };
};
