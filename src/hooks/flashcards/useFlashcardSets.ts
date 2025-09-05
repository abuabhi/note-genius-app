import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { FlashcardSet, CreateFlashcardSetPayload } from '@/types/flashcard';
import { toast } from 'sonner';

export const useFlashcardSets = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query for flashcard sets
  const {
    data: flashcardSets = [],
    isLoading: isLoadingSets,
    error: setsError,
  } = useQuery({
    queryKey: ['flashcardSets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select(`
          *,
          flashcard_set_cards (
            id,
            flashcard:flashcards (
              id,
              front_content,
              back_content
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FlashcardSet[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Query for built-in sets
  const {
    data: builtInSets = [],
    isLoading: isLoadingBuiltIn,
  } = useQuery({
    queryKey: ['builtInFlashcardSets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('*')
        .is('user_id', null)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FlashcardSet[];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - built-in sets change rarely
    gcTime: 60 * 60 * 1000, // 1 hour
  });

  // Create flashcard set mutation
  const createFlashcardSetMutation = useMutation({
    mutationFn: async (setData: CreateFlashcardSetPayload) => {
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
      return data as FlashcardSet;
    },
    onSuccess: (newSet) => {
      queryClient.invalidateQueries({ queryKey: ['flashcardSets', user?.id] });
      toast.success(`Created flashcard set: ${newSet.title}`);
    },
    onError: (error) => {
      console.error('Error creating flashcard set:', error);
      toast.error('Failed to create flashcard set');
    },
  });

  // Update flashcard set mutation
  const updateFlashcardSetMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CreateFlashcardSetPayload> }) => {
      const { data, error } = await supabase
        .from('flashcard_sets')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data as FlashcardSet;
    },
    onSuccess: (updatedSet) => {
      queryClient.invalidateQueries({ queryKey: ['flashcardSets', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['flashcardSet', updatedSet.id] });
      toast.success(`Updated flashcard set: ${updatedSet.title}`);
    },
    onError: (error) => {
      console.error('Error updating flashcard set:', error);
      toast.error('Failed to update flashcard set');
    },
  });

  // Delete flashcard set mutation
  const deleteFlashcardSetMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('flashcard_sets')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcardSets', user?.id] });
      toast.success('Flashcard set deleted');
    },
    onError: (error) => {
      console.error('Error deleting flashcard set:', error);
      toast.error('Failed to delete flashcard set');
    },
  });

  // Clone flashcard set mutation
  const cloneFlashcardSetMutation = useMutation({
    mutationFn: async (setId: string) => {
      if (!user) throw new Error('User not authenticated');

      // First, get the original set
      const { data: originalSet, error: fetchError } = await supabase
        .from('flashcard_sets')
        .select(`
          *,
          flashcard_set_cards (
            flashcard:flashcards (*)
          )
        `)
        .eq('id', setId)
        .single();

      if (fetchError) throw fetchError;

      // Create new set
      const { data: newSet, error: createError } = await supabase
        .from('flashcard_sets')
        .insert({
          title: `${originalSet.title} (Copy)`,
          description: originalSet.description,
          subject: originalSet.subject,
          user_id: user.id,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Clone flashcards if any
      if (originalSet.flashcard_set_cards?.length > 0) {
        const flashcardsToCreate = originalSet.flashcard_set_cards.map((card: any) => ({
          front_content: card.flashcard.front_content,
          back_content: card.flashcard.back_content,
          user_id: user.id,
        }));

        const { data: newFlashcards, error: flashcardsError } = await supabase
          .from('flashcards')
          .insert(flashcardsToCreate)
          .select();

        if (flashcardsError) throw flashcardsError;

        // Link flashcards to new set
        const setCardLinks = newFlashcards.map((card, index) => ({
          flashcard_id: card.id,
          set_id: newSet.id,
          position: index,
        }));

        const { error: linkError } = await supabase
          .from('flashcard_set_cards')
          .insert(setCardLinks);

        if (linkError) throw linkError;
      }

      return newSet as FlashcardSet;
    },
    onSuccess: (clonedSet) => {
      queryClient.invalidateQueries({ queryKey: ['flashcardSets', user?.id] });
      toast.success(`Cloned flashcard set: ${clonedSet.title}`);
    },
    onError: (error) => {
      console.error('Error cloning flashcard set:', error);
      toast.error('Failed to clone flashcard set');
    },
  });

  return {
    // Data
    flashcardSets,
    builtInSets,
    allSets: [...flashcardSets, ...builtInSets],
    
    // Loading states
    isLoadingSets,
    isLoadingBuiltIn,
    isLoading: isLoadingSets || isLoadingBuiltIn,
    
    // Errors
    setsError,
    
    // Mutations
    createFlashcardSet: createFlashcardSetMutation.mutate,
    updateFlashcardSet: (id: string, updates: Partial<CreateFlashcardSetPayload>) => 
      updateFlashcardSetMutation.mutate({ id, updates }),
    deleteFlashcardSet: deleteFlashcardSetMutation.mutate,
    cloneFlashcardSet: cloneFlashcardSetMutation.mutate,
    
    // Mutation states
    isCreating: createFlashcardSetMutation.isPending,
    isUpdating: updateFlashcardSetMutation.isPending,
    isDeleting: deleteFlashcardSetMutation.isPending,
    isCloning: cloneFlashcardSetMutation.isPending,
  };
};