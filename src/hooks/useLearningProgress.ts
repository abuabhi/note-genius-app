
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

export interface LearningProgress {
  id: string;
  user_id: string;
  flashcard_id: string;
  confidence_level: number;
  times_seen: number;
  times_correct: number;
  is_known: boolean;
  is_difficult: boolean;
  first_seen_at: string;
  last_seen_at: string;
}

export const useLearningProgress = () => {
  const { user } = useAuth();
  const [progressMap, setProgressMap] = useState<Map<string, LearningProgress>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  const fetchLearningProgress = useCallback(async (flashcardIds: string[]) => {
    if (!user || flashcardIds.length === 0) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', user.id)
        .in('flashcard_id', flashcardIds);

      if (error) throw error;

      const progressMap = new Map<string, LearningProgress>();
      data?.forEach(progress => {
        progressMap.set(progress.flashcard_id, progress);
      });
      setProgressMap(progressMap);
    } catch (error) {
      console.error('Error fetching learning progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateLearningProgress = useCallback(async (
    flashcardId: string,
    isCorrect: boolean,
    confidenceLevel?: number
  ) => {
    if (!user) return;

    try {
      const existingProgress = progressMap.get(flashcardId);
      
      const updateData = {
        user_id: user.id,
        flashcard_id: flashcardId,
        times_seen: (existingProgress?.times_seen || 0) + 1,
        times_correct: (existingProgress?.times_correct || 0) + (isCorrect ? 1 : 0),
        confidence_level: confidenceLevel || existingProgress?.confidence_level || 1,
        last_seen_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('learning_progress')
        .upsert(updateData, { onConflict: 'user_id,flashcard_id' })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setProgressMap(prev => new Map(prev.set(flashcardId, data)));
    } catch (error) {
      console.error('Error updating learning progress:', error);
      toast.error('Failed to update learning progress');
    }
  }, [user, progressMap]);

  const markAsKnown = useCallback(async (flashcardId: string, isKnown: boolean) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('learning_progress')
        .upsert({
          user_id: user.id,
          flashcard_id: flashcardId,
          is_known: isKnown,
          last_seen_at: new Date().toISOString(),
        }, { onConflict: 'user_id,flashcard_id' })
        .select()
        .single();

      if (error) throw error;

      setProgressMap(prev => new Map(prev.set(flashcardId, data)));
      toast.success(isKnown ? 'Marked as known' : 'Unmarked as known');
    } catch (error) {
      console.error('Error marking card:', error);
      toast.error('Failed to update card status');
    }
  }, [user]);

  const markAsDifficult = useCallback(async (flashcardId: string, isDifficult: boolean) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('learning_progress')
        .upsert({
          user_id: user.id,
          flashcard_id: flashcardId,
          is_difficult: isDifficult,
          last_seen_at: new Date().toISOString(),
        }, { onConflict: 'user_id,flashcard_id' })
        .select()
        .single();

      if (error) throw error;

      setProgressMap(prev => new Map(prev.set(flashcardId, data)));
      toast.success(isDifficult ? 'Marked as difficult' : 'Unmarked as difficult');
    } catch (error) {
      console.error('Error marking card:', error);
      toast.error('Failed to update card status');
    }
  }, [user]);

  const getCardProgress = useCallback((flashcardId: string): LearningProgress | null => {
    return progressMap.get(flashcardId) || null;
  }, [progressMap]);

  return {
    progressMap,
    isLoading,
    fetchLearningProgress,
    updateLearningProgress,
    markAsKnown,
    markAsDifficult,
    getCardProgress,
  };
};
