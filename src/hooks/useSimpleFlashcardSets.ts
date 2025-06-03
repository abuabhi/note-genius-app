
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FlashcardSet } from '@/types/flashcard';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';

export const useSimpleFlashcardSets = () => {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchFlashcardSets = async () => {
    if (!user) {
      setFlashcardSets([]);
      setLoading(false);
      return [];
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching flashcard sets for user:', user.id);
      
      // Simple query without joins to avoid relationship errors
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching flashcard sets:', error);
        throw error;
      }

      // Transform the data to match FlashcardSet interface
      const sets: FlashcardSet[] = (data || []).map(set => ({
        id: set.id,
        name: set.name,
        description: set.description,
        user_id: set.user_id,
        created_at: set.created_at,
        updated_at: set.updated_at,
        is_built_in: set.is_built_in,
        card_count: set.card_count || 0,
        subject: set.subject,
        topic: set.topic,
        country_id: set.country_id,
        category_id: set.category_id,
        education_system: set.education_system,
        section_id: set.section_id,
        // Remove subject_categories for now since the relationship doesn't exist
        subject_categories: undefined
      }));
      
      console.log('Successfully fetched flashcard sets:', sets);
      
      setFlashcardSets(sets);
      return sets;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load flashcard sets';
      console.error('Error in fetchFlashcardSets:', err);
      setError(errorMsg);
      toast.error(errorMsg);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const deleteFlashcardSet = async (setId: string) => {
    try {
      const { error } = await supabase
        .from('flashcard_sets')
        .delete()
        .eq('id', setId);

      if (error) throw error;

      setFlashcardSets(prev => prev.filter(set => set.id !== setId));
      toast.success('Flashcard set deleted successfully');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete flashcard set';
      console.error('Error deleting flashcard set:', err);
      toast.error(errorMsg);
      throw err;
    }
  };

  useEffect(() => {
    fetchFlashcardSets();
  }, [user]);

  return {
    flashcardSets,
    loading,
    error,
    fetchFlashcardSets,
    deleteFlashcardSet,
    refetch: fetchFlashcardSets
  };
};
