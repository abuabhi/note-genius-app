
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

interface FlashcardSetProgress {
  setId: string;
  totalCards: number;
  masteredCards: number;
  needsPracticeCards: number;
  masteredPercentage: number;
}

export const useFlashcardSetProgress = (flashcardSets: any[] = []) => {
  const { user } = useAuth();

  const { data: progressData = {}, isLoading } = useQuery({
    queryKey: ['flashcard-set-progress', user?.id, flashcardSets.map(s => s.id)],
    queryFn: async () => {
      if (!user || flashcardSets.length === 0) return {};

      const progressMap: Record<string, FlashcardSetProgress> = {};

      for (const set of flashcardSets) {
        // Get all flashcards in this set
        const { data: setCards } = await supabase
          .from('flashcard_set_cards')
          .select('flashcard_id')
          .eq('set_id', set.id);

        const flashcardIds = setCards?.map(card => card.flashcard_id) || [];
        const totalCards = flashcardIds.length;

        if (totalCards === 0) {
          progressMap[set.id] = {
            setId: set.id,
            totalCards: 0,
            masteredCards: 0,
            needsPracticeCards: 0,
            masteredPercentage: 0
          };
          continue;
        }

        // Get progress for these flashcards
        const { data: progressRecords } = await supabase
          .from('learning_progress')
          .select('flashcard_id, is_known, confidence_level, times_correct, times_seen')
          .eq('user_id', user.id)
          .in('flashcard_id', flashcardIds);

        // Calculate mastered cards (high confidence or marked as known)
        let masteredCards = 0;
        const progressById = new Map(progressRecords?.map(p => [p.flashcard_id, p]) || []);

        flashcardIds.forEach(cardId => {
          const progress = progressById.get(cardId);
          if (progress) {
            // Consider mastered if: marked as known OR high confidence (4-5) OR high accuracy (>80%)
            const isKnown = progress.is_known;
            const highConfidence = progress.confidence_level >= 4;
            const highAccuracy = progress.times_seen > 0 && (progress.times_correct / progress.times_seen) > 0.8;
            
            if (isKnown || highConfidence || (progress.times_seen >= 3 && highAccuracy)) {
              masteredCards++;
            }
          }
        });

        const needsPracticeCards = totalCards - masteredCards;
        const masteredPercentage = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;

        progressMap[set.id] = {
          setId: set.id,
          totalCards,
          masteredCards,
          needsPracticeCards,
          masteredPercentage
        };
      }

      return progressMap;
    },
    enabled: !!user && flashcardSets.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    progressData,
    isLoading,
    getSetProgress: (setId: string): FlashcardSetProgress => {
      return progressData[setId] || {
        setId,
        totalCards: 0,
        masteredCards: 0,
        needsPracticeCards: 0,
        masteredPercentage: 0
      };
    }
  };
};
