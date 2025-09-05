import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export const useFlashcardStudy = (flashcardId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query for flashcard progress
  const {
    data: progress,
    isLoading: isLoadingProgress,
  } = useQuery({
    queryKey: ['flashcardProgress', flashcardId, user?.id],
    queryFn: async () => {
      if (!user || !flashcardId) return null;
      
      const { data, error } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('flashcard_id', flashcardId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" errors
      return data || null;
    },
    enabled: !!user && !!flashcardId,
    staleTime: 1 * 60 * 1000, // 1 minute - progress changes frequently during study
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query for user's overall study statistics
  const {
    data: studyStats,
    isLoading: isLoadingStats,
  } = useQuery({
    queryKey: ['studyStats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('learning_progress')
        .select('flashcard_id, confidence_level, is_known, times_seen')
        .eq('user_id', user.id);

      if (error) throw error;

      // Calculate statistics
      const totalCards = data.length;
      const knownCards = data.filter(p => p.is_known).length;
      const averageConfidence = totalCards > 0 
        ? data.reduce((sum, p) => sum + p.confidence_level, 0) / totalCards 
        : 0;

      return {
        totalCards,
        knownCards,
        averageConfidence: Math.round(averageConfidence * 100) / 100,
        masteryPercentage: totalCards > 0 ? Math.round((knownCards / totalCards) * 100) : 0,
      };
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Record flashcard review mutation
  const recordReviewMutation = useMutation({
    mutationFn: async ({ 
      flashcardId, 
      quality, 
      isCorrect 
    }: { 
      flashcardId: string; 
      quality: number; 
      isCorrect?: boolean 
    }) => {
      if (!user) throw new Error('User not authenticated');

      const reviewData = {
        flashcard_id: flashcardId,
        user_id: user.id,
        confidence_level: quality,
        is_known: isCorrect !== undefined ? isCorrect : quality >= 4,
        last_seen_at: new Date().toISOString(),
        times_seen: (progress?.times_seen || 0) + 1,
        times_correct: (progress?.times_correct || 0) + (isCorrect ? 1 : 0),
        is_difficult: quality < 3,
      };

      const { data, error } = await supabase
        .from('learning_progress')
        .upsert(reviewData, { 
          onConflict: 'flashcard_id,user_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate progress queries
      queryClient.invalidateQueries({ queryKey: ['flashcardProgress', flashcardId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['studyStats', user?.id] });
    },
    onError: (error) => {
      console.error('Error recording flashcard review:', error);
      toast.error('Failed to save review progress');
    },
  });

  return {
    // Data
    progress,
    studyStats,
    
    // Loading states
    isLoadingProgress,
    isLoadingStats,
    isRecordingReview: recordReviewMutation.isPending,
    
    // Mutations
    recordFlashcardReview: (quality: number, isCorrect?: boolean) => {
      if (!flashcardId) throw new Error('No flashcard ID provided');
      return recordReviewMutation.mutate({ flashcardId, quality, isCorrect });
    },
    recordStudySession: () => {
      console.log('recordStudySession not implemented in this version');
    },
    
    // Computed values
    isKnown: progress?.is_known || false,
    confidenceLevel: progress?.confidence_level || 0,
    reviewCount: progress?.times_seen || 0,
    lastReviewDate: progress?.last_seen_at,
    isDueForReview: progress?.is_difficult || false,
    dueCards: [],
  };
};