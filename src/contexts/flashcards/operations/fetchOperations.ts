
import { supabase } from '@/integrations/supabase/client';
import { FlashcardSet } from '@/types/flashcard';
import { toast } from 'sonner';
import { FlashcardState } from '../types';
import { convertToFlashcardSet } from '../utils/flashcardSetMappers';

/**
 * Fetch all flashcard sets for the current user
 */
export const fetchFlashcardSets = async (state: FlashcardState): Promise<FlashcardSet[]> => {
  const { user, setLoading, setFlashcardSets } = state;
  
  if (!user) {
    console.log('fetchFlashcardSets: No user found, returning empty sets array');
    setFlashcardSets([]);
    return [];
  }
  
  try {
    console.log('fetchFlashcardSets: Starting to fetch flashcard sets for user:', user.id);
    setLoading(prev => ({ ...prev, sets: true }));
    
    // Fetch flashcard sets with enhanced error handling
    const { data, error } = await supabase
      .from('flashcard_sets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('fetchFlashcardSets: Error fetching flashcard sets:', error);
      throw error;
    }
    
    console.log('fetchFlashcardSets: Raw data from database:', data);
    
    if (!data || data.length === 0) {
      console.log('fetchFlashcardSets: No flashcard sets found for user');
      setFlashcardSets([]);
      return [];
    }
    
    // Convert to proper type with basic card count (fallback to 0 if count fails)
    const formattedSets = data.map(set => {
      const formattedSet = convertToFlashcardSet({
        ...set,
        card_count: set.card_count || 0 // Use existing card_count or default to 0
      });
      
      console.log('fetchFlashcardSets: Formatted set:', {
        id: formattedSet.id,
        name: formattedSet.name,
        card_count: formattedSet.card_count
      });
      return formattedSet;
    });
    
    console.log('fetchFlashcardSets: Final flashcard sets count:', formattedSets.length);
    setFlashcardSets(formattedSets);
    return formattedSets;
  } catch (error) {
    console.error('fetchFlashcardSets: Error in fetch operation:', error);
    toast.error('Failed to load flashcard sets');
    setFlashcardSets([]);
    return [];
  } finally {
    setLoading(prev => ({ ...prev, sets: false }));
  }
};

/**
 * Fetch categories for flashcard sets
 */
export const fetchCategories = async (state: FlashcardState) => {
  const { setLoading, setCategories } = state;
  
  try {
    setLoading(prev => ({ ...prev, categories: true }));
    
    const { data, error } = await supabase
      .from('subject_categories')
      .select('*')
      .order('name');
      
    if (error) throw error;
    
    setCategories(data);
    return data;
  } catch (error) {
    console.error('fetchCategories: Error fetching subject categories:', error);
    toast.error('Failed to load categories');
    return [];
  } finally {
    setLoading(prev => ({ ...prev, categories: false }));
  }
};
