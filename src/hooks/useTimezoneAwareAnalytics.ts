
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

export const useTimezoneAwareAnalytics = () => {
  const { user } = useAuth();

  // Get user's timezone from their profile or browser
  const { data: userTimezone } = useQuery({
    queryKey: ['user-timezone', user?.id],
    queryFn: async () => {
      if (!user) return 'UTC';
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('timezone')
        .eq('id', user.id)
        .single();
      
      return profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const timezone = userTimezone || 'UTC';

  console.log('🔍 Analytics Hook Debug:', {
    hasUser: !!user,
    userId: user?.id,
    timezone,
    timezoneLoading: !userTimezone,
    enableQuery: !!user && !!userTimezone
  });

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['timezone-analytics', user?.id, timezone],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      console.log('📊 Fetching analytics for timezone:', timezone);

      // Calculate date boundaries in user's timezone
      const now = new Date();
      const todayInTimezone = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
      const todayString = todayInTimezone.toISOString().split('T')[0];
      
      const weekAgo = new Date(todayInTimezone.getTime() - 7 * 24 * 60 * 60 * 1000);
      const weekAgoString = weekAgo.toISOString().split('T')[0];
      
      const twoWeeksAgo = new Date(todayInTimezone.getTime() - 14 * 24 * 60 * 60 * 1000);
      const twoWeeksAgoString = twoWeeksAgo.toISOString().split('T')[0];

      // Fetch all data in parallel
      const [
        sessionsResult,
        flashcardSetsResult,
        progressResult,
        notesResult,
        quizzesResult
      ] = await Promise.all([
        // Study sessions - Fix time calculation bug
        supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('auto_created', false)
          .order('start_time', { ascending: false }),
        
        // Flashcard sets and progress
        supabase
          .from('flashcard_sets')
          .select(`
            id, name, created_at,
            flashcard_set_cards(count),
            user_flashcard_progress(mastery_level, last_score)
          `)
          .eq('user_id', user.id),
        
        // User flashcard progress for mastery calculation
        supabase
          .from('user_flashcard_progress')
          .select('mastery_level, last_score, grade')
          .eq('user_id', user.id),
        
        // Notes count
        supabase
          .from('notes')
          .select('id')
          .eq('user_id', user.id),
        
        // Quizzes
        supabase
          .from('quiz_results')
          .select('*')
          .eq('user_id', user.id)
      ]);

      const sessions = sessionsResult.data || [];
      const flashcardSets = flashcardSetsResult.data || [];
      const progressData = progressResult.data || [];
      const notes = notesResult.data || [];
      const quizResults = quizzesResult.data || [];

      // Filter sessions by date ranges
      const todaySessions = sessions.filter(s => 
        s.start_time.startsWith(todayString)
      );
      
      const weeklySessions = sessions.filter(s => 
        s.start_time >= weekAgoString
      );
      
      const previousWeekSessions = sessions.filter(s => 
        s.start_time >= twoWeeksAgoString && s.start_time < weekAgoString
      );

      // Calculate time metrics - FIX: Convert seconds to minutes properly
      const calculateTimeFromSessions = (sessionList: any[]) => {
        return sessionList
          .filter(s => !s.is_active && s.duration) // Only completed sessions
          .reduce((total, s) => total + (s.duration || 0), 0); // Duration is in seconds
      };

      const totalStudyTimeSeconds = calculateTimeFromSessions(sessions);
      const todayStudyTimeSeconds = calculateTimeFromSessions(todaySessions);
      const weeklyStudyTimeSeconds = calculateTimeFromSessions(weeklySessions);
      const previousWeekTimeSeconds = calculateTimeFromSessions(previousWeekSessions);

      // Convert seconds to minutes and hours properly
      const totalStudyTimeMinutes = Math.round(totalStudyTimeSeconds / 60);
      const todayStudyTimeMinutes = Math.round(todayStudyTimeSeconds / 60);
      const weeklyStudyTimeMinutes = Math.round(weeklyStudyTimeSeconds / 60);
      const previousWeekTimeMinutes = Math.round(previousWeekTimeSeconds / 60);

      // Calculate other metrics
      const completedSessions = sessions.filter(s => !s.is_active);
      const averageSessionTime = completedSessions.length > 0 
        ? Math.round(totalStudyTimeSeconds / completedSessions.length) 
        : 0;

      const totalCardsReviewed = sessions.reduce((acc, s) => acc + (s.cards_reviewed || 0), 0);
      const totalCardsCorrect = sessions.reduce((acc, s) => acc + (s.cards_correct || 0), 0);
      const flashcardAccuracy = totalCardsReviewed > 0 
        ? Math.round((totalCardsCorrect / totalCardsReviewed) * 100) 
        : 0;

      const totalCardsMastered = progressData.filter(p => p.mastery_level >= 4).length;

      // Calculate streak
      let streakDays = 0;
      const uniqueStudyDates = [...new Set(sessions.map(s => s.start_time.split('T')[0]))].sort().reverse();
      
      if (uniqueStudyDates.includes(todayString)) {
        streakDays = 1;
        for (let i = 1; i < uniqueStudyDates.length; i++) {
          const expectedDate = new Date(todayInTimezone.getTime() - i * 24 * 60 * 60 * 1000)
            .toISOString().split('T')[0];
          if (uniqueStudyDates.includes(expectedDate)) {
            streakDays++;
          } else {
            break;
          }
        }
      }

      // Weekly goal progress (default 5 hours = 300 minutes)
      const weeklyGoalMinutes = 300; // 5 hours
      const weeklyGoalProgress = Math.min((weeklyStudyTimeMinutes / weeklyGoalMinutes) * 100, 100);

      // Calculate weekly change
      const weeklyChange = previousWeekTimeMinutes > 0 
        ? Math.round(((weeklyStudyTimeMinutes - previousWeekTimeMinutes) / previousWeekTimeMinutes) * 100)
        : weeklyStudyTimeMinutes > 0 ? 100 : 0;

      const result = {
        totalSessions: sessions.length,
        todaySessions: todaySessions.length,
        weeklySessions: weeklySessions.length,
        averageSessionTime,
        activeSessions: sessions.filter(s => s.is_active).length,
        
        // Time metrics - properly converted
        totalStudyTime: Math.round((totalStudyTimeMinutes / 60) * 10) / 10, // Hours with 1 decimal
        totalStudyTimeMinutes,
        todayStudyTime: Math.round((todayStudyTimeMinutes / 60) * 10) / 10,
        todayStudyTimeMinutes,
        weeklyStudyTime: Math.round((weeklyStudyTimeMinutes / 60) * 10) / 10,
        weeklyStudyTimeMinutes,
        previousWeekTimeMinutes,
        
        // Goal tracking
        weeklyGoalProgress,
        weeklyGoalMinutes,
        weeklyGoalHours: Math.round(weeklyGoalMinutes / 60),
        weeklyChange,
        
        // Performance metrics
        totalQuizzes: quizResults.length,
        completedQuizzes: quizResults.filter(q => q.completed_at).length,
        totalNotes: notes.length,
        totalCardsMastered,
        totalSets: flashcardSets.length,
        totalCardsReviewed,
        flashcardAccuracy,
        streakDays,
        
        // Recent data
        recentSessions: sessions.slice(0, 10),
        
        // Timezone info
        timezone,
        todayString
      };

      console.log('📊 Analytics Hook Result:', {
        isLoading: false,
        hasError: false,
        errorMessage: error,
        hasData: !!result,
        dataKeys: Object.keys(result)
      });

      return result;
    },
    enabled: !!user && !!userTimezone,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1
  });

  return {
    analytics: analytics || {
      totalSessions: 0,
      todaySessions: 0,
      weeklySessions: 0,
      averageSessionTime: 0,
      activeSessions: 0,
      totalStudyTime: 0,
      totalStudyTimeMinutes: 0,
      todayStudyTime: 0,
      todayStudyTimeMinutes: 0,
      weeklyStudyTime: 0,
      weeklyStudyTimeMinutes: 0,
      previousWeekTimeMinutes: 0,
      weeklyGoalProgress: 0,
      weeklyGoalMinutes: 300,
      weeklyGoalHours: 5,
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
      timezone: timezone || 'UTC',
      todayString: new Date().toISOString().split('T')[0]
    },
    isLoading: isLoading || !userTimezone,
    error
  };
};
