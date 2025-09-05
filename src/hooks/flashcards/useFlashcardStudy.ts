import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

interface FlashcardProgress {
  id: string;
  flashcard_id: string;
  user_id: string;
  confidence_level: number;
  is_known: boolean;
  last_reviewed: string;
  next_review_date: string;
  review_count: number;
  created_at: string;
  updated_at: string;
}

interface StudySessionData {
  setId: string;
  duration: number;
  cardsReviewed: number;
  correctAnswers: number;
  sessionType: 'study' | 'quiz' | 'review';
}

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
      return data as FlashcardProgress | null;
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
        .select(`
          flashcard_id,
          confidence_level,
          is_known,
          review_count,
          last_reviewed
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Calculate statistics
      const totalCards = data.length;
      const knownCards = data.filter(p => p.is_known).length;
      const averageConfidence = totalCards > 0 
        ? data.reduce((sum, p) => sum + p.confidence_level, 0) / totalCards 
        : 0;
      const totalReviews = data.reduce((sum, p) => sum + p.review_count, 0);
      const cardsReviewedToday = data.filter(p => {
        const reviewDate = new Date(p.last_reviewed);
        const today = new Date();
        return reviewDate.toDateString() === today.toDateString();
      }).length;

      return {
        totalCards,
        knownCards,
        averageConfidence: Math.round(averageConfidence * 100) / 100,
        totalReviews,
        cardsReviewedToday,
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

      // Calculate next review date based on spaced repetition algorithm
      const now = new Date();
      let interval = 1; // Default to 1 day

      if (progress) {
        const baseInterval = Math.max(1, progress.review_count + 1);
        const qualityFactor = Math.max(0.1, quality / 5); // Normalize quality to 0-1
        interval = Math.ceil(baseInterval * qualityFactor * (1 + Math.random() * 0.1));
      }

      const nextReviewDate = new Date(now);
      nextReviewDate.setDate(nextReviewDate.getDate() + interval);

      const reviewData = {
        flashcard_id: flashcardId,
        user_id: user.id,
        confidence_level: quality,
        is_known: isCorrect !== undefined ? isCorrect : quality >= 4,
        last_reviewed: now.toISOString(),
        next_review_date: nextReviewDate.toISOString(),
        review_count: (progress?.review_count || 0) + 1,
      };

      const { data, error } = await supabase
        .from('learning_progress')
        .upsert(reviewData, { 
          onConflict: 'flashcard_id,user_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data as FlashcardProgress;
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

  // Record study session mutation
  const recordStudySessionMutation = useMutation({
    mutationFn: async (sessionData: StudySessionData) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('study_sessions')
        .insert({
          user_id: user.id,
          flashcard_set_id: sessionData.setId,
          duration_minutes: Math.round(sessionData.duration / 60),
          cards_reviewed: sessionData.cardsReviewed,
          correct_answers: sessionData.correctAnswers,
          session_type: sessionData.sessionType,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studyStats', user?.id] });
      toast.success('Study session recorded');
    },
    onError: (error) => {
      console.error('Error recording study session:', error);
      toast.error('Failed to save study session');
    },
  });

  // Get cards due for review
  const {
    data: dueCards = [],
    isLoading: isLoadingDueCards,
  } = useQuery({
    queryKey: ['dueCards', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('learning_progress')
        .select(`
          flashcard_id,
          next_review_date,
          confidence_level,
          flashcard:flashcards (
            id,
            front_content,
            back_content
          )
        `)
        .eq('user_id', user.id)
        .lte('next_review_date', now)
        .order('next_review_date', { ascending: true })
        .limit(50); // Limit to prevent overwhelming users

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    // Data
    progress,
    studyStats,
    dueCards,
    
    // Loading states
    isLoadingProgress,
    isLoadingStats,
    isLoadingDueCards,
    isRecordingReview: recordReviewMutation.isPending,
    isRecordingSession: recordStudySessionMutation.isPending,
    
    // Mutations
    recordFlashcardReview: (quality: number, isCorrect?: boolean) => {
      if (!flashcardId) throw new Error('No flashcard ID provided');
      return recordReviewMutation.mutate({ flashcardId, quality, isCorrect });
    },
    recordStudySession: recordStudySessionMutation.mutate,
    
    // Computed values
    isKnown: progress?.is_known || false,
    confidenceLevel: progress?.confidence_level || 0,
    reviewCount: progress?.review_count || 0,
    nextReviewDate: progress?.next_review_date,
    isDueForReview: progress && progress.next_review_date 
      ? new Date(progress.next_review_date) <= new Date()
      : false,
  };
};