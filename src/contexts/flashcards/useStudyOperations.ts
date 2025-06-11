
import { useCallback } from 'react';
import { FlashcardState } from './types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook that provides study-related operations for flashcards
 */
export const useStudyOperations = (state: FlashcardState) => {
  
  const recordFlashcardReview = useCallback(async (flashcardId: string, quality: number): Promise<void> => {
    const { user } = state;
    
    if (!user) {
      console.error('User not authenticated');
      return;
    }
    
    try {
      // First, get existing progress
      const { data: existingProgress, error: fetchError } = await supabase
        .from('user_flashcard_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('flashcard_id', flashcardId)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      const now = new Date().toISOString();
      let nextReviewAt = new Date();
      let interval = 1;
      let repetition = 0;
      let easeFactor = 2.5;
      
      if (existingProgress) {
        // Update existing progress using SM-2 algorithm
        repetition = existingProgress.repetition;
        easeFactor = existingProgress.ease_factor;
        interval = existingProgress.interval;
        
        if (quality >= 3) {
          if (repetition === 0) {
            interval = 1;
          } else if (repetition === 1) {
            interval = 6;
          } else {
            interval = Math.round(interval * easeFactor);
          }
          repetition += 1;
        } else {
          repetition = 0;
          interval = 1;
        }
        
        easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (easeFactor < 1.3) easeFactor = 1.3;
        
        nextReviewAt.setDate(nextReviewAt.getDate() + interval);
        
        const { error: updateError } = await supabase
          .from('user_flashcard_progress')
          .update({
            last_reviewed_at: now,
            next_review_at: nextReviewAt.toISOString(),
            repetition,
            interval,
            ease_factor: easeFactor,
            last_score: quality,
            updated_at: now
          })
          .eq('id', existingProgress.id);
          
        if (updateError) throw updateError;
      } else {
        // Create new progress record
        nextReviewAt.setDate(nextReviewAt.getDate() + 1);
        
        const { error: insertError } = await supabase
          .from('user_flashcard_progress')
          .insert({
            user_id: user.id,
            flashcard_id: flashcardId,
            last_reviewed_at: now,
            next_review_at: nextReviewAt.toISOString(),
            repetition: quality >= 3 ? 1 : 0,
            interval: 1,
            ease_factor: easeFactor,
            last_score: quality
          });
          
        if (insertError) throw insertError;
      }
      
      console.log('Flashcard review recorded successfully');
    } catch (error) {
      console.error('Error recording flashcard review:', error);
      toast.error('Failed to record review progress');
    }
  }, [state]);
  
  const getFlashcardProgress = useCallback(async (flashcardId: string) => {
    const { user } = state;
    
    if (!user) {
      console.error('User not authenticated');
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('user_flashcard_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('flashcard_id', flashcardId)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching flashcard progress:', error);
      return null;
    }
  }, [state]);

  return {
    recordFlashcardReview,
    getFlashcardProgress
  };
};
