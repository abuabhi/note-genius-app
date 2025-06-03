
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { useQuery } from "@tanstack/react-query";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { useToast } from "@/hooks/use-toast";
import { useStreakCalculation } from "@/hooks/useStreakCalculation";

export interface ProgressStats {
  completedCourses: number;
  totalCourses: number;
  completedQuizzes: number;
  totalQuizzes: number;
  flashcardAccuracy: number;
  streakDays: number;
  totalCardsMastered: number;
  studyTimeHours: number;
  totalSets: number;
  cardsReviewedToday: number;
  totalCardsReviewed: number;
}

export const useProgressStats = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { flashcardSets, loading: flashcardsLoading } = useFlashcards();
  const { streak } = useStreakCalculation();

  const { data: stats = {
    completedCourses: 0,
    totalCourses: 0,
    completedQuizzes: 0,
    totalQuizzes: 0,
    flashcardAccuracy: 0,
    streakDays: streak,
    totalCardsMastered: 0,
    studyTimeHours: 0,
    totalSets: flashcardSets?.length || 0,
    cardsReviewedToday: 0,
    totalCardsReviewed: 0
  }, isLoading: isStatsLoading, error } = useQuery({
    queryKey: ["progressStats", user?.id, streak],
    queryFn: async () => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Get quiz statistics
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('count')
        .not('user_id', 'is', null);

      if (quizError) {
        console.error('Error fetching quizzes count:', quizError);
      }

      const { data: quizResultsData, error: quizResultsError } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', user.id);

      if (quizResultsError) {
        console.error('Error fetching quiz results:', quizResultsError);
      }

      // Get flashcard statistics from spaced repetition progress
      const totalSets = flashcardSets?.length || 0;

      // Get user flashcard progress data for spaced repetition
      const { data: flashcardProgress, error: flashcardProgressError } = await supabase
        .from('user_flashcard_progress')
        .select('*')
        .eq('user_id', user.id);

      if (flashcardProgressError) {
        console.error('Error fetching flashcard progress:', flashcardProgressError);
      }

      // Get today's reviews
      const today = new Date();
      const startOfToday = startOfDay(today).toISOString();
      const endOfToday = endOfDay(today).toISOString();

      const { data: todayReviews, error: todayReviewsError } = await supabase
        .from('user_flashcard_progress')
        .select('*')
        .eq('user_id', user.id)
        .gte('last_reviewed_at', startOfToday)
        .lte('last_reviewed_at', endOfToday);

      if (todayReviewsError) {
        console.error('Error fetching today reviews:', todayReviewsError);
      }

      // Get study session data
      const { data: studySessions, error: studySessionsError } = await supabase
        .from('study_sessions')
        .select('duration')
        .eq('user_id', user.id)
        .not('duration', 'is', null);

      if (studySessionsError) {
        console.error('Error fetching study sessions:', studySessionsError);
      }

      // Calculate flashcard accuracy from spaced repetition scores
      let flashcardAccuracy = 0;
      if (flashcardProgress && flashcardProgress.length > 0) {
        const recentReviews = flashcardProgress.filter(p => p.last_score !== null);
        if (recentReviews.length > 0) {
          const totalScore = recentReviews.reduce((sum, p) => sum + (p.last_score || 0), 0);
          // Calculate as percentage where 5 is 100%, 0 is 0%
          flashcardAccuracy = Math.round((totalScore / (recentReviews.length * 5)) * 100);
        }
      }

      // Calculate total study time in hours
      const totalMinutes = studySessions ? 
        studySessions.reduce((sum, session) => sum + (session.duration || 0), 0) : 0;
      const studyTimeHours = Math.round(totalMinutes / 60 * 10) / 10;

      // Calculate mastered cards (cards with good retention - ease_factor >= 2.5 and interval >= 7)
      const masteredCards = flashcardProgress ? 
        flashcardProgress.filter(p => 
          p.ease_factor && p.ease_factor >= 2.5 && 
          p.interval && p.interval >= 7
        ).length : 0;

      // Count cards reviewed today and total
      const cardsReviewedToday = todayReviews?.length || 0;
      const totalCardsReviewed = flashcardProgress?.length || 0;

      return {
        completedCourses: 0, // Placeholder for future course implementation
        totalCourses: 0,     // Placeholder for future course implementation
        completedQuizzes: quizResultsData?.length || 0,
        totalQuizzes: quizData?.length || 0,
        flashcardAccuracy,
        streakDays: streak,
        totalCardsMastered: masteredCards,
        studyTimeHours,
        totalSets,
        cardsReviewedToday,
        totalCardsReviewed
      };
    },
    enabled: !!user && !flashcardsLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    retry: 2,
    meta: {
      onError: (error) => {
        console.error("Error fetching progress stats:", error);
        toast({
          title: "Error fetching progress data",
          description: "Please try refreshing the page",
          variant: "destructive"
        });
      }
    }
  });

  if (error) {
    console.error("Error from useQuery:", error);
  }

  return { 
    stats, 
    isLoading: isLoading || isStatsLoading || flashcardsLoading,
    error
  };
};
