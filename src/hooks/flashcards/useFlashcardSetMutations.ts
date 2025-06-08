
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useFlashcardSetMutations = (filters: any, page: number) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const togglePinnedMutation = useMutation({
    mutationFn: async ({ setId, isPinned }: { setId: string; isPinned: boolean }) => {
      console.log('🔄 Toggle pinned:', setId, isPinned);
      await new Promise(resolve => setTimeout(resolve, 200));
      return { setId, isPinned };
    },
    onMutate: async ({ setId, isPinned }) => {
      const queryKey = ['enhanced-flashcard-sets', user?.id, filters, page];
      await queryClient.cancelQueries({ queryKey });
      
      const previousData = queryClient.getQueryData(queryKey);
      
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          sets: old.sets.map((set: any) =>
            set.id === setId ? { ...set, is_pinned: isPinned } : set
          )
        };
      });

      return { previousData, queryKey };
    },
    onError: (err, variables, context) => {
      console.error('❌ Toggle pinned failed:', err);
      
      if (context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
      
      toast.error('Failed to update pinned status. Please try again.');
    },
    onSuccess: () => {
      toast.success('Pinned status updated successfully');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (setId: string) => {
      console.log('🗑️ Deleting flashcard set:', setId);
      
      try {
        const { error: cardsError } = await supabase
          .from('flashcard_set_cards')
          .delete()
          .eq('set_id', setId);

        if (cardsError) {
          throw new Error(`Failed to delete flashcard cards: ${cardsError.message}`);
        }

        const { error: setError } = await supabase
          .from('flashcard_sets')
          .delete()
          .eq('id', setId);

        if (setError) {
          throw new Error(`Failed to delete flashcard set: ${setError.message}`);
        }

        return setId;
      } catch (error: any) {
        console.error('❌ Delete operation failed:', error);
        throw error;
      }
    },
    onMutate: async (setId) => {
      const queryKey = ['enhanced-flashcard-sets', user?.id, filters, page];
      await queryClient.cancelQueries({ queryKey });
      
      const previousData = queryClient.getQueryData(queryKey);
      
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          sets: old.sets.filter((set: any) => set.id !== setId),
          totalCount: Math.max(0, old.totalCount - 1)
        };
      });

      return { previousData, queryKey };
    },
    onError: (err, variables, context) => {
      console.error('❌ Delete mutation failed:', err);
      
      if (context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
      
      const errorMessage = err?.message || 'Failed to delete flashcard set';
      toast.error(errorMessage);
    },
    onSuccess: () => {
      toast.success('Flashcard set deleted successfully');
      queryClient.invalidateQueries({ 
        queryKey: ['enhanced-flashcard-sets', user?.id] 
      });
    },
  });

  return {
    togglePinned: togglePinnedMutation.mutate,
    deleteFlashcardSet: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    isTogglingPinned: togglePinnedMutation.isPending,
  };
};
