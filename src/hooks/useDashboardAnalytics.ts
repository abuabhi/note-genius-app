
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useUnifiedStudyStats } from "./useUnifiedStudyStats";
import { useProgressStats } from "./useProgressStats";
import { useStreakCalculation } from "./useStreakCalculation";

export const useDashboardAnalytics = () => {
  const { user } = useAuth();
  const { stats: unifiedStats, isLoading: unifiedLoading } = useUnifiedStudyStats();
  const { stats: progressStats, isLoading: progressLoading } = useProgressStats();
  const { streak, loading: streakLoading } = useStreakCalculation();

  // Get today's activity
  const { data: todaysActivity = { cardsReviewed: 0, studyTime: 0, quizzesTaken: 0 } } = useQuery({
    queryKey: ['todays-activity', user?.id],
    queryFn: async () => {
      if (!user) return { cardsReviewed: 0, studyTime: 0, quizzesTaken: 0 };

      const today = new Date().toISOString().split('T')[0];
      
      // Today's flashcard reviews
      const { data: todayReviews } = await supabase
        .from('user_flashcard_progress')
        .select('id')
        .eq('user_id', user.id)
        .gte('last_reviewed_at', `${today}T00:00:00Z`)
        .lt('last_reviewed_at', `${today}T23:59:59Z`);

      // Today's study sessions
      const { data: todaySessions } = await supabase
        .from('study_sessions')
        .select('duration')
        .eq('user_id', user.id)
        .gte('start_time', `${today}T00:00:00Z`)
        .lt('start_time', `${today}T23:59:59Z`)
        .not('duration', 'is', null);

      // Today's quiz results
      const { data: todayQuizzes } = await supabase
        .from('quiz_results')
        .select('id')
        .eq('user_id', user.id)
        .gte('completed_at', `${today}T00:00:00Z`)
        .lt('completed_at', `${today}T23:59:59Z`);

      const studyTime = todaySessions?.reduce((sum, session) => sum + (session.duration || 0), 0) || 0;

      return {
        cardsReviewed: todayReviews?.length || 0,
        studyTime: Math.round(studyTime / 60), // Convert to minutes
        quizzesTaken: todayQuizzes?.length || 0
      };
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Weekly comparison
  const { data: weeklyComparison = { thisWeek: 0, lastWeek: 0, trend: 'stable' } } = useQuery({
    queryKey: ['weekly-comparison', user?.id],
    queryFn: async () => {
      if (!user) return { thisWeek: 0, lastWeek: 0, trend: 'stable' };

      const today = new Date();
      const startOfThisWeek = new Date(today.setDate(today.getDate() - today.getDay()));
      const startOfLastWeek = new Date(startOfThisWeek);
      startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

      const [thisWeekData, lastWeekData] = await Promise.all([
        supabase
          .from('study_sessions')
          .select('duration')
          .eq('user_id', user.id)
          .gte('start_time', startOfThisWeek.toISOString())
          .not('duration', 'is', null),
        supabase
          .from('study_sessions')
          .select('duration')
          .eq('user_id', user.id)
          .gte('start_time', startOfLastWeek.toISOString())
          .lt('start_time', startOfThisWeek.toISOString())
          .not('duration', 'is', null)
      ]);

      const thisWeek = (thisWeekData.data?.reduce((sum, s) => sum + (s.duration || 0), 0) || 0) / 60;
      const lastWeek = (lastWeekData.data?.reduce((sum, s) => sum + (s.duration || 0), 0) || 0) / 60;
      
      let trend = 'stable';
      if (thisWeek > lastWeek * 1.1) trend = 'up';
      else if (thisWeek < lastWeek * 0.9) trend = 'down';

      return { thisWeek: Math.round(thisWeek), lastWeek: Math.round(lastWeek), trend };
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const isLoading = unifiedLoading || progressLoading || streakLoading;

  return {
    // Unified stats
    totalSessions: unifiedStats.totalSessions,
    totalStudyTime: unifiedStats.studyTimeHours,
    totalCardsMastered: unifiedStats.totalCardsMastered,
    flashcardAccuracy: progressStats.flashcardAccuracy,
    totalSets: unifiedStats.totalSets,
    
    // Today's activity
    todaysActivity,
    
    // Streak data
    currentStreak: streak,
    
    // Weekly trends
    weeklyComparison,
    
    // Overall progress
    progressStats,
    
    isLoading
  };
};
