
import { supabase } from '@/integrations/supabase/client';
import { FlashcardSet } from '@/types/flashcard';
import { toast } from 'sonner';

// Simple conversion function to avoid circular imports
const convertToFlashcardSet = (data: any): FlashcardSet => {
  return {
    id: data.id,
    name: data.name || '',
    description: data.description || '',
    subject: data.subject || '',
    topic: data.topic || '',
    category_id: data.category_id,
    country_id: data.country_id,
    user_id: data.user_id,
    created_at: data.created_at,
    updated_at: data.updated_at,
    card_count: data.card_count || 0,
    is_built_in: data.is_built_in || false,
    subject_categories: data.subject_categories
  };
};

/**
 * Fetch built-in flashcard sets from the library
 */
export const fetchBuiltInSets = async () => {
  try {
    const { data, error } = await supabase
      .from('flashcard_sets')
      .select('*')
      .eq('is_built_in', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data?.map(set => convertToFlashcardSet(set)) || [];
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
  user: any,
  getCurrentSets: any,
  updateSets: any,
  setId: string
) => {
  if (!user) {
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
        user_id: user.id,
        is_built_in: false
      })
      .select()
      .single();

    if (createError) throw createError;

    // Get flashcards from the original set
    const { data: originalFlashcards, error: flashcardsError } = await supabase
      .from('flashcards')
      .select('*')
      .eq('set_id', setId);

    if (flashcardsError) throw flashcardsError;

    // Clone the flashcards to the new set
    if (originalFlashcards && originalFlashcards.length > 0) {
      const newFlashcards = originalFlashcards.map(card => ({
        front_content: card.front_content,
        back_content: card.back_content,
        difficulty: card.difficulty,
        set_id: newSet.id,
        user_id: user.id,
        is_built_in: false
      }));

      const { error: insertError } = await supabase
        .from('flashcards')
        .insert(newFlashcards);

      if (insertError) throw insertError;
    }

    const formattedSet = convertToFlashcardSet(newSet);
    
    // Update state with the new set
    const currentSets = getCurrentSets();
    updateSets([formattedSet, ...currentSets]);
    
    toast.success('Set cloned successfully!');
    return formattedSet;
  } catch (error) {
    console.error('cloneFlashcardSet: Error cloning set:', error);
    toast.error('Failed to clone set');
    return null;
  }
};

/**
 * Search library sets by query
 */
export const searchLibrary = async (query: string) => {
  try {
    const { data, error } = await supabase
      .from('flashcard_sets')
      .select('*')
      .eq('is_built_in', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,subject.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data?.map(set => convertToFlashcardSet(set)) || [];
  } catch (error) {
    console.error('searchLibrary: Error searching library:', error);
    toast.error('Failed to search library');
    return [];
  }
};

/**
 * Copy a set from library to user's collection (alias for cloneFlashcardSet)
 */
export const copySetFromLibrary = async (
  user: any,
  getCurrentSets: any,
  updateSets: any,
  setId: string
) => {
  return cloneFlashcardSet(user, getCurrentSets, updateSets, setId);
};
