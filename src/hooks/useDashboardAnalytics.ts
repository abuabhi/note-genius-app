
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

export const useDashboardAnalytics = () => {
  const { user } = useAuth();

  // Get today's activity
  const { data: todaysActivity = { cardsReviewed: 0, studyTime: 0, quizzesTaken: 0 } } = useQuery({
    queryKey: ['todays-activity', user?.id],
    queryFn: async () => {
      if (!user) return { cardsReviewed: 0, studyTime: 0, quizzesTaken: 0 };

      const today = new Date().toISOString().split('T')[0];
      
      try {
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
      } catch (error) {
        console.error('Error fetching today\'s activity:', error);
        return { cardsReviewed: 0, studyTime: 0, quizzesTaken: 0 };
      }
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Weekly comparison
  const { data: weeklyComparison = { thisWeek: 0, lastWeek: 0, trend: 'stable' } } = useQuery({
    queryKey: ['weekly-comparison', user?.id],
    queryFn: async () => {
      if (!user) return { thisWeek: 0, lastWeek: 0, trend: 'stable' };

      try {
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
      } catch (error) {
        console.error('Error fetching weekly comparison:', error);
        return { thisWeek: 0, lastWeek: 0, trend: 'stable' };
      }
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Get basic stats
  const { data: basicStats = { totalSessions: 0, totalStudyTime: 0, totalCardsMastered: 0, flashcardAccuracy: 0, totalSets: 0 } } = useQuery({
    queryKey: ['basic-stats', user?.id],
    queryFn: async () => {
      if (!user) return { totalSessions: 0, totalStudyTime: 0, totalCardsMastered: 0, flashcardAccuracy: 0, totalSets: 0 };

      try {
        // Get flashcard sets count
        const { data: flashcardSets } = await supabase
          .from('flashcard_sets')
          .select('id')
          .eq('user_id', user.id);

        // Get study sessions
        const { data: sessions } = await supabase
          .from('study_sessions')
          .select('duration')
          .eq('user_id', user.id)
          .not('duration', 'is', null);

        // Get flashcard progress
        const { data: progress } = await supabase
          .from('user_flashcard_progress')
          .select('last_score, ease_factor, interval')
          .eq('user_id', user.id);

        const totalSessions = sessions?.length || 0;
        const totalStudyTimeMinutes = sessions?.reduce((sum, session) => sum + (session.duration || 0), 0) || 0;
        const totalStudyTime = Math.round(totalStudyTimeMinutes / 60 * 10) / 10;
        
        // Calculate cards mastered
        const totalCardsMastered = progress?.filter(p => 
          p.ease_factor && p.ease_factor >= 2.5 && 
          p.interval && p.interval >= 7
        ).length || 0;

        // Calculate flashcard accuracy
        let flashcardAccuracy = 0;
        if (progress && progress.length > 0) {
          const totalScore = progress.reduce((sum, p) => sum + (p.last_score || 0), 0);
          flashcardAccuracy = Math.round((totalScore / (progress.length * 5)) * 100);
        }

        return {
          totalSessions,
          totalStudyTime,
          totalCardsMastered,
          flashcardAccuracy,
          totalSets: flashcardSets?.length || 0
        };
      } catch (error) {
        console.error('Error fetching basic stats:', error);
        return { totalSessions: 0, totalStudyTime: 0, totalCardsMastered: 0, flashcardAccuracy: 0, totalSets: 0 };
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get current streak
  const { data: currentStreak = 0 } = useQuery({
    queryKey: ['current-streak', user?.id],
    queryFn: async () => {
      if (!user) return 0;

      try {
        // Simple streak calculation - can be enhanced later
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        const { data: todayActivity } = await supabase
          .from('user_flashcard_progress')
          .select('id')
          .eq('user_id', user.id)
          .gte('last_reviewed_at', `${today}T00:00:00Z`)
          .limit(1);

        const { data: yesterdayActivity } = await supabase
          .from('user_flashcard_progress')
          .select('id')
          .eq('user_id', user.id)
          .gte('last_reviewed_at', `${yesterday}T00:00:00Z`)
          .lt('last_reviewed_at', `${today}T00:00:00Z`)
          .limit(1);

        if (todayActivity && todayActivity.length > 0) {
          return yesterdayActivity && yesterdayActivity.length > 0 ? 2 : 1;
        }
        return 0;
      } catch (error) {
        console.error('Error calculating streak:', error);
        return 0;
      }
    },
    enabled: !!user,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  return {
    // Basic stats
    totalSessions: basicStats.totalSessions,
    totalStudyTime: basicStats.totalStudyTime,
    totalCardsMastered: basicStats.totalCardsMastered,
    flashcardAccuracy: basicStats.flashcardAccuracy,
    totalSets: basicStats.totalSets,
    
    // Today's activity
    todaysActivity,
    
    // Streak data
    currentStreak,
    
    // Weekly trends
    weeklyComparison,
    
    // Loading state
    isLoading: false
  };
};
