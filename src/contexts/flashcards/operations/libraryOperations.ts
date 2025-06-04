
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Simple type for library operations to avoid complex type instantiation
export interface SimpleFlashcardSet {
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

// Simple callback types to avoid complex React state types
export type UpdateSetsCallback = (sets: SimpleFlashcardSet[]) => void;
export type GetSetsCallback = () => SimpleFlashcardSet[];

/**
 * Fetch built-in flashcard sets from the library
 */
export const fetchBuiltInSets = async (): Promise<SimpleFlashcardSet[]> => {
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
  user: any,
  getCurrentSets: GetSetsCallback,
  updateSets: UpdateSetsCallback,
  setId: string
): Promise<SimpleFlashcardSet | null> => {
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

    // Create simple formatted set
    const formattedSet: SimpleFlashcardSet = {
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
      card_count: newSet.card_count || 0,
      is_built_in: false
    };
    
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
export const searchLibrary = async (query: string): Promise<SimpleFlashcardSet[]> => {
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

/**
 * Copy a set from library to user's collection (alias for cloneFlashcardSet)
 */
export const copySetFromLibrary = async (
  user: any,
  getCurrentSets: GetSetsCallback,
  updateSets: UpdateSetsCallback,
  setId: string
): Promise<SimpleFlashcardSet | null> => {
  return cloneFlashcardSet(user, getCurrentSets, updateSets, setId);
};
