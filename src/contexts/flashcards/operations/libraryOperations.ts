
// Fix the TypeScript errors in libraryOperations.ts
import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';

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
    const { data: setCountData, error: countError } = await supabase.rpc(
      'get_flashcard_sets_with_count'
    );
    
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
      const countInfo = setCountData.find((item: any) => item.set_id === set.id);
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
