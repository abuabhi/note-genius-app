import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Flashcard } from "@/types/flashcard";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth"; // Updated import path

interface StudyOperations {
  markAsCorrect: (flashcardId: string) => Promise<void>;
  markAsIncorrect: (flashcardId: string) => Promise<void>;
  resetFlashcard: (flashcardId: string) => Promise<void>;
}

export const useStudyOperations = (): StudyOperations => {
  const { user } = useAuth();

  const markAsCorrect = useCallback(async (flashcardId: string) => {
    if (!user) {
      toast.error("You must be logged in to track progress.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_flashcard_progress')
        .upsert(
          { 
            user_id: user.id, 
            flashcard_id: flashcardId, 
            correct_count: 1,
            incorrect_count: 0,
            last_reviewed_at: new Date().toISOString()
          },
          { onConflict: 'user_id, flashcard_id', ignoreDuplicates: false }
        )
        .select();

      if (error) {
        console.error("Error marking as correct:", error);
        toast.error("Failed to update progress. Please try again.");
      } else {
        toast.success("Flashcard marked as correct!");
      }
    } catch (error: any) {
      console.error("Unexpected error marking as correct:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  }, [user]);

  const markAsIncorrect = useCallback(async (flashcardId: string) => {
    if (!user) {
      toast.error("You must be logged in to track progress.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_flashcard_progress')
        .upsert(
          { 
            user_id: user.id, 
            flashcard_id: flashcardId, 
            correct_count: 0,
            incorrect_count: 1,
            last_reviewed_at: new Date().toISOString()
          },
          { onConflict: 'user_id, flashcard_id', ignoreDuplicates: false }
        )
        .select();

      if (error) {
        console.error("Error marking as incorrect:", error);
        toast.error("Failed to update progress. Please try again.");
      } else {
        toast.warning("Flashcard marked as incorrect. Review again soon!");
      }
    } catch (error: any) {
      console.error("Unexpected error marking as incorrect:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  }, [user]);

  const resetFlashcard = useCallback(async (flashcardId: string) => {
    if (!user) {
      toast.error("You must be logged in to reset progress.");
      return;
    }

    try {
      const { error } = await supabase
        .from('user_flashcard_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('flashcard_id', flashcardId);

      if (error) {
        console.error("Error resetting flashcard:", error);
        toast.error("Failed to reset flashcard. Please try again.");
      } else {
        toast.success("Flashcard progress reset successfully!");
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
