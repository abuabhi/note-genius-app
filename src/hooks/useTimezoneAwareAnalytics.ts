
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/auth/useAuth';
import { useTimezone } from '@/hooks/useTimezone';
import { supabase } from '@/integrations/supabase/client';
import { 
  getTodayInTimezone, 
  getStartOfDayInTimezone, 
  getEndOfDayInTimezone,
  getWeekStartInTimezone,
  getWeekEndInTimezone
} from '@/utils/timezoneUtils';

export const useTimezoneAwareAnalytics = () => {
  const { user } = useAuth();
  const { timezone, isLoading: timezoneLoading } = useTimezone();

  console.log('🔍 Analytics Hook Debug:', {
    hasUser: !!user,
    userId: user?.id,
    timezone,
    timezoneLoading,
    enableQuery: !!user && !timezoneLoading
  });

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['timezone-aware-analytics', user?.id, timezone],
    queryFn: async () => {
      console.log('📊 Starting analytics query with:', { userId: user?.id, timezone });

      if (!user) {
        console.log('❌ No user found');
        throw new Error('User not authenticated');
      }

      try {
        // Get timezone boundaries
        const todayString = getTodayInTimezone(timezone);
        const todayStart = getStartOfDayInTimezone(timezone);
        const todayEnd = getEndOfDayInTimezone(timezone);
        const weekStart = getWeekStartInTimezone(timezone, 0);
        const weekEnd = getWeekEndInTimezone(timezone, 0);
        const lastWeekStart = getWeekStartInTimezone(timezone, 1);
        const lastWeekEnd = getWeekEndInTimezone(timezone, 1);

        console.log('🕐 Timezone boundaries:', {
          todayString,
          todayStart: todayStart.toISOString(),
          todayEnd: todayEnd.toISOString(),
          weekStart: weekStart.toISOString(),
          weekEnd: weekEnd.toISOString()
        });

        // Fetch all sessions
        const { data: sessions, error: sessionsError } = await supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('start_time', { ascending: false });

        if (sessionsError) {
          console.error('❌ Sessions query error:', sessionsError);
          throw sessionsError;
        }

        console.log('📊 Raw sessions data:', { 
          sessionCount: sessions?.length || 0,
          sessions: sessions?.slice(0, 3) // Log first 3 for debugging
        });

        // Fetch flashcard sets count
        const { data: flashcardSets, error: setsError } = await supabase
          .from('flashcard_sets')
          .select('id')
          .eq('user_id', user.id);

        if (setsError) {
          console.log('⚠️ Flashcard sets query failed:', setsError);
        }

        // Fetch notes count
        const { data: notes, error: notesError } = await supabase
          .from('notes')
          .select('id')
          .eq('user_id', user.id);

        if (notesError) {
          console.log('⚠️ Notes query failed:', notesError);
        }

        // Fetch quiz count
        const { data: quizzes, error: quizzesError } = await supabase
          .from('quizzes')
          .select('id')
          .eq('user_id', user.id);

        if (quizzesError) {
          console.log('⚠️ Quizzes query failed:', quizzesError);
        }

        // Calculate analytics from sessions
        const allSessions = sessions || [];
        const completedSessions = allSessions.filter(s => !s.is_active && s.duration);

        // Today's sessions
        const todaySessions = allSessions.filter(session => {
          if (!session.start_time) return false;
          const sessionDate = new Date(session.start_time);
          return sessionDate >= todayStart && sessionDate <= todayEnd;
        });

        // This week's sessions
        const weekSessions = allSessions.filter(session => {
          if (!session.start_time) return false;
          const sessionDate = new Date(session.start_time);
          return sessionDate >= weekStart && sessionDate <= weekEnd;
        });

        // Last week's sessions
        const lastWeekSessions = allSessions.filter(session => {
          if (!session.start_time) return false;
          const sessionDate = new Date(session.start_time);
          return sessionDate >= lastWeekStart && sessionDate <= lastWeekEnd;
        });

        // Calculate metrics
        const totalStudyTimeMinutes = completedSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
        const todayStudyTimeMinutes = todaySessions.reduce((acc, s) => acc + (s.duration || 0), 0);
        const weeklyStudyTimeMinutes = weekSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
        const lastWeekTimeMinutes = lastWeekSessions.reduce((acc, s) => acc + (s.duration || 0), 0);

        const totalCardsReviewed = allSessions.reduce((acc, s) => acc + (s.cards_reviewed || 0), 0);
        const totalCardsCorrect = allSessions.reduce((acc, s) => acc + (s.cards_correct || 0), 0);
        const flashcardAccuracy = totalCardsReviewed > 0 ? Math.round((totalCardsCorrect / totalCardsReviewed) * 100) : 0;

        // Calculate streak (simplified - consecutive days with sessions)
        const today = new Date();
        let streakDays = 0;
        for (let i = 0; i < 30; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() - i);
          const dayString = checkDate.toISOString().split('T')[0];
          
          const hasSessions = allSessions.some(session => {
            if (!session.start_time) return false;
            const sessionDate = new Date(session.start_time);
            return sessionDate.toISOString().split('T')[0] === dayString;
          });
          
          if (hasSessions) {
            streakDays++;
          } else if (i > 0) {
            break; // Break streak if no sessions found (but not on first day)
          }
        }

        // Weekly goal (default to 10 hours = 600 minutes)
        const weeklyGoalMinutes = 600;
        const weeklyGoalProgress = Math.min(Math.round((weeklyStudyTimeMinutes / weeklyGoalMinutes) * 100), 100);
        
        // Weekly change calculation
        const weeklyChange = lastWeekTimeMinutes > 0 
          ? Math.round(((weeklyStudyTimeMinutes - lastWeekTimeMinutes) / lastWeekTimeMinutes) * 100)
          : weeklyStudyTimeMinutes > 0 ? 100 : 0;

        const result = {
          // Session metrics
          totalSessions: allSessions.length,
          todaySessions: todaySessions.length,
          weeklySessions: weekSessions.length,
          averageSessionTime: completedSessions.length > 0 ? Math.round(totalStudyTimeMinutes / completedSessions.length) : 0,
          activeSessions: allSessions.filter(s => s.is_active).length,
          
          // Time metrics
          totalStudyTime: Math.round((totalStudyTimeMinutes / 60) * 10) / 10, // Hours
          totalStudyTimeMinutes,
          todayStudyTime: Math.round((todayStudyTimeMinutes / 60) * 10) / 10, // Hours
          todayStudyTimeMinutes,
          weeklyStudyTime: Math.round((weeklyStudyTimeMinutes / 60) * 10) / 10, // Hours
          weeklyStudyTimeMinutes,
          previousWeekTimeMinutes: lastWeekTimeMinutes,
          
          // Goal tracking
          weeklyGoalProgress,
          weeklyGoalMinutes,
          weeklyGoalHours: Math.round((weeklyGoalMinutes / 60) * 10) / 10,
          weeklyChange,
          
          // Quiz metrics
          totalQuizzes: quizzes?.length || 0,
          completedQuizzes: allSessions.filter(s => (s.quiz_total_questions || 0) > 0).length,
          
          // Notes metrics
          totalNotes: notes?.length || 0,
          
          // Flashcard metrics
          totalCardsMastered: totalCardsCorrect, // Using correct cards as "mastered"
          totalSets: flashcardSets?.length || 0,
          totalCardsReviewed,
          flashcardAccuracy,
          
          // Streak and trends
          streakDays,
          
          // Session data
          recentSessions: allSessions.slice(0, 10),
          
          // Timezone info
          timezone,
          todayString
        };

        console.log('✅ Analytics calculated successfully:', result);
        return result;

      } catch (error) {
        console.error('❌ Analytics calculation error:', error);
        throw error;
      }
    },
    enabled: !!user && !timezoneLoading, // More robust enablement
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000
  });

  console.log('📊 Analytics Hook Result:', {
    isLoading,
    hasError: !!error,
    errorMessage: error?.message,
    hasData: !!analytics,
    dataKeys: analytics ? Object.keys(analytics) : []
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
      timezone: timezone || 'UTC',
      todayString: getTodayInTimezone(timezone || 'UTC')
    },
    isLoading: isLoading || timezoneLoading,
    error
  };
};
