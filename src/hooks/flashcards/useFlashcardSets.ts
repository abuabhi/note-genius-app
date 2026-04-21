import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
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
        .select('id, name, description, subject, subject_id, topic, card_count, is_built_in, user_id, country_id, education_system, section_id, created_at, updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      return data || [];
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
        .select('id, name, description, subject, subject_id, topic, card_count, is_built_in, user_id, country_id, education_system, section_id, created_at, updated_at')
        .is('user_id', null)
        .eq('is_built_in', true)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - built-in sets change rarely
    gcTime: 60 * 60 * 1000, // 1 hour
  });

  // Create flashcard set mutation
  const createFlashcardSetMutation = useMutation({
    mutationFn: async (setData: any) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('flashcard_sets')
        .insert({
          name: setData.name,
          description: setData.description,
          subject: setData.subject,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newSet: any) => {
      queryClient.invalidateQueries({ queryKey: ['flashcardSets', user?.id] });
      toast.success(`Created flashcard set: ${newSet.name}`);
    },
    onError: (error) => {
      console.error('Error creating flashcard set:', error);
      toast.error('Failed to create flashcard set');
    },
  });

  // Update flashcard set mutation
  const updateFlashcardSetMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('flashcard_sets')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (updatedSet: any) => {
      queryClient.invalidateQueries({ queryKey: ['flashcardSets', user?.id] });
      toast.success(`Updated flashcard set: ${updatedSet.name}`);
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
    updateFlashcardSet: (id: string, updates: any) => 
      updateFlashcardSetMutation.mutate({ id, updates }),
    deleteFlashcardSet: deleteFlashcardSetMutation.mutate,
    
    // Mutation states
    isCreating: createFlashcardSetMutation.isPending,
    isUpdating: updateFlashcardSetMutation.isPending,
    isDeleting: deleteFlashcardSetMutation.isPending,
  };
};