import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth"; // Updated import path
import { addDays, format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { useToast } from "@/hooks/use-toast";

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
}

export const useProgressStats = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { flashcardSets, loading: flashcardsLoading } = useFlashcards();

  const { data: stats = {
    completedCourses: 0,
    totalCourses: 0,
    completedQuizzes: 0,
    totalQuizzes: 0,
    flashcardAccuracy: 0,
    streakDays: 0,
    totalCardsMastered: 0,
    studyTimeHours: 0,
    totalSets: flashcardSets?.length || 0
  }, isLoading: isStatsLoading, error } = useQuery({
    queryKey: ["progressStats", user?.id],
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

      // Get flashcard statistics
      const totalSets = flashcardSets?.length || 0;

      // Get user flashcard progress data
      const { data: flashcardProgress, error: flashcardProgressError } = await supabase
        .from('user_flashcard_progress')
        .select('*')
        .eq('user_id', user.id);

      if (flashcardProgressError) {
        console.error('Error fetching flashcard progress:', flashcardProgressError);
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
      
      // Calculate streak days
      let streakDays = 0;
      if (flashcardProgress && flashcardProgress.length > 0) {
        // Sort by last reviewed date descending
        const sortedProgress = [...flashcardProgress]
          .filter(p => p.last_reviewed_at)
          .sort((a, b) => new Date(b.last_reviewed_at).getTime() - new Date(a.last_reviewed_at).getTime());
        
        if (sortedProgress.length > 0) {
          // Check if studied today or yesterday
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const latestDate = new Date(sortedProgress[0].last_reviewed_at);
          latestDate.setHours(0, 0, 0, 0);
          
          if (latestDate.getTime() === today.getTime() || 
              latestDate.getTime() === subDays(today, 1).getTime()) {
            
            streakDays = 1;
            let currentDate = latestDate;
            
            // Count consecutive days going backwards
            for (let i = 1; i < sortedProgress.length; i++) {
              const prevDate = new Date(sortedProgress[i].last_reviewed_at);
              prevDate.setHours(0, 0, 0, 0);
              
              // If it's the previous day, increment streak
              if (prevDate.getTime() === subDays(currentDate, 1).getTime()) {
                streakDays++;
                currentDate = prevDate;
              } else if (prevDate.getTime() === currentDate.getTime()) {
                // Same day, just continue
                continue;
              } else {
                // Streak broken
                break;
              }
            }
          }
        }
      }

      // Calculate flashcard accuracy
      let flashcardAccuracy = 0;
      if (flashcardProgress && flashcardProgress.length > 0) {
        const recentReviews = flashcardProgress.filter(p => p.last_score);
        if (recentReviews.length > 0) {
          const totalScore = recentReviews.reduce((sum, p) => sum + (p.last_score || 0), 0);
          // Calculate as percentage where 5 is 100%, 0 is 0%
          flashcardAccuracy = Math.round((totalScore / (recentReviews.length * 5)) * 100);
        }
      }

      // Calculate total study time in hours
      const totalMinutes = studySessions ? 
        studySessions.reduce((sum, session) => sum + (session.duration || 0), 0) / 60 : 0;
      const studyTimeHours = Math.round(totalMinutes / 60 * 10) / 10;

      // Calculate mastered cards (cards with good retention)
      const masteredCards = flashcardProgress ? 
        flashcardProgress.filter(p => p.ease_factor >= 2.5).length : 0;

      return {
        completedCourses: 0, // Placeholder for future course implementation
        totalCourses: 0,     // Placeholder for future course implementation
        completedQuizzes: quizResultsData?.length || 0,
        totalQuizzes: quizData?.length || 0,
        flashcardAccuracy,
        streakDays,
        totalCardsMastered: masteredCards,
        studyTimeHours,
        totalSets
      };
    },
    enabled: !!user && !flashcardsLoading,
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    retry: 2, // Retry failed requests twice before giving up
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
