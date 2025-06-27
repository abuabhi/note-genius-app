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

        // Get timezone-aware date boundaries
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        
        // Get start of current week (Sunday)
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());

        // Get today's sessions with proper timezone handling
        const { data: todaySessions, error: todayError } = await supabase
          .from('study_sessions')
          .select('duration, cards_reviewed, cards_correct')
          .eq('user_id', user.id)
          .gte('start_time', today.toISOString())
          .lt('start_time', todayEnd.toISOString())
          .not('duration', 'is', null);

        if (todayError) console.warn('Today sessions error:', todayError);

        // Get this week's sessions
        const { data: weekSessions, error: weekError } = await supabase
          .from('study_sessions')
          .select('duration, cards_reviewed, cards_correct')
          .eq('user_id', user.id)
          .gte('start_time', startOfWeek.toISOString())
          .not('duration', 'is', null);

        if (weekError) console.warn('Week sessions error:', weekError);

        // Get all completed sessions for totals
        const { data: allSessions, error: allError } = await supabase
          .from('study_sessions')
          .select('duration, cards_reviewed, cards_correct')
          .eq('user_id', user.id)
          .not('duration', 'is', null);

        if (allError) console.warn('All sessions error:', allError);

        // Calculate metrics with proper validation and conversion
        const todayData = todaySessions || [];
        const weekData = weekSessions || [];
        const allData = allSessions || [];

        // Convert duration (assuming it might be in seconds, convert to minutes)
        const convertDuration = (duration: number) => {
          // If duration is very large, it's likely in seconds, convert to minutes
          if (duration > 1000) {
            return Math.round(duration / 60);
          }
          return duration;
        };

        const todayStudyTimeMinutes = Math.min(
          todayData.reduce((acc, s) => acc + convertDuration(s.duration || 0), 0),
          24 * 60 // Max 24 hours per day
        );
        
        const weeklyStudyTimeMinutes = Math.min(
          weekData.reduce((acc, s) => acc + convertDuration(s.duration || 0), 0),
          7 * 24 * 60 // Max 7 days * 24 hours
        );
        
        const totalStudyTimeMinutes = allData.reduce((acc, s) => acc + convertDuration(s.duration || 0), 0);
        
        const totalCardsReviewed = allData.reduce((acc, s) => acc + (s.cards_reviewed || 0), 0);
        const totalCardsCorrect = allData.reduce((acc, s) => acc + (s.cards_correct || 0), 0);

        // Calculate realistic metrics
        const totalStudyTime = Math.round((totalStudyTimeMinutes / 60) * 10) / 10;
        const todayStudyTime = Math.round((todayStudyTimeMinutes / 60) * 10) / 10;
        const weeklyStudyTime = Math.round((weeklyStudyTimeMinutes / 60) * 10) / 10;
        const flashcardAccuracy = totalCardsReviewed > 0 ? Math.round((totalCardsCorrect / totalCardsReviewed) * 100) : 0;

        // Weekly goal defaults
        const weeklyGoalMinutes = 600; // 10 hours
        const weeklyGoalProgress = Math.min(Math.round((weeklyStudyTimeMinutes / weeklyGoalMinutes) * 100), 100);

        const result = {
          // Session metrics
          totalSessions: sessionsCount.count || 0,
          todaySessions: todayData.length,
          weeklySessions: weekData.length,
          averageSessionTime: allData.length > 0 ? Math.round(totalStudyTimeMinutes / allData.length) : 0,
          activeSessions: [],
          
          // Time metrics - realistic values
          totalStudyTime,
          totalStudyTimeMinutes,
          todayStudyTime,
          todayStudyTimeMinutes,
          weeklyStudyTime,
          weeklyStudyTimeMinutes,
          previousWeekTimeMinutes: 0,
          
          // Goal tracking
          weeklyGoalProgress,
          weeklyGoalMinutes,
          weeklyGoalHours: Math.round((weeklyGoalMinutes / 60) * 10) / 10,
          weeklyChange: 0,
          
          // Content metrics
          totalQuizzes: quizzesCount.count || 0,
          completedQuizzes: 0,
          totalNotes: notesCount.count || 0,
          totalCardsMastered: totalCardsCorrect,
          totalSets: setsCount.count || 0,
          totalCardsReviewed,
          flashcardAccuracy,
          
          // Other
          streakDays: 0,
          recentSessions: [],
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          todayString: today.toISOString().split('T')[0]
        };

        console.log('✅ Ultra-simple analytics result:', result);
        return result;

      } catch (error) {
        console.error('❌ Ultra-simple analytics error:', error);
        throw error;
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
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
