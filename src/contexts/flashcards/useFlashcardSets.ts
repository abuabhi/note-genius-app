
import { supabase } from '@/integrations/supabase/client';
import { FlashcardSet, CreateFlashcardSetPayload } from '@/types/flashcard';
import { useToast } from '@/hooks/use-toast';
import { FlashcardState } from './types';

export const useFlashcardSets = (state: FlashcardState) => {
  const { setFlashcardSets, setLoading } = state;
  const { toast } = useToast();

  // Fetch all flashcard sets for the current user
  const fetchFlashcardSets = async (): Promise<FlashcardSet[]> => {
    try {
      setLoading(prev => ({ ...prev, sets: true }));
      
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('*, subject_categories(*)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Get card counts for each set
      const setsWithCardCounts = await Promise.all(
        data.map(async (set) => {
          const { count, error: countError } = await supabase
            .from('flashcard_set_cards')
            .select('*', { count: 'exact', head: true })
            .eq('set_id', set.id);
          
          return {
            ...set,
            card_count: countError ? 0 : count || 0,
          };
        })
      );
      
      setFlashcardSets(setsWithCardCounts);
      return setsWithCardCounts;
    } catch (error) {
      console.error('Error fetching flashcard sets:', error);
      toast({
        title: 'Error fetching flashcard sets',
        description: 'Please try again later.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(prev => ({ ...prev, sets: false }));
    }
  };

  // Create a new flashcard set
  const createFlashcardSet = async (setData: CreateFlashcardSetPayload): Promise<FlashcardSet | null> => {
    try {
      const { data, error } = await supabase
        .from('flashcard_sets')
        .insert(setData)
        .select()
        .single();
      
      if (error) throw error;
      
      setFlashcardSets(prev => [{ ...data, card_count: 0 }, ...prev]);
      toast({
        title: 'Flashcard set created',
        description: `"${data.name}" has been created successfully.`,
      });
      
      return data;
    } catch (error) {
      console.error('Error creating flashcard set:', error);
      toast({
        title: 'Error creating flashcard set',
        description: 'Please try again later.',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Update an existing flashcard set
  const updateFlashcardSet = async (id: string, setData: Partial<CreateFlashcardSetPayload>) => {
    try {
      const { error } = await supabase
        .from('flashcard_sets')
        .update(setData)
        .eq('id', id);
      
      if (error) throw error;
      
      setFlashcardSets(prev => 
        prev.map(set => set.id === id ? { ...set, ...setData } : set)
      );
      
      toast({
        title: 'Flashcard set updated',
        description: 'Your changes have been saved.',
      });
    } catch (error) {
      console.error('Error updating flashcard set:', error);
      toast({
        title: 'Error updating flashcard set',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  // Delete a flashcard set
  const deleteFlashcardSet = async (id: string) => {
    try {
      const { error } = await supabase
        .from('flashcard_sets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setFlashcardSets(prev => prev.filter(set => set.id !== id));
      
      toast({
        title: 'Flashcard set deleted',
        description: 'The flashcard set has been removed.',
      });
    } catch (error) {
      console.error('Error deleting flashcard set:', error);
      toast({
        title: 'Error deleting flashcard set',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  return {
    fetchFlashcardSets,
    createFlashcardSet,
    updateFlashcardSet,
    deleteFlashcardSet,
  };
};
