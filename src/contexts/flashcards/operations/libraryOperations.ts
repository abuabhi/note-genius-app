
// Fix the TypeScript errors in libraryOperations.ts
import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';
import { FlashcardState } from '../types';
import { FlashcardSet } from '@/types/flashcard';
import { toast } from 'sonner';

// Transform data from API format to frontend format
export const transformLibraryData = (libraryData: any[]) => {
  return libraryData.map(set => {
    // Create a safe function to extract category data
    const getCategory = () => {
      if (!set.subject_categories) return null;
      
      return {
        id: set.subject_categories.id,
        name: set.subject_categories.name,
        level: set.subject_categories.level,
        parentId: set.subject_categories.parent_id
      };
    };
    
    return {
      id: set.id,
      name: set.name,
      description: set.description || '',
      numCards: set.card_count,
      subject: set.subject || '',
      category: getCategory(),
      isBuiltIn: set.is_built_in || false,
      section: set.sections ? {
        id: set.sections.id,
        name: set.sections.name
      } : null,
      createdAt: set.created_at,
      updatedAt: set.updated_at
    };
  });
};

// Fetch flashcard sets for the library
export const fetchFlashcardLibrary = async () => {
  try {
    // First get the count of cards per set using a separate query
    const { data: setCountData, error: countError } = await supabase
      .rpc('get_flashcard_sets_with_count');
    
    if (countError) {
      throw countError;
    }
    
    // Now get the actual flashcard sets with their relationships
    const { data: setsData, error: setsError } = await supabase
      .from('flashcard_sets')
      .select(`
        id, 
        name, 
        description, 
        subject,
        is_built_in,
        created_at,
        updated_at,
        subject_categories (
          id, 
          name,
          level,
          parent_id
        ),
        sections (
          id,
          name
        )
      `)
      .eq('is_built_in', true)
      .order('created_at', { ascending: false });
    
    if (setsError) {
      throw setsError;
    }
    
    // Merge the count data with the sets data
    const combinedData = setsData.map(set => {
      const countInfo = setCountData && Array.isArray(setCountData) ? 
        setCountData.find((item: any) => item.set_id === set.id) : 
        undefined;
      
      return {
        ...set,
        card_count: countInfo ? countInfo.card_count : 0
      };
    });
    
    return {
      data: transformLibraryData(combinedData),
      error: null
    };
  } catch (error) {
    console.error('Error fetching flashcard library:', error);
    return {
      data: [],
      error: error as PostgrestError
    };
  }
};

/**
 * Fetch built-in flashcard sets for the library
 */
export const fetchBuiltInSets = async (state: FlashcardState) => {
  const { setLoading } = state;
  
  try {
    setLoading(prev => ({ ...prev, sets: true }));
    
    const { data, error } = await fetchFlashcardLibrary();
    
    if (error) throw error;
    
    return data as FlashcardSet[];
  } catch (error) {
    console.error('Error fetching built-in sets:', error);
    toast.error('Failed to load library sets');
    return [];
  } finally {
    setLoading(prev => ({ ...prev, sets: false }));
  }
};

/**
 * Clone a flashcard set from the library to user's sets
 */
export const cloneFlashcardSet = async (state: FlashcardState, setId: string): Promise<FlashcardSet | null> => {
  const { user, setFlashcardSets } = state;
  
  if (!user) return null;
  
  try {
    // First fetch the set to clone
    const { data: sourceSet, error: sourceError } = await supabase
      .from('flashcard_sets')
      .select('*')
      .eq('id', setId)
      .single();
    
    if (sourceError) throw sourceError;
    
    // Create new set
    const { data: newSet, error: createError } = await supabase
      .from('flashcard_sets')
      .insert({
        name: `${sourceSet.name} (Copy)`,
        description: sourceSet.description,
        user_id: user.id,
        subject: sourceSet.subject,
        is_public: false,
        is_built_in: false,
        category_id: sourceSet.category_id
      })
      .select()
      .single();
    
    if (createError) throw createError;
    
    // Now fetch all cards from the original set
    const { data: cards, error: cardsError } = await supabase
      .from('flashcard_set_cards')
      .select('*, flashcards(*)')
      .eq('set_id', setId);
    
    if (cardsError) throw cardsError;
    
    // Clone each card
    if (cards && cards.length > 0) {
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const cardData = card.flashcards;
        
        // Create a new card
        const { data: newCard, error: newCardError } = await supabase
          .from('flashcards')
          .insert({
            front_content: cardData.front_content,
            back_content: cardData.back_content,
            user_id: user.id,
            difficulty: cardData.difficulty || 1
          })
          .select()
          .single();
        
        if (newCardError) throw newCardError;
        
        // Add the new card to the set
        const { error: linkError } = await supabase
          .from('flashcard_set_cards')
          .insert({
            set_id: newSet.id,
            flashcard_id: newCard.id,
            position: card.position
          });
        
        if (linkError) throw linkError;
      }
    }
    
    // Add to local state
    const clonedSet = {
      id: newSet.id,
      name: newSet.name,
      description: newSet.description || '',
      user_id: newSet.user_id,
      created_at: newSet.created_at,
      updated_at: newSet.updated_at,
      card_count: cards.length
    } as FlashcardSet;
    
    setFlashcardSets(prev => [clonedSet, ...prev]);
    
    return clonedSet;
  } catch (error) {
    console.error('Error cloning flashcard set:', error);
    toast.error('Failed to clone flashcard set');
    return null;
  }
};

// No need for this export block since we're already exporting the functions above
// export { 
//   fetchBuiltInSets,
//   cloneFlashcardSet
// };
