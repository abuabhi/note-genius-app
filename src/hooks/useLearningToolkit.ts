
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

export interface LearningToolkitData {
  totalNotes: number;
  totalFlashcardSets: number;
  totalFlashcards: number;
  totalQuizzes: number;
  totalTodos: number;
  totalGoals: number;
  isLoading: boolean;
  error: any;
}

export const useLearningToolkit = () => {
  const { user } = useAuth();

  // Parallel queries for optimal performance
  const { data: notesCount = 0, isLoading: notesLoading } = useQuery({
    queryKey: ['toolkit-notes-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      
      const { count, error } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
  });

  const { data: flashcardData, isLoading: flashcardLoading } = useQuery({
    queryKey: ['toolkit-flashcards', user?.id],
    queryFn: async () => {
      if (!user) return { sets: 0, cards: 0 };
      
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('card_count')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const sets = data?.length || 0;
      const cards = data?.reduce((sum, set) => sum + (set.card_count || 0), 0) || 0;
      
      return { sets, cards };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: quizzesCount = 0, isLoading: quizzesLoading } = useQuery({
    queryKey: ['toolkit-quizzes-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      
      const { count, error } = await supabase
        .from('quizzes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: todosCount = 0, isLoading: todosLoading } = useQuery({
    queryKey: ['toolkit-todos-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      
      const { count, error } = await supabase
        .from('reminders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('type', 'todo');

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: goalsCount = 0, isLoading: goalsLoading } = useQuery({
    queryKey: ['toolkit-goals-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      
      const { count, error } = await supabase
        .from('study_goals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Memoize the result to prevent unnecessary re-renders
  const toolkitData = useMemo((): LearningToolkitData => {
    const isLoading = notesLoading || flashcardLoading || quizzesLoading || todosLoading || goalsLoading;
    
    return {
      totalNotes: notesCount,
      totalFlashcardSets: flashcardData?.sets || 0,
      totalFlashcards: flashcardData?.cards || 0,
      totalQuizzes: quizzesCount,
      totalTodos: todosCount,
      totalGoals: goalsCount,
      isLoading,
      error: null // Individual errors are handled by React Query
    };
  }, [notesCount, flashcardData, quizzesCount, todosCount, goalsCount, notesLoading, flashcardLoading, quizzesLoading, todosLoading, goalsLoading]);

  return toolkitData;
};
