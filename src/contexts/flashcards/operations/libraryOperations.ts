
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Minimal interface for library operations
export interface LibraryFlashcardSet {
  id: string;
  name: string;
  description?: string;
  subject?: string;
  topic?: string;
  category_id?: string;
  country_id?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  card_count?: number;
  is_built_in?: boolean;
}

/**
 * Fetch built-in flashcard sets from the library
 */
export const fetchBuiltInSets = async (): Promise<LibraryFlashcardSet[]> => {
  try {
    const { data, error } = await supabase
      .from('flashcard_sets')
      .select('*')
      .eq('is_built_in', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data ? data.map(set => ({
      id: set.id,
      name: set.name || '',
      description: set.description || '',
      subject: set.subject || '',
      topic: set.topic || '',
      category_id: set.category_id,
      country_id: set.country_id,
      user_id: set.user_id,
      created_at: set.created_at,
      updated_at: set.updated_at,
      card_count: set.card_count || 0,
      is_built_in: set.is_built_in || false
    })) : [];
  } catch (error) {
    console.error('fetchBuiltInSets: Error fetching built-in sets:', error);
    toast.error('Failed to load library sets');
    return [];
  }
};

/**
 * Clone a flashcard set from the library to user's collection
 */
export const cloneFlashcardSet = async (
  userId: string,
  setId: string
): Promise<LibraryFlashcardSet | null> => {
  if (!userId) {
    toast.error('Please sign in to clone this set');
    return null;
  }
  
  try {
    // First, get the original set
    const { data: originalSet, error: fetchError } = await supabase
      .from('flashcard_sets')
      .select('*')
      .eq('id', setId)
      .single();

    if (fetchError) throw fetchError;

    // Create a new set for the user
    const { data: newSet, error: createError } = await supabase
      .from('flashcard_sets')
      .insert({
        name: `${originalSet.name} (Copy)`,
        description: originalSet.description,
        subject: originalSet.subject,
        topic: originalSet.topic,
        category_id: originalSet.category_id,
        user_id: userId,
        is_built_in: false
      })
      .select()
      .single();

    if (createError) throw createError;

    // Get flashcards from the original set using the junction table
    const { data: originalFlashcardRelations, error: flashcardsError } = await supabase
      .from('flashcard_set_cards')
      .select(`
        flashcard_id,
        position,
        flashcards (
          front_content,
          back_content,
          difficulty
        )
      `)
      .eq('set_id', setId)
      .order('position', { ascending: true });

    if (flashcardsError) throw flashcardsError;

    // Clone the flashcards to the new set
    if (originalFlashcardRelations && originalFlashcardRelations.length > 0) {
      // First, create the new flashcards
      const newFlashcardsData = originalFlashcardRelations
        .filter(relation => relation.flashcards)
        .map(relation => ({
          front_content: relation.flashcards.front_content,
          back_content: relation.flashcards.back_content,
          difficulty: relation.flashcards.difficulty,
          user_id: userId,
          is_built_in: false
        }));

      const { data: newFlashcards, error: insertFlashcardsError } = await supabase
        .from('flashcards')
        .insert(newFlashcardsData)
        .select('id');

      if (insertFlashcardsError) throw insertFlashcardsError;

      // Then create the junction table relationships
      if (newFlashcards && newFlashcards.length > 0) {
        const junctionData = newFlashcards.map((flashcard, index) => ({
          flashcard_id: flashcard.id,
          set_id: newSet.id,
          position: index + 1
        }));

        const { error: junctionError } = await supabase
          .from('flashcard_set_cards')
          .insert(junctionData);

        if (junctionError) throw junctionError;
      }
    }

    // Return the formatted set
    const result: LibraryFlashcardSet = {
      id: newSet.id,
      name: newSet.name,
      description: newSet.description,
      subject: newSet.subject,
      topic: newSet.topic,
      category_id: newSet.category_id,
      country_id: newSet.country_id,
      user_id: newSet.user_id,
      created_at: newSet.created_at,
      updated_at: newSet.updated_at,
      card_count: originalFlashcardRelations?.length || 0,
      is_built_in: false
    };
    
    toast.success('Set cloned successfully!');
    return result;
  } catch (error) {
    console.error('cloneFlashcardSet: Error cloning set:', error);
    toast.error('Failed to clone set');
    return null;
  }
};

/**
 * Search library sets by query
 */
export const searchLibrary = async (query: string): Promise<LibraryFlashcardSet[]> => {
  try {
    const { data, error } = await supabase
      .from('flashcard_sets')
      .select('*')
      .eq('is_built_in', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,subject.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data ? data.map(set => ({
      id: set.id,
      name: set.name || '',
      description: set.description || '',
      subject: set.subject || '',
      topic: set.topic || '',
      category_id: set.category_id,
      country_id: set.country_id,
      user_id: set.user_id,
      created_at: set.created_at,
      updated_at: set.updated_at,
      card_count: set.card_count || 0,
      is_built_in: set.is_built_in || false
    })) : [];
  } catch (error) {
    console.error('searchLibrary: Error searching library:', error);
    toast.error('Failed to search library');
    return [];
  }
};
