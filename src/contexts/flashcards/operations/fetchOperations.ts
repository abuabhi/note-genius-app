
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
    console.log('No user found, returning empty sets array');
    return [];
  }
  
  try {
    console.log('Starting to fetch flashcard sets for user:', user.id);
    setLoading(prev => ({ ...prev, sets: true }));
    
    // Fetch flashcard sets
    const { data, error } = await supabase
      .from('flashcard_sets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching flashcard sets:', error);
      throw error;
    }
    
    console.log('Fetched flashcard sets data:', data);
    
    if (!data || data.length === 0) {
      console.log('No flashcard sets found for user');
      setFlashcardSets([]);
      return [];
    }
    
    // Get card counts for each set
    const setsWithCardCounts = await Promise.all(
      data.map(async (set) => {
        const { count, error: countError } = await supabase
          .from('flashcard_set_cards')
          .select('*', { count: 'exact', head: true })
          .eq('set_id', set.id);
        
        if (countError) {
          console.error('Error getting card count for set', set.id, ':', countError);
        }
        
        // Convert to proper type and add card count
        const formattedSet = convertToFlashcardSet({
          ...set,
          card_count: countError ? 0 : count || 0
        });
        
        console.log('Formatted set with card count:', formattedSet);
        return formattedSet;
      })
    );
    
    console.log('Final flashcard sets with counts:', setsWithCardCounts);
    setFlashcardSets(setsWithCardCounts);
    return setsWithCardCounts;
  } catch (error) {
    console.error('Error fetching flashcard sets:', error);
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
    console.error('Error fetching subject categories:', error);
    toast.error('Failed to load categories');
    return [];
  } finally {
    setLoading(prev => ({ ...prev, categories: false }));
  }
};
