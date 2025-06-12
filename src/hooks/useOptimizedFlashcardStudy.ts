import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { StudyMode } from '@/pages/study/types';
import { Flashcard } from '@/types/flashcard';
import { useGlobalSessionTracker } from '@/hooks/useGlobalSessionTracker';

interface UseOptimizedFlashcardStudyProps {
  setId: string;
  mode: StudyMode;
}

interface OptimizedFlashcardData extends Flashcard {
  mastery_level?: number;
  last_reviewed_at?: string;
  times_seen?: number;
  times_correct?: number;
  is_known?: boolean;
  is_difficult?: boolean;
  confidence_level?: number;
}

interface StudyStats {
  studiedToday: number;
  masteredCount: number;
  totalCards: number;
}

export const useOptimizedFlashcardStudy = ({ setId, mode }: UseOptimizedFlashcardStudyProps) => {
  const { user } = useAuth();
  const { updateSessionActivity, recordActivity } = useGlobalSessionTracker();
  const queryClient = useQueryClient();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyStats, setStudyStats] = useState<StudyStats>({
    studiedToday: 0,
    masteredCount: 0,
    totalCards: 0
  });

  // Optimized query to fetch flashcards with proper relationships
  const { data, isLoading, error } = useQuery({
    queryKey: ['optimized-flashcard-study', setId, mode, user?.id],
    queryFn: async () => {
      if (!user || !setId) return null;

      console.log('🚀 Starting optimized flashcard fetch for set:', setId, 'mode:', mode);
      const startTime = Date.now();

      // Step 1: Get flashcards for the set
      const { data: flashcardData, error: flashcardError } = await supabase
        .from('flashcard_set_cards')
        .select(`
          position,
          flashcards!inner (
            id,
            front_content,
            back_content,
            difficulty,
            created_at,
            updated_at,
            user_id,
            is_built_in
          )
        `)
        .eq('set_id', setId)
        .order('position', { ascending: true });

      if (flashcardError) {
        console.error('❌ Error fetching flashcards:', flashcardError);
        throw flashcardError;
      }

      if (!flashcardData || flashcardData.length === 0) {
        console.log('📝 No flashcards found in set:', setId);
        return {
          flashcards: [],
          stats: { studiedToday: 0, masteredCount: 0, totalCards: 0 }
        };
      }

      console.log('📋 Found flashcards in set:', flashcardData.length);

      // Step 2: Get progress data separately for the user
      const flashcardIds = flashcardData.map(item => item.flashcards.id);
      
      const [progressData, learningData] = await Promise.all([
        supabase
          .from('user_flashcard_progress')
          .select('*')
          .eq('user_id', user.id)
          .in('flashcard_id', flashcardIds),
        supabase
          .from('learning_progress')
          .select('*')
          .eq('user_id', user.id)
          .in('flashcard_id', flashcardIds)
      ]);

      // Create lookup maps for performance
      const progressMap = new Map(
        (progressData.data || []).map(p => [p.flashcard_id, p])
      );
      const learningMap = new Map(
        (learningData.data || []).map(l => [l.flashcard_id, l])
      );

      // Step 3: Transform and combine data efficiently
      const allCards: OptimizedFlashcardData[] = flashcardData.map(item => {
        const flashcard = item.flashcards;
        const progress = progressMap.get(flashcard.id);
        const learningProgress = learningMap.get(flashcard.id);

        return {
          id: flashcard.id,
          front_content: flashcard.front_content,
          back_content: flashcard.back_content,
          difficulty: flashcard.difficulty,
          created_at: flashcard.created_at,
          updated_at: flashcard.updated_at,
          user_id: flashcard.user_id,
          is_built_in: flashcard.is_built_in,
          front: flashcard.front_content,
          back: flashcard.back_content,
          mastery_level: progress?.mastery_level || 0,
          last_reviewed_at: progress?.last_reviewed_at,
          times_seen: progress?.times_seen || 0,
          times_correct: progress?.times_correct || 0,
          is_known: learningProgress?.is_known || false,
          is_difficult: learningProgress?.is_difficult || false,
          confidence_level: learningProgress?.confidence_level || 0
        };
      });

      const studiedToday = allCards.filter(card => {
        if (!card.last_reviewed_at) return false;
        const today = new Date().toDateString();
        const lastReviewed = new Date(card.last_reviewed_at).toDateString();
        return today === lastReviewed;
      }).length;

      const masteredCount = allCards.filter(card => card.mastery_level && card.mastery_level >= 4).length;

      console.log(`⚡ Optimized fetch completed in ${Date.now() - startTime}ms`);

      return {
        flashcards: allCards,
        stats: {
          studiedToday,
          masteredCount,
          totalCards: allCards.length
        }
      };
    },
    enabled: !!user && !!setId
  });

  useEffect(() => {
    if (data?.stats) {
      setStudyStats(data.stats);
    }
  }, [data]);

  const flashcards = data?.flashcards || [];

  const handleNext = useCallback(() => {
    recordActivity();
    setIsFlipped(false);
    setCurrentIndex(prev => (prev + 1) % flashcards.length);
  }, [flashcards.length, recordActivity]);

  const handlePrevious = useCallback(() => {
    recordActivity();
    setIsFlipped(false);
    setCurrentIndex(prev => (prev - 1 + flashcards.length) % flashcards.length);
  }, [flashcards.length, recordActivity]);

  const handleFlip = useCallback(() => {
    recordActivity();
    setIsFlipped(prev => !prev);
  }, [recordActivity]);

  const handleCardChoice = useCallback(async (choice: 'mastered' | 'needs_practice' | 'difficult') => {
    if (!user || !flashcards[currentIndex]) return;

    recordActivity();
    const currentCard = flashcards[currentIndex];

    try {
      let masteryLevel = 1;
      if (choice === 'mastered') masteryLevel = 4;
      else if (choice === 'needs_practice') masteryLevel = 2;
      else if (choice === 'difficult') masteryLevel = 1;

      // Update progress
      const { error } = await supabase
        .from('user_flashcard_progress')
        .upsert({
          user_id: user.id,
          flashcard_id: currentCard.id,
          mastery_level: masteryLevel,
          last_reviewed_at: new Date().toISOString(),
          times_seen: (currentCard.times_seen || 0) + 1,
          times_correct: choice === 'mastered' ? (currentCard.times_correct || 0) + 1 : (currentCard.times_correct || 0)
        });

      if (error) throw error;

      // Update session activity
      await updateSessionActivity({
        cards_reviewed: studyStats.studiedToday + 1,
        cards_correct: choice === 'mastered' ? (studyStats.masteredCount + 1) : studyStats.masteredCount
      });

      // Update local stats
      setStudyStats(prev => ({
        ...prev,
        studiedToday: prev.studiedToday + 1,
        masteredCount: choice === 'mastered' ? prev.masteredCount + 1 : prev.masteredCount
      }));

      // Move to next card
      handleNext();

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['optimized-flashcard-study'] });

    } catch (error) {
      console.error('Error updating flashcard progress:', error);
      toast.error('Failed to save progress');
    }
  }, [user, flashcards, currentIndex, studyStats, updateSessionActivity, handleNext, queryClient, recordActivity]);

  const currentCard = useMemo(() => flashcards[currentIndex] || null, [flashcards, currentIndex]);
  const isComplete = useMemo(() => currentIndex >= flashcards.length && flashcards.length > 0, [currentIndex, flashcards.length]);
  const totalCards = flashcards.length;

  return {
    flashcards,
    currentIndex,
    isFlipped,
    isLoading,
    error,
    isComplete,
    currentCard,
    totalCards,
    studiedToday: studyStats.studiedToday,
    masteredCount: studyStats.masteredCount,
    handleNext,
    handlePrevious,
    handleFlip,
    handleCardChoice,
    setIsFlipped
  };
};
