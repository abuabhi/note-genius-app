
import { supabase } from '@/integrations/supabase/client';
import { FlashcardSet } from '@/types/flashcard';
import { toast } from 'sonner';
import { FlashcardState } from '../types';
import { convertToFlashcardSet } from '../utils/flashcardSetMappers';

/**
 * Fetch flashcard sets from the built-in library
 */
export const fetchBuiltInSets = async (state: FlashcardState): Promise<FlashcardSet[]> => {
  const { setLoading } = state;
  
  try {
    setLoading(prev => ({ ...prev, sets: true }));
    
    const { data, error } = await supabase
      .from('flashcard_sets')
      .select('*, subject_categories(id, name)')
      .eq('is_built_in', true)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Transform into proper FlashcardSet objects
    const formattedSets = data.map(set => {
      // Get card counts for the set
      return convertToFlashcardSet(set);
    });
    
    return formattedSets;
  } catch (error) {
    console.error('Error fetching built-in sets:', error);
    toast.error('Failed to load built-in flashcard sets');
    return [];
  } finally {
    setLoading(prev => ({ ...prev, sets: false }));
  }
};

/**
 * Clone a flashcard set from the built-in library or another user's shared set
 * to the current user's collection
 */
export const cloneFlashcardSet = async (
  state: FlashcardState,
  setId: string
): Promise<FlashcardSet | null> => {
  const { user, setFlashcardSets } = state;
  
  if (!user) {
    toast.error('You must be logged in to clone flashcard sets');
    return null;
  }
  
  try {
    // 1. Get the original set
    const { data: originalSet, error: setError } = await supabase
      .from('flashcard_sets')
      .select('*')
      .eq('id', setId)
      .single();
      
    if (setError) throw setError;
    
    // 2. Create a new set based on the original
    const { data: newSet, error: createError } = await supabase
      .from('flashcard_sets')
      .insert({
        name: `${originalSet.name} (Copy)`,
        description: originalSet.description,
        user_id: user.id,
        subject: originalSet.subject,
        topic: originalSet.topic,
        category_id: originalSet.category_id,
        is_built_in: false,
      })
      .select()
      .single();
      
    if (createError) throw createError;
    
    // 3. Get all flashcards from the original set
    const { data: setCards, error: cardsError } = await supabase
      .from('flashcard_set_cards')
      .select('flashcard_id, position')
      .eq('set_id', setId);
      
    if (cardsError) throw cardsError;
    
    // 4. For each flashcard in the original set:
    for (const card of setCards) {
      // 4a. Get the flashcard data
      const { data: flashcard, error: flashcardError } = await supabase
        .from('flashcards')
        .select('*')
        .eq('id', card.flashcard_id)
        .single();
        
      if (flashcardError) continue; // Skip if error
      
      // 4b. Create a copy of the flashcard for the user
      const { data: newFlashcard, error: createCardError } = await supabase
        .from('flashcards')
        .insert({
          front_content: flashcard.front_content,
          back_content: flashcard.back_content,
          front: flashcard.front_content, // For backward compatibility
          back: flashcard.back_content, // For backward compatibility
          difficulty: flashcard.difficulty,
          user_id: user.id,
          is_built_in: false,
        })
        .select()
        .single();
        
      if (createCardError) continue; // Skip if error
      
      // 4c. Add the new flashcard to the new set
      await supabase
        .from('flashcard_set_cards')
        .insert({
          flashcard_id: newFlashcard.id,
          set_id: newSet.id,
          position: card.position,
        });
    }
    
    // 5. Get the count of cards in the new set
    const { count: cardCount } = await supabase
      .from('flashcard_set_cards')
      .select('*', { count: 'exact', head: true })
      .eq('set_id', newSet.id);
    
    // Create a proper FlashcardSet object
    const formattedSet = convertToFlashcardSet({
      ...newSet,
      card_count: cardCount || 0
    });
    
    // Update local state
    setFlashcardSets(prev => [formattedSet, ...prev]);
    
    toast.success('Flashcard set cloned successfully');
    
    return formattedSet;
  } catch (error) {
    console.error('Error cloning flashcard set:', error);
    toast.error('Failed to clone flashcard set');
    return null;
  }
};
