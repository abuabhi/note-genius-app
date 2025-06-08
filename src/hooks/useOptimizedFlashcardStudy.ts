
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { StudyMode } from '@/pages/study/types';
import { Flashcard } from '@/types/flashcard';
import { useGlobalSessionTracker } from './useGlobalSessionTracker';

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

  // Single optimized query to fetch all data
  const { data, isLoading, error } = useQuery({
    queryKey: ['optimized-flashcard-study', setId, mode, user?.id],
    queryFn: async () => {
      if (!user || !setId) return null;

      console.log('🚀 Starting optimized flashcard fetch for set:', setId, 'mode:', mode);
      const startTime = Date.now();

      // Single query with JOINs to fetch everything at once
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
          ),
          user_flashcard_progress (
            mastery_level,
            last_reviewed_at,
            last_score,
            ease_factor,
            interval,
            repetition
          ),
          learning_progress (
            times_seen,
            times_correct,
            is_known,
            is_difficult,
            confidence_level,
            last_seen_at
          )
        `)
        .eq('set_id', setId)
        .order('position', { ascending: true });

      if (flashcardError) {
        console.error('❌ Error fetching flashcards:', flashcardError);
        throw flashcardError;
      }

      const loadTime = Date.now() - startTime;
      console.log(`⚡ Data fetched in ${loadTime}ms`);

      if (!flashcardData || flashcardData.length === 0) {
        return {
          flashcards: [],
          stats: { studiedToday: 0, masteredCount: 0, totalCards: 0 }
        };
      }

      // Transform and filter data efficiently
      const allCards: OptimizedFlashcardData[] = flashcardData.map(item => {
        const flashcard = item.flashcards;
        const progress = Array.isArray(item.user_flashcard_progress) ? item.user_flashcard_progress[0] : item.user_flashcard_progress;
        const learningProgress = Array.isArray(item.learning_progress) ? item.learning_progress[0] : item.learning_progress;

        return {
          id: flashcard.id,
          front_content: flashcard.front_content,
          back_content: flashcard.back_content,
          front: flashcard.front_content,
          back: flashcard.back_content,
          difficulty: flashcard.difficulty,
          created_at: flashcard.created_at,
          updated_at: flashcard.updated_at,
          user_id: flashcard.user_id,
          is_built_in: flashcard.is_built_in,
          position: item.position,
          // Progress data
          mastery_level: progress?.mastery_level || 0,
          last_reviewed_at: progress?.last_reviewed_at || learningProgress?.last_seen_at,
          times_seen: learningProgress?.times_seen || 0,
          times_correct: learningProgress?.times_correct || 0,
          is_known: learningProgress?.is_known || false,
          is_difficult: learningProgress?.is_difficult || false,
          confidence_level: learningProgress?.confidence_level || 1
        };
      });

      // Fast filtering based on mode
      let filteredCards = allCards;
      if (mode === 'review') {
        filteredCards = allCards.filter(card => {
          // Needs review if: never seen, marked difficult, low success rate, or mastery < 1
          if (!card.last_reviewed_at) return true;
          if (card.is_difficult) return true;
          if (card.mastery_level && card.mastery_level < 1) return true;
          
          const successRate = card.times_seen > 0 
            ? (card.times_correct / card.times_seen) * 100 
            : 0;
          return successRate < 80;
        });
      } else if (mode === 'learn') {
        // For learn mode, prioritize cards never seen or with low confidence
        filteredCards = allCards.filter(card => 
          !card.last_reviewed_at || card.confidence_level < 3
        );
      }

      // Calculate stats
      const today = new Date().toDateString();
      const studiedToday = filteredCards.filter(card => 
        card.last_reviewed_at && new Date(card.last_reviewed_at).toDateString() === today
      ).length;

      const masteredCount = filteredCards.filter(card => 
        card.mastery_level >= 1 || card.is_known || 
        (card.times_seen > 0 && (card.times_correct / card.times_seen) >= 0.9)
      ).length;

      const totalTime = Date.now() - startTime;
      console.log(`✅ Optimized flashcard data processed in ${totalTime}ms:`, {
        totalCards: allCards.length,
        filteredCards: filteredCards.length,
        studiedToday,
        masteredCount,
        mode
      });

      return {
        flashcards: filteredCards,
        stats: {
          studiedToday,
          masteredCount,
          totalCards: filteredCards.length
        }
      };
    },
    enabled: !!user && !!setId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2
  });

  // Memoized values for better performance
  const flashcards = useMemo(() => data?.flashcards || [], [data?.flashcards]);
  const currentCard = useMemo(() => 
    flashcards.length > 0 && currentIndex < flashcards.length 
      ? flashcards[currentIndex] 
      : null, 
    [flashcards, currentIndex]
  );

  // Update local stats when data changes
  useEffect(() => {
    if (data?.stats) {
      setStudyStats(data.stats);
    }
  }, [data?.stats]);

  // Optimized card choice handler with batch updates
  const handleCardChoice = useCallback(async (choice: 'mastered' | 'needs_practice') => {
    if (!user || !currentCard) return;

    recordActivity();
    
    try {
      const isCorrect = choice === 'mastered';
      const now = new Date().toISOString();
      
      // Batch database updates
      const updates = [
        // Update learning progress
        supabase
          .from('learning_progress')
          .upsert({
            user_id: user.id,
            flashcard_id: currentCard.id,
            times_seen: (currentCard.times_seen || 0) + 1,
            times_correct: (currentCard.times_correct || 0) + (isCorrect ? 1 : 0),
            last_seen_at: now,
            is_difficult: !isCorrect,
            is_known: isCorrect,
            confidence_level: isCorrect ? Math.min(5, (currentCard.confidence_level || 1) + 1) : Math.max(1, (currentCard.confidence_level || 1) - 1)
          }, { onConflict: 'user_id,flashcard_id' }),
        
        // Update flashcard progress
        supabase
          .from('user_flashcard_progress')
          .upsert({
            user_id: user.id,
            flashcard_id: currentCard.id,
            last_score: isCorrect ? 5 : 1,
            last_reviewed_at: now,
            mastery_level: isCorrect ? 1 : 0,
            ease_factor: isCorrect ? 2.6 : 1.8,
            interval: isCorrect ? 1 : 0,
            repetition: isCorrect ? 1 : 0
          }, { onConflict: 'user_id,flashcard_id' })
      ];

      // Execute updates in parallel
      const results = await Promise.allSettled(updates);
      
      // Check for errors
      const errors = results.filter(result => result.status === 'rejected');
      if (errors.length > 0) {
        console.error('Some updates failed:', errors);
        toast.error('Failed to save some progress');
      } else {
        // Update session activity
        await updateSessionActivity({
          cards_reviewed: 1,
          cards_correct: isCorrect ? 1 : 0
        });

        // Update local stats optimistically
        setStudyStats(prev => ({
          ...prev,
          studiedToday: prev.studiedToday + 1,
          masteredCount: isCorrect ? prev.masteredCount + 1 : prev.masteredCount
        }));

        // Show feedback
        toast.success(isCorrect ? 'Card mastered! 🎉' : 'Marked for practice 📚', {
          duration: 1500
        });
      }

      // Move to next card
      setTimeout(() => {
        handleNext();
      }, 500);

    } catch (error) {
      console.error('Error updating card progress:', error);
      toast.error('Failed to save progress');
    }
  }, [user, currentCard, updateSessionActivity, recordActivity]);

  const handleNext = useCallback(() => {
    recordActivity();
    setIsFlipped(false);
    setCurrentIndex(prev => Math.min(prev + 1, flashcards.length - 1));
  }, [flashcards.length, recordActivity]);

  const handlePrevious = useCallback(() => {
    recordActivity();
    setIsFlipped(false);
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  }, [recordActivity]);

  const handleFlip = useCallback(() => {
    recordActivity();
    setIsFlipped(prev => !prev);
  }, [recordActivity]);

  // Invalidate cache when user makes progress
  const invalidateCache = useCallback(() => {
    queryClient.invalidateQueries({ 
      queryKey: ['optimized-flashcard-study', setId] 
    });
    queryClient.invalidateQueries({ 
      queryKey: ['timezone-aware-analytics'] 
    });
  }, [queryClient, setId]);

  return {
    flashcards,
    currentIndex,
    isFlipped,
    isLoading,
    error: error?.message || null,
    isComplete: currentIndex >= flashcards.length - 1,
    currentCard,
    totalCards: flashcards.length,
    studiedToday: studyStats.studiedToday,
    masteredCount: studyStats.masteredCount,
    handleNext,
    handlePrevious,
    handleFlip,
    handleCardChoice,
    setIsFlipped,
    invalidateCache
  };
};
