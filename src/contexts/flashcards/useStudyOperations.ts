
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Flashcard } from "@/types/flashcard";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import { useAchievements } from "@/hooks/useAchievements";

interface StudyOperations {
  markAsCorrect: (flashcardId: string) => Promise<void>;
  markAsIncorrect: (flashcardId: string) => Promise<void>;
  resetFlashcard: (flashcardId: string) => Promise<void>;
}

export const useStudyOperations = (): StudyOperations => {
  const { user } = useAuth();
  const { checkAndAwardAchievements } = useAchievements();

  const markAsCorrect = useCallback(async (flashcardId: string) => {
    if (!user) {
      toast.error("You must be logged in to track progress.");
      return;
    }

    try {
      // Update spaced repetition progress
      const { data, error } = await supabase
        .from('user_flashcard_progress')
        .upsert(
          { 
            user_id: user.id, 
            flashcard_id: flashcardId, 
            last_score: 5, // Perfect score
            last_reviewed_at: new Date().toISOString(),
            ease_factor: 2.6, // Good retention
            interval: 1,
            repetition: 1
          },
          { onConflict: 'user_id, flashcard_id', ignoreDuplicates: false }
        )
        .select();

      if (error) {
        console.error("Error marking as correct:", error);
        toast.error("Failed to update progress. Please try again.");
        return;
      }

      // Also update learning progress
      await supabase
        .from('learning_progress')
        .upsert({
          user_id: user.id,
          flashcard_id: flashcardId,
          times_seen: 1, // Will be incremented by trigger if exists
          times_correct: 1, // Will be incremented by trigger if exists
          last_seen_at: new Date().toISOString(),
        }, { onConflict: 'user_id,flashcard_id' });

      toast.success("Flashcard marked as correct!");
      // Check for new achievements after successful review
      await checkAndAwardAchievements();
    } catch (error: any) {
      console.error("Unexpected error marking as correct:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  }, [user, checkAndAwardAchievements]);

  const markAsIncorrect = useCallback(async (flashcardId: string) => {
    if (!user) {
      toast.error("You must be logged in to track progress.");
      return;
    }

    try {
      // Update spaced repetition progress
      const { data, error } = await supabase
        .from('user_flashcard_progress')
        .upsert(
          { 
            user_id: user.id, 
            flashcard_id: flashcardId, 
            last_score: 1, // Low score for incorrect
            last_reviewed_at: new Date().toISOString(),
            ease_factor: 1.8, // Lower retention
            interval: 0,
            repetition: 0
          },
          { onConflict: 'user_id, flashcard_id', ignoreDuplicates: false }
        )
        .select();

      if (error) {
        console.error("Error marking as incorrect:", error);
        toast.error("Failed to update progress. Please try again.");
        return;
      }

      // Also update learning progress
      await supabase
        .from('learning_progress')
        .upsert({
          user_id: user.id,
          flashcard_id: flashcardId,
          times_seen: 1, // Will be incremented by trigger if exists
          times_correct: 0, // No increment for incorrect
          last_seen_at: new Date().toISOString(),
        }, { onConflict: 'user_id,flashcard_id' });

      toast.warning("Flashcard marked as incorrect. Review again soon!");
      // Still check for achievements (might unlock "effort" based achievements)
      await checkAndAwardAchievements();
    } catch (error: any) {
      console.error("Unexpected error marking as incorrect:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  }, [user, checkAndAwardAchievements]);

  const resetFlashcard = useCallback(async (flashcardId: string) => {
    if (!user) {
      toast.error("You must be logged in to reset progress.");
      return;
    }

    try {
      // Reset spaced repetition progress
      const { error: srpError } = await supabase
        .from('user_flashcard_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('flashcard_id', flashcardId);

      if (srpError) {
        console.error("Error resetting spaced repetition:", srpError);
      }

      // Reset learning progress
      const { error: lpError } = await supabase
        .from('learning_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('flashcard_id', flashcardId);

      if (lpError) {
        console.error("Error resetting learning progress:", lpError);
      }

      if (!srpError && !lpError) {
        toast.success("Flashcard progress reset successfully!");
      } else {
        toast.error("Failed to reset flashcard. Please try again.");
      }
    } catch (error: any) {
      console.error("Unexpected error resetting flashcard:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  }, [user]);

  return {
    markAsCorrect,
    markAsIncorrect,
    resetFlashcard,
  };
};
