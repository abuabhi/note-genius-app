import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

interface CreateFlashcardData {
  front_content: string;
  back_content: string;
  setId?: string;
}

interface UpdateFlashcardData {
  front_content?: string;
  back_content?: string;
}

export const useFlashcards = (setId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query for flashcards in a specific set
  const {
    data: flashcards = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['flashcards', setId, user?.id],
    queryFn: async () => {
      if (!user || !setId) return [];
      
      const { data, error } = await supabase
        .from('flashcard_set_cards')
        .select(`
          id,
          position,
          flashcard:flashcards (
            id,
            front_content,
            back_content,
            created_at,
            updated_at
          )
        `)
        .eq('set_id', setId)
        .order('position', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item.flashcard,
        front: item.flashcard.front_content,
        back: item.flashcard.back_content,
      }));
    },
    enabled: !!user && !!setId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create flashcard mutation
  const createFlashcardMutation = useMutation({
    mutationFn: async (cardData: CreateFlashcardData) => {
      if (!user) throw new Error('User not authenticated');

      // Create the flashcard
      const { data: newCard, error: cardError } = await supabase
        .from('flashcards')
        .insert({
          front_content: cardData.front_content,
          back_content: cardData.back_content,
          user_id: user.id,
        })
        .select()
        .single();

      if (cardError) throw cardError;

      // If setId is provided, link the card to the set
      if (cardData.setId) {
        // Get the next position in the set
        const { data: existingCards } = await supabase
          .from('flashcard_set_cards')
          .select('position')
          .eq('set_id', cardData.setId)
          .order('position', { ascending: false })
          .limit(1);

        const nextPosition = (existingCards?.[0]?.position || 0) + 1;

        const { error: linkError } = await supabase
          .from('flashcard_set_cards')
          .insert({
            flashcard_id: newCard.id,
            set_id: cardData.setId,
            position: nextPosition,
          });

        if (linkError) throw linkError;
      }

      return newCard;
    },
    onSuccess: () => {
      if (setId) {
        queryClient.invalidateQueries({ queryKey: ['flashcards', setId, user?.id] });
        queryClient.invalidateQueries({ queryKey: ['flashcardSets', user?.id] });
      }
      toast.success('Flashcard created successfully');
    },
    onError: (error) => {
      console.error('Error creating flashcard:', error);
      toast.error('Failed to create flashcard');
    },
  });

  // Update flashcard mutation
  const updateFlashcardMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateFlashcardData }) => {
      const { data, error } = await supabase
        .from('flashcards')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      if (setId) {
        queryClient.invalidateQueries({ queryKey: ['flashcards', setId, user?.id] });
      }
      toast.success('Flashcard updated successfully');
    },
    onError: (error) => {
      console.error('Error updating flashcard:', error);
      toast.error('Failed to update flashcard');
    },
  });

  // Delete flashcard mutation
  const deleteFlashcardMutation = useMutation({
    mutationFn: async (id: string) => {
      // Remove from set if setId is provided
      if (setId) {
        const { error: unlinkError } = await supabase
          .from('flashcard_set_cards')
          .delete()
          .eq('flashcard_id', id)
          .eq('set_id', setId);

        if (unlinkError) throw unlinkError;
      }

      // Delete the flashcard
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      if (setId) {
        queryClient.invalidateQueries({ queryKey: ['flashcards', setId, user?.id] });
        queryClient.invalidateQueries({ queryKey: ['flashcardSets', user?.id] });
      }
      toast.success('Flashcard deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting flashcard:', error);
      toast.error('Failed to delete flashcard');
    },
  });

  return {
    // Data
    flashcards,
    
    // Loading states
    isLoading,
    isCreating: createFlashcardMutation.isPending,
    isUpdating: updateFlashcardMutation.isPending,
    isDeleting: deleteFlashcardMutation.isPending,
    
    // Errors
    error,
    
    // Mutations
    createFlashcard: (cardData: CreateFlashcardData) => 
      createFlashcardMutation.mutate({ ...cardData, setId }),
    updateFlashcard: (id: string, updates: UpdateFlashcardData) => 
      updateFlashcardMutation.mutate({ id, updates }),
    deleteFlashcard: deleteFlashcardMutation.mutate,
    addFlashcardToSet: () => {
      console.log('addFlashcardToSet not implemented in this version');
    },
  };
};