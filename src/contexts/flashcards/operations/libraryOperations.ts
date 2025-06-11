
import { supabase } from '@/integrations/supabase/client';
import { FlashcardSet } from '@/types/flashcard';
import { toast } from 'sonner';
import { FlashcardState } from '../types';
import { convertToFlashcardSet } from '../utils/flashcardSetMappers';

/**
 * Search for flashcard sets in the public library
 */
export const searchLibrary = async (state: FlashcardState, query: string): Promise<FlashcardSet[]> => {
  try {
    const { data, error } = await supabase
      .from('flashcard_sets')
      .select(`
        *
      `)
      .eq('is_built_in', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,subject.ilike.%${query}%`)
      .order('name');

    if (error) throw error;

    return data?.map(set => convertToFlashcardSet(set)) || [];
  } catch (error) {
    console.error('searchLibrary: Error searching library:', error);
    toast.error('Failed to search library');
    return [];
  }
};

/**
 * Get all built-in flashcard sets from the library
 */
export const fetchBuiltInSets = async (state: FlashcardState): Promise<FlashcardSet[]> => {
  try {
    console.log('fetchBuiltInSets: Starting fetch for built-in sets');
    
    const { data, error } = await supabase
      .from('flashcard_sets')
      .select(`
        *
      `)
      .eq('is_built_in', true)
      .order('name');

    if (error) {
      console.error('fetchBuiltInSets: Database error:', error);
      throw error;
    }

    console.log('fetchBuiltInSets: Successfully fetched', data?.length || 0, 'built-in sets');
    
    const formattedSets = data?.map(set => convertToFlashcardSet(set)) || [];

    return formattedSets;
  } catch (error) {
    console.error('fetchBuiltInSets: Error fetching built-in sets:', error);
    toast.error('Failed to load library sets');
    return [];
  }
};

/**
 * Copy a set from the library to user's personal collection
 */
export const copySetFromLibrary = async (state: FlashcardState, setId: string): Promise<FlashcardSet | null> => {
  const { user, setFlashcardSets } = state;
  
  if (!user) {
    toast.error('You must be logged in to copy sets');
    return null;
  }

  try {
    console.log('copySetFromLibrary: Copying set', setId, 'for user', user.id);
    
    // First, get the original set with its flashcards
    const { data: originalSet, error: setError } = await supabase
      .from('flashcard_sets')
      .select(`
        *,
        flashcard_set_cards!inner (
          flashcards (
            id,
            front_content,
            back_content,
            difficulty
          )
        )
      `)
      .eq('id', setId)
      .eq('is_built_in', true)
      .single();

    if (setError) {
      console.error('copySetFromLibrary: Error fetching original set:', setError);
      throw setError;
    }

    if (!originalSet) {
      throw new Error('Set not found in library');
    }

    console.log('copySetFromLibrary: Found original set with', originalSet.flashcard_set_cards?.length || 0, 'cards');

    // Create a copy of the set for the user
    const { data: newSet, error: createError } = await supabase
      .from('flashcard_sets')
      .insert({
        name: `${originalSet.name} (Copy)`,
        description: originalSet.description,
        subject: originalSet.subject,
        topic: originalSet.topic,
        subject_id: originalSet.subject_id,
        user_id: user.id,
        is_built_in: false
      })
      .select()
      .single();

    if (createError) {
      console.error('copySetFromLibrary: Error creating new set:', createError);
      throw createError;
    }

    console.log('copySetFromLibrary: Created new set:', newSet.id);

    // Copy all flashcards from the original set
    if (originalSet.flashcard_set_cards && originalSet.flashcard_set_cards.length > 0) {
      const flashcardsToCreate = originalSet.flashcard_set_cards.map((setCard: any) => ({
        front_content: setCard.flashcards.front_content,
        back_content: setCard.flashcards.back_content,
        difficulty: setCard.flashcards.difficulty,
        user_id: user.id,
        is_built_in: false
      }));

      const { data: newFlashcards, error: flashcardsError } = await supabase
        .from('flashcards')
        .insert(flashcardsToCreate)
        .select();

      if (flashcardsError) {
        console.error('copySetFromLibrary: Error creating flashcards:', flashcardsError);
        throw flashcardsError;
      }

      console.log('copySetFromLibrary: Created', newFlashcards?.length || 0, 'new flashcards');

      // Link the new flashcards to the new set
      if (newFlashcards && newFlashcards.length > 0) {
        const setCardLinks = newFlashcards.map((card, index) => ({
          set_id: newSet.id,
          flashcard_id: card.id,
          position: index
        }));

        const { error: linkError } = await supabase
          .from('flashcard_set_cards')
          .insert(setCardLinks);

        if (linkError) {
          console.error('copySetFromLibrary: Error linking cards to set:', linkError);
          throw linkError;
        }

        console.log('copySetFromLibrary: Linked cards to new set');
      }
    }

    const formattedSet = convertToFlashcardSet(newSet);
    
    setFlashcardSets(prev => [formattedSet, ...prev]);
    
    toast.success(`"${originalSet.name}" copied to your collection`);
    
    return formattedSet;
  } catch (error) {
    console.error('copySetFromLibrary: Error copying set:', error);
    toast.error('Failed to copy set from library');
    return null;
  }
};

/**
 * Clone an existing flashcard set (create a duplicate)
 */
export const cloneFlashcardSet = async (state: FlashcardState, setId: string): Promise<FlashcardSet | null> => {
  const { user } = state;
  
  if (!user) {
    toast.error('You must be logged in to clone sets');
    return null;
  }

  try {
    // Use the same logic as copying from library but for user's own sets
    return await copySetFromLibrary(state, setId);
  } catch (error) {
    console.error('cloneFlashcardSet: Error cloning set:', error);
    toast.error('Failed to clone flashcard set');
    return null;
  }
};
