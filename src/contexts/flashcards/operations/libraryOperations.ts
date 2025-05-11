
import { supabase } from "@/integrations/supabase/client";
import { FlashcardSet } from "@/types/flashcard";
import { FlashcardState } from '../types';

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

// Fetch built-in sets for the library
export const fetchBuiltInSets = async (state: FlashcardState): Promise<FlashcardSet[]> => {
  try {
    const { setLoading } = state;
    if (setLoading) {
      setLoading(prev => ({ ...prev, sets: true }));
    }

    const { data, error } = await supabase
      .from('flashcard_sets')
      .select(`
        id,
        name,
        description,
        is_built_in,
        subject,
        created_at,
        updated_at,
        image_url,
        cards_count,
        metadata,
        owner_id,
        topic,
        country_id,
        category_id,
        education_system,
        section_id
      `)
      .eq('is_built_in', true);
    
    if (error) {
      throw error;
    }
    
    if (setLoading) {
      setLoading(prev => ({ ...prev, sets: false }));
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching built-in flashcard sets:', error);
    if (state.setLoading) {
      state.setLoading(prev => ({ ...prev, sets: false }));
    }
    return [];
  }
};

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
        owner_id,
        topic,
        country_id,
        category_id,
        education_system,
        section_id
      `);
    
    // Apply filters as needed
    if (filters?.filterBuiltIn) {
      query = query.eq('is_built_in', true);
    }
    
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
    return [];
  }
};

export const fetchFlashcardSetsWithCount = async (filters?: LibraryFilters): Promise<FlashcardSetWithCount[]> => {
  try {
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
export const cloneFlashcardSet = async (state: FlashcardState, setId: string): Promise<FlashcardSet | null> => {
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
    return null;
  }
};

// Fetch available subjects - simplified to avoid table errors
export const fetchSubjects = async (): Promise<string[]> => {
  try {
    // Use flashcard_sets table which we know exists, and get unique subjects
    const { data, error } = await supabase
      .from('flashcard_sets')
      .select('subject')
      .not('subject', 'is', null);
    
    if (error) {
      throw error;
    }
    
    // Extract unique subjects
    const subjects = [...new Set(data.map(item => item.subject))];
    return subjects.filter(Boolean);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }
};
