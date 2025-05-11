
import { supabase } from '@/integrations/supabase/client';
import { FlashcardSet, CreateFlashcardSetPayload } from '@/types/flashcard';
import { useToast } from '@/hooks/use-toast';
import { FlashcardState } from './types';

export const useFlashcardSets = (state: FlashcardState) => {
  const { setFlashcardSets, setLoading, user } = state;
  const { toast } = useToast();

  // Helper function to convert database response to FlashcardSet
  const convertToFlashcardSet = (data: any): FlashcardSet => {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      user_id: data.user_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      is_built_in: data.is_built_in,
      card_count: data.card_count || 0,
      subject: data.subject,
      topic: data.topic,
      country_id: data.country_id,
      category_id: data.category_id,
      education_system: data.education_system,
      section_id: data.section_id,
      subject_categories: data.subject_categories ? {
        id: data.subject_categories.id,
        name: data.subject_categories.name
      } : undefined
    };
  };

  // Fetch all flashcard sets for the current user
  const fetchFlashcardSets = async (): Promise<FlashcardSet[]> => {
    if (!user) return [];
    
    try {
      setLoading(prev => ({ ...prev, sets: true }));
      
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('*, subject_categories(id, name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Get card counts for each set
      const setsWithCardCounts = await Promise.all(
        data.map(async (set) => {
          const { count, error: countError } = await supabase
            .from('flashcard_set_cards')
            .select('*', { count: 'exact', head: true })
            .eq('set_id', set.id);
          
          // Convert to proper type and add card count
          const formattedSet = convertToFlashcardSet({
            ...set,
            card_count: countError ? 0 : count || 0
          });
          
          return formattedSet;
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

  // Fetch built-in flashcard sets for the library
  const fetchBuiltInSets = async (): Promise<FlashcardSet[]> => {
    setLoading(prev => ({ ...prev, sets: true }));
    try {
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('*, subject_categories(id, name)')
        .eq('is_built_in', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Get card counts for each set
      const builtInSetsWithCardCounts = await Promise.all(
        data.map(async (set) => {
          const { count, error: countError } = await supabase
            .from('flashcard_set_cards')
            .select('*', { count: 'exact', head: true })
            .eq('set_id', set.id);
          
          // Convert to proper type and add card count
          const formattedSet = convertToFlashcardSet({
            ...set,
            card_count: countError ? 0 : count || 0
          });
          
          return formattedSet;
        })
      );
      
      return builtInSetsWithCardCounts;
    } catch (error) {
      console.error('Error fetching built-in flashcard sets:', error);
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

  // Clone a flashcard set for the user
  const cloneFlashcardSet = async (setId: string): Promise<FlashcardSet | null> => {
    if (!user) return null;

    try {
      // Get the original set
      const { data: originalSet, error: setError } = await supabase
        .from('flashcard_sets')
        .select('*')
        .eq('id', setId)
        .single();

      if (setError) throw setError;

      // Create a new set based on the original
      const { data: newSet, error: createError } = await supabase
        .from('flashcard_sets')
        .insert({
          name: `${originalSet.name} (Copy)`,
          description: originalSet.description,
          subject: originalSet.subject,
          topic: originalSet.topic,
          category_id: originalSet.category_id,
          user_id: user.id,
          is_built_in: false
        })
        .select()
        .single();

      if (createError) throw createError;

      // Get all cards from the original set
      const { data: originalCards, error: cardsError } = await supabase
        .from('flashcards')
        .select('*')
        .eq('set_id', setId);

      if (cardsError) throw cardsError;

      // Clone all cards to the new set
      if (originalCards && originalCards.length > 0) {
        const newCards = originalCards.map(card => ({
          front_content: card.front_content,
          back_content: card.back_content,
          user_id: user.id,
          set_id: newSet.id,
          difficulty: card.difficulty,
          is_built_in: false
        }));

        await supabase.from('flashcards').insert(newCards);
      }

      toast({
        title: 'Flashcard set cloned successfully',
        variant: 'default',
      });
      
      await fetchFlashcardSets(); // Refresh the user's sets
      return convertToFlashcardSet(newSet);
    } catch (error) {
      console.error('Error cloning flashcard set:', error);
      toast({
        title: 'Failed to clone flashcard set',
        description: 'Please try again later.',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Create a new flashcard set
  const createFlashcardSet = async (setData: CreateFlashcardSetPayload): Promise<FlashcardSet | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('flashcard_sets')
        .insert({
          ...setData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      const formattedSet = convertToFlashcardSet(data);
      setFlashcardSets(prev => [formattedSet, ...prev]);
      
      toast({
        title: 'Flashcard set created',
        description: `"${data.name}" has been created successfully.`,
      });
      
      return formattedSet;
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
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('flashcard_sets')
        .update(setData)
        .eq('id', id)
        .eq('user_id', user.id);

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
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('flashcard_sets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

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

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(prev => ({ ...prev, categories: true }));
      
      const { data, error } = await supabase
        .from('subject_categories')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      state.setCategories(data);
      return data;
    } catch (error) {
      console.error('Error fetching subject categories:', error);
      toast({
        title: 'Error fetching categories',
        description: 'Please try again later.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  return {
    fetchFlashcardSets,
    createFlashcardSet,
    updateFlashcardSet,
    deleteFlashcardSet,
    fetchBuiltInSets,
    cloneFlashcardSet,
    fetchCategories
  };
};
