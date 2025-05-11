
import { supabase } from "@/integrations/supabase/client";
import { Flashcard, FlashcardSet } from "@/types/flashcard";

export interface LibraryFilters {
  searchTerm?: string;
  selectedSubjects?: string[];
  selectedTags?: string[];
  sortBy?: string;
  filterMine?: boolean;
  filterBuiltIn?: boolean;
  filterShared?: boolean;
}

export interface FlashcardSetWithCount extends FlashcardSet {
  flashcard_count: number;
}

// Fetch all flashcard sets that are available in the library
export const fetchLibraryFlashcardSets = async (filters?: LibraryFilters): Promise<FlashcardSet[]> => {
  try {
    let query = supabase
      .from('flashcard_sets')
      .select(`
        id,
        name,
        description,
        is_public,
        is_built_in,
        subject,
        created_at,
        updated_at,
        image_url,
        cards_count,
        metadata,
        owner_id
      `)
      .eq('is_public', true);
    
    // Apply search filter
    if (filters?.searchTerm) {
      query = query.or(`name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
    }
    
    // Apply subject filter
    if (filters?.selectedSubjects && filters.selectedSubjects.length > 0) {
      query = query.in('subject', filters.selectedSubjects);
    }
    
    // Apply sorting
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'name_asc':
          query = query.order('name', { ascending: true });
          break;
        case 'name_desc':
          query = query.order('name', { ascending: false });
          break;
        case 'date_asc':
          query = query.order('created_at', { ascending: true });
          break;
        case 'date_desc':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }
    } else {
      // Default sort by most recent
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching library flashcard sets:', error);
    throw error;
  }
};

export const fetchFlashcardSetsWithCount = async (filters?: LibraryFilters): Promise<FlashcardSetWithCount[]> => {
  try {
    // This is using an RPC function call, replace with a standard query that matches the database schema
    const { data, error } = await supabase
      .from('flashcard_sets')
      .select(`
        id,
        name,
        description,
        is_public,
        is_built_in,
        subject,
        created_at,
        updated_at,
        image_url,
        cards_count,
        metadata,
        owner_id
      `);
    
    if (error) {
      throw error;
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Convert data to FlashcardSetWithCount format
    return data.map(set => ({
      ...set,
      flashcard_count: set.cards_count || 0
    })) as FlashcardSetWithCount[];
  } catch (error) {
    console.error('Error fetching flashcard sets with count:', error);
    return [];
  }
};

// Clone a flashcard set for the current user
export const cloneFlashcardSet = async (setId: string): Promise<FlashcardSet> => {
  try {
    const { data, error } = await supabase.functions.invoke('clone-flashcard-set', {
      body: { setId }
    });
    
    if (error) {
      throw error;
    }
    
    return data.flashcardSet;
  } catch (error) {
    console.error('Error cloning flashcard set:', error);
    throw error;
  }
};

// Rate a flashcard set
export const rateFlashcardSet = async (setId: string, rating: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('flashcard_set_ratings')
      .upsert(
        { 
          set_id: setId, 
          rating: rating 
        },
        { onConflict: 'set_id' }
      );
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error rating flashcard set:', error);
    throw error;
  }
};

// Fetch all available subjects
export const fetchSubjects = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('name')
      .order('name');
    
    if (error) {
      throw error;
    }
    
    return data.map(subject => subject.name);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }
};

// Fetch user's ratings
export const fetchUserRatings = async (): Promise<Record<string, number>> => {
  try {
    const { data, error } = await supabase
      .from('flashcard_set_ratings')
      .select('set_id, rating');
    
    if (error) {
      throw error;
    }
    
    return data.reduce((acc: Record<string, number>, curr) => {
      acc[curr.set_id] = curr.rating;
      return acc;
    }, {});
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    return {};
  }
};
