
import { supabase } from '@/integrations/supabase/client';
import { FlashcardScore, FlashcardProgress } from '@/types/flashcard';
import { useToast } from '@/hooks/use-toast';

export const useStudyOperations = (userId?: string) => {
  const { toast } = useToast();

  // Record a flashcard review using the SM-2 spaced repetition algorithm
  const recordFlashcardReview = async (flashcardId: string, score: FlashcardScore) => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Get the current progress for this flashcard
      const { data: progressData, error: progressError } = await supabase
        .from('user_flashcard_progress')
        .select('*')
        .eq('flashcard_id', flashcardId)
        .eq('user_id', userId);
      
      // Calculate the new spaced repetition values using the SM-2 algorithm
      let easeFactor = 2.5;
      let interval = 0;
      let repetition = 0;
      
      if (!progressError && progressData && progressData.length > 0) {
        const progress = progressData[0];
        easeFactor = progress.ease_factor;
        interval = progress.interval;
        repetition = progress.repetition;
      }
      
      // SM-2 algorithm implementation
      if (score < 3) {
        // If score is less than 3, reset repetition and interval
        repetition = 0;
        interval = 1;
      } else {
        // Update values based on the algorithm
        repetition += 1;
        
        if (repetition === 1) {
          interval = 1;
        } else if (repetition === 2) {
          interval = 6;
        } else {
          interval = Math.round(interval * easeFactor);
        }
      }
      
      // Update ease factor
      easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - score) * (0.08 + (5 - score) * 0.02)));
      
      // Calculate the next review date
      const now = new Date();
      const nextReviewAt = new Date();
      nextReviewAt.setDate(now.getDate() + interval);
      
      // Upsert the progress data
      const progressPayload = {
        flashcard_id: flashcardId,
        user_id: userId,
        ease_factor: easeFactor,
        interval,
        repetition,
        last_reviewed_at: now.toISOString(),
        next_review_at: nextReviewAt.toISOString(),
        last_score: score,
      };
      
      if (!progressError && progressData && progressData.length > 0) {
        // Update existing progress
        const { error } = await supabase
          .from('user_flashcard_progress')
          .update(progressPayload)
          .eq('id', progressData[0].id);
        
        if (error) throw error;
      } else {
        // Insert new progress
        const { error } = await supabase
          .from('user_flashcard_progress')
          .insert(progressPayload);
        
        if (error) throw error;
      }
      
      // Update the flashcard's last reviewed date
      await supabase
        .from('flashcards')
        .update({
          last_reviewed_at: now.toISOString(),
          next_review_at: nextReviewAt.toISOString(),
        })
        .eq('id', flashcardId);
      
    } catch (error) {
      console.error('Error recording flashcard review:', error);
      toast({
        title: 'Error recording review',
        description: 'Your progress may not have been saved.',
        variant: 'destructive',
      });
    }
  };

  // Get the progress data for a specific flashcard
  const getFlashcardProgress = async (flashcardId: string): Promise<FlashcardProgress | null> => {
    try {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('user_flashcard_progress')
        .select('*')
        .eq('flashcard_id', flashcardId)
        .eq('user_id', userId)
        .single();
      
      if (error || !data) return null;
      
      return data;
    } catch (error) {
      console.error('Error getting flashcard progress:', error);
      return null;
    }
  };

  return {
    recordFlashcardReview,
    getFlashcardProgress
  };
};
