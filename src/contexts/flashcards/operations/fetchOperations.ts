
import { supabase } from '@/integrations/supabase/client';
import { FlashcardSet } from '@/types/flashcard';
import { toast } from 'sonner';
import { FlashcardState } from '../types';
import { convertToFlashcardSet } from '../utils/flashcardSetMappers';

/**
 * Enhanced fetch with user validation and retry logic
 */
const fetchWithUserValidation = async (user: any, retryCount = 0): Promise<any> => {
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second

  if (!user) {
    if (retryCount < maxRetries) {
      console.log(`fetchFlashcardSets: No user available, retrying in ${retryDelay}ms (attempt ${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return null; // Signal to retry
    }
    console.error('fetchFlashcardSets: No user available after maximum retries');
    throw new Error('User authentication required');
  }

  console.log('fetchFlashcardSets: User validated', {
    userId: user.id,
    email: user.email,
    attempt: retryCount + 1
  });

  return user;
};

/**
 * Fetch all flashcard sets for the current user with enhanced error handling and user validation
 */
export const fetchFlashcardSets = async (state: FlashcardState): Promise<FlashcardSet[]> => {
  const { user, setLoading, setFlashcardSets } = state;
  
  try {
    console.log('fetchFlashcardSets: Starting fetch operation', {
      hasUser: !!user,
      userId: user?.id || 'none',
      timestamp: new Date().toISOString()
    });

    setLoading(prev => ({ ...prev, sets: true }));

    // Enhanced user validation with retry logic
    let validatedUser = user;
    let retryCount = 0;
    const maxRetries = 3;

    while (!validatedUser && retryCount < maxRetries) {
      const result = await fetchWithUserValidation(validatedUser, retryCount);
      if (result === null) {
        retryCount++;
        continue;
      }
      validatedUser = result;
      break;
    }

    if (!validatedUser) {
      console.log('fetchFlashcardSets: No authenticated user found after retries, returning empty sets array');
      setFlashcardSets([]);
      return [];
    }
    
    console.log('fetchFlashcardSets: Proceeding with database query for user:', validatedUser.id);
    
    // Fetch flashcard sets with enhanced error handling
    const { data, error } = await supabase
      .from('flashcard_sets')
      .select('*')
      .eq('user_id', validatedUser.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('fetchFlashcardSets: Database error:', error);
      throw error;
    }
    
    console.log('fetchFlashcardSets: Database query successful', {
      rawDataLength: data?.length || 0,
      rawData: data?.slice(0, 3).map(d => ({ 
        id: d.id.slice(0, 8), 
        name: d.name, 
        user_id: d.user_id,
        created_at: d.created_at 
      })) || []
    });
    
    if (!data || data.length === 0) {
      console.log('fetchFlashcardSets: No flashcard sets found for user:', validatedUser.id);
      setFlashcardSets([]);
      return [];
    }
    
    // Validate that all returned sets belong to the current user
    const invalidSets = data.filter(set => set.user_id !== validatedUser.id);
    if (invalidSets.length > 0) {
      console.error('fetchFlashcardSets: Found sets that do not belong to current user:', {
        currentUserId: validatedUser.id,
        invalidSets: invalidSets.map(s => ({ id: s.id, user_id: s.user_id }))
      });
    }

    // Convert to proper type with basic card count
    const formattedSets = data
      .filter(set => set.user_id === validatedUser.id) // Extra safety filter
      .map(set => {
        const formattedSet = convertToFlashcardSet({
          ...set,
          card_count: set.card_count || 0
        });
        
        console.log('fetchFlashcardSets: Formatted set:', {
          id: formattedSet.id.slice(0, 8),
          name: formattedSet.name,
          card_count: formattedSet.card_count,
          user_id: formattedSet.user_id
        });
        return formattedSet;
      });
    
    console.log('fetchFlashcardSets: Final operation summary', {
      userId: validatedUser.id,
      originalDataCount: data.length,
      finalSetsCount: formattedSets.length,
      setNames: formattedSets.map(s => s.name)
    });
    
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
 * Fetch academic subjects for flashcard sets
 */
export const fetchAcademicSubjects = async (state: FlashcardState) => {
  const { setLoading, setAcademicSubjects } = state;
  
  try {
    setLoading(prev => ({ ...prev, academicSubjects: true }));
    
    const { data, error } = await supabase
      .from('academic_subjects') // Changed from subject_categories to academic_subjects
      .select('*')
      .order('name');
      
    if (error) throw error;
    
    setAcademicSubjects(data);
    return data;
  } catch (error) {
    console.error('fetchAcademicSubjects: Error fetching academic subjects:', error);
    toast.error('Failed to load academic subjects');
    return [];
  } finally {
    setLoading(prev => ({ ...prev, academicSubjects: false }));
  }
};
