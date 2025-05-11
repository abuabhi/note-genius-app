
import { supabase } from '@/integrations/supabase/client';
import { FlashcardSet } from '@/types/flashcard';
import { toast } from 'sonner';
import { FlashcardState } from './types';

export const useLibraryOperations = (
  state: FlashcardState
) => {
  const { 
    setFlashcardSets, 
    user 
  } = state;

  // Fetch built-in flashcard sets for the library
  const fetchBuiltInSets = async (): Promise<FlashcardSet[]> => {
    state.setLoading(prev => ({ ...prev, sets: true }));
    try {
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('*, subject_categories(id, name)')
        .eq('is_built_in', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Format the sets with card counts
      const builtInSetsWithCardCounts = await Promise.all(
        data.map(async (set) => {
          // Get card count for this set
          const { count, error: countError } = await supabase
            .from('flashcard_set_cards')
            .select('*', { count: 'exact', head: true })
            .eq('set_id', set.id);
          
          // Convert to proper type with card count
          return {
            id: set.id,
            name: set.name,
            description: set.description,
            user_id: set.user_id,
            created_at: set.created_at,
            updated_at: set.updated_at,
            is_built_in: set.is_built_in,
            card_count: countError ? 0 : count || 0,
            subject: set.subject,
            topic: set.topic,
            country_id: set.country_id,
            category_id: set.category_id,
            education_system: set.education_system,
            section_id: set.section_id,
            subject_categories: set.subject_categories ? {
              id: set.subject_categories.id,
              name: set.subject_categories.name
            } : undefined
          } as FlashcardSet;
        })
      );
      
      return builtInSetsWithCardCounts;
    } catch (error) {
      console.error('Error fetching built-in flashcard sets:', error);
      toast.error('Failed to load flashcard sets');
      return [];
    } finally {
      state.setLoading(prev => ({ ...prev, sets: false }));
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

      toast.success('Flashcard set cloned successfully');
      
      // Refresh the user's sets by fetching them directly
      const { data: userSets } = await supabase
        .from('flashcard_sets')
        .select('*, subject_categories(id, name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (userSets) {
        // Process sets to include card counts
        const formattedSets = await Promise.all(
          userSets.map(async (set) => {
            const { count, error: countError } = await supabase
              .from('flashcard_set_cards')
              .select('*', { count: 'exact', head: true })
              .eq('set_id', set.id);
            
            return {
              ...set,
              card_count: countError ? 0 : count || 0,
              subject_categories: set.subject_categories ? {
                id: set.subject_categories.id,
                name: set.subject_categories.name
              } : undefined
            } as FlashcardSet;
          })
        );
        
        setFlashcardSets(formattedSets);
      }
      
      return newSet as FlashcardSet;
    } catch (error) {
      console.error('Error cloning flashcard set:', error);
      toast.error('Failed to clone flashcard set');
      return null;
    }
  };

  return {
    fetchBuiltInSets,
    cloneFlashcardSet,
  };
};
