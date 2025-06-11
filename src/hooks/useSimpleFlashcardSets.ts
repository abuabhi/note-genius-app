
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSimpleFlashcardSets = () => {
  const {
    data: flashcardSets = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['simple-flashcard-sets'],
    queryFn: async () => {
      console.log('Fetching flashcard sets...');
      
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select(`
          *,
          academic_subjects(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching flashcard sets:', error);
        throw error;
      }

      console.log('Flashcard sets fetched:', data?.length || 0);
      return data || [];
    },
  });

  const getFlashcardsForSet = async (setId: string) => {
    console.log('Fetching flashcards for set:', setId);
    
    const { data, error } = await supabase
      .from('flashcard_set_cards')
      .select(`
        flashcards(*)
      `)
      .eq('set_id', setId)
      .order('position');

    if (error) {
      console.error('Error fetching flashcards:', error);
      throw error;
    }

    return data?.map(item => item.flashcards).filter(Boolean) || [];
  };

  const filterSetsBySubject = (subjectId?: string) => {
    if (!subjectId) return flashcardSets;
    return flashcardSets.filter(set => set.subject_id === subjectId);
  };

  return {
    flashcardSets,
    isLoading,
    error,
    refetch,
    getFlashcardsForSet,
    filterSetsBySubject
  };
};
