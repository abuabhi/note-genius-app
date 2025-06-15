import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useUltraSimpleAnalytics = () => {
  const { user } = useAuth();

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['ultra-simple-analytics', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      console.log('🚀 Fetching ultra-simple analytics for user:', user.id);

      try {
        // Get basic counts with simple COUNT(*) queries
        const [sessionsCount, setsCount, notesCount, quizzesCount] = await Promise.all([
          // Total sessions count
          supabase
            .from('study_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id),
          
          // Flashcard sets count
          supabase
            .from('flashcard_sets')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id),
          
          // Notes count
          supabase
            .from('notes')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id),
          
          // Quizzes count
          supabase
            .from('quizzes')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
        ]);

        console.log('📊 Count results:', { 
          sessions: sessionsCount.count, 
          sets: setsCount.count, 
          notes: notesCount.count, 
          quizzes: quizzesCount.count 
        });

        // Check for errors
        if (sessionsCount.error) throw sessionsCount.error;
        if (setsCount.error) throw setsCount.error;
        if (notesCount.error) throw notesCount.error;
        if (quizzesCount.error) throw quizzesCount.error;

        // Get actual session data for calculations
        const { data: sessions, error: sessionsError } = await supabase
          .from('study_sessions')
          .select('duration, cards_reviewed, cards_correct, start_time')
          .eq('user_id', user.id)
          .not('duration', 'is', null);

        if (sessionsError) throw sessionsError;

        console.log('📊 Sessions data:', { sessionCount: sessions?.length || 0 });

        // Calculate totals from actual data
        const totalSessions = sessionsCount.count || 0;
        const completedSessions = sessions || [];
        
        const totalStudyTimeMinutes = completedSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
        const totalCardsReviewed = completedSessions.reduce((acc, s) => acc + (s.cards_reviewed || 0), 0);
        const totalCardsCorrect = completedSessions.reduce((acc, s) => acc + (s.cards_correct || 0), 0);

        // Get today's data with simple date filter
        const today = new Date().toISOString().split('T')[0];
        const { data: todayData, error: todayError } = await supabase
          .from('study_sessions')
          .select('duration')
          .eq('user_id', user.id)
          .gte('start_time', `${today}T00:00:00.000Z`)
          .lt('start_time', `${today}T23:59:59.999Z`);

        if (todayError) console.warn('Today data error:', todayError);

        const todayStudyTimeMinutes = (todayData || []).reduce((acc, s) => acc + (s.duration || 0), 0);
        const todaySessions = todayData?.length || 0;

        // Calculate basic metrics
        const totalStudyTime = Math.round((totalStudyTimeMinutes / 60) * 10) / 10;
        const todayStudyTime = Math.round((todayStudyTimeMinutes / 60) * 10) / 10;
        const flashcardAccuracy = totalCardsReviewed > 0 ? Math.round((totalCardsCorrect / totalCardsReviewed) * 100) : 0;

        // Weekly goal defaults
        const weeklyGoalMinutes = 600; // 10 hours
        const weeklyStudyTimeMinutes = Math.min(totalStudyTimeMinutes, weeklyGoalMinutes); // Simplified
        const weeklyGoalProgress = Math.min(Math.round((weeklyStudyTimeMinutes / weeklyGoalMinutes) * 100), 100);

        const result = {
          // Session metrics
          totalSessions,
          todaySessions,
          weeklySessions: Math.min(totalSessions, 7), // Simplified
          averageSessionTime: totalSessions > 0 ? Math.round(totalStudyTimeMinutes / totalSessions) : 0,
          activeSessions: [], // Empty for ultra-simple
          
          // Time metrics
          totalStudyTime,
          totalStudyTimeMinutes,
          todayStudyTime,
          todayStudyTimeMinutes,
          weeklyStudyTime: Math.round((weeklyStudyTimeMinutes / 60) * 10) / 10,
          weeklyStudyTimeMinutes,
          previousWeekTimeMinutes: 0, // Not calculated in ultra-simple
          
          // Goal tracking
          weeklyGoalProgress,
          weeklyGoalMinutes,
          weeklyGoalHours: Math.round((weeklyGoalMinutes / 60) * 10) / 10,
          weeklyChange: 0, // Not calculated in ultra-simple
          
          // Content metrics
          totalQuizzes: quizzesCount.count || 0,
          completedQuizzes: 0, // Simplified
          totalNotes: notesCount.count || 0,
          totalCardsMastered: totalCardsCorrect,
          totalSets: setsCount.count || 0,
          totalCardsReviewed,
          flashcardAccuracy,
          
          // Other
          streakDays: 0, // Simplified - no streak calculation
          recentSessions: [], // Empty for ultra-simple
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          todayString: today
        };

        console.log('✅ Ultra-simple analytics result:', result);
        return result;

      } catch (error) {
        console.error('❌ Ultra-simple analytics error:', error);
        throw error; // Re-throw to show actual error to user
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });

  return {
    analytics: analytics || {
      totalSessions: 0,
      todaySessions: 0,
      weeklySessions: 0,
      averageSessionTime: 0,
      activeSessions: [],
      totalStudyTime: 0,
      totalStudyTimeMinutes: 0,
      todayStudyTime: 0,
      todayStudyTimeMinutes: 0,
      weeklyStudyTime: 0,
      weeklyStudyTimeMinutes: 0,
      previousWeekTimeMinutes: 0,
      weeklyGoalProgress: 0,
      weeklyGoalMinutes: 600,
      weeklyGoalHours: 10,
      weeklyChange: 0,
      totalQuizzes: 0,
      completedQuizzes: 0,
      totalNotes: 0,
      totalCardsMastered: 0,
      totalSets: 0,
      totalCardsReviewed: 0,
      flashcardAccuracy: 0,
      streakDays: 0,
      recentSessions: [],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      todayString: new Date().toISOString().split('T')[0]
    },
    isLoading,
    error,
    timezone: analytics?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  };
};
