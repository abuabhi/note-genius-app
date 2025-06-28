
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { getTodayInTimezone, getStartOfDayInTimezone, getEndOfDayInTimezone, getWeekStartInTimezone, getWeekEndInTimezone } from '@/utils/timezoneUtils';

export const useTimezoneAwareAnalytics = () => {
  const { user } = useAuth();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['timezone-aware-analytics', user?.id, timezone],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      console.log(`📊 Fetching timezone-aware analytics for ${timezone}`);

      const now = new Date();
      const todayString = getTodayInTimezone(timezone);
      const startOfToday = getStartOfDayInTimezone(timezone);
      const endOfToday = getEndOfDayInTimezone(timezone);
      const thisWeekStart = getWeekStartInTimezone(timezone, 0);
      const thisWeekEnd = getWeekEndInTimezone(timezone, 0);
      const lastWeekStart = getWeekStartInTimezone(timezone, 1);
      const lastWeekEnd = getWeekEndInTimezone(timezone, 1);

      console.log(`🌏 Timezone calculations:`, {
        timezone,
        todayString,
        startOfToday: startOfToday.toISOString(),
        endOfToday: endOfToday.toISOString(),
        thisWeekStart: thisWeekStart.toISOString(),
        thisWeekEnd: thisWeekEnd.toISOString()
      });

      // Fetch all study sessions
      const { data: allSessions, error: sessionsError } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });

      if (sessionsError) {
        console.error('Error fetching sessions:', sessionsError);
        throw sessionsError;
      }

      // Fetch flashcard progress
      const { data: flashcardProgress, error: flashcardError } = await supabase
        .from('user_flashcard_progress')
        .select('*')
        .eq('user_id', user.id);

      if (flashcardError) {
        console.error('Error fetching flashcard progress:', flashcardError);
        throw flashcardError;
      }

      // Fetch flashcard sets for counting
      const { data: flashcardSets, error: setsError } = await supabase
        .from('flashcard_sets')
        .select('id')
        .eq('user_id', user.id);

      if (setsError) {
        console.error('Error fetching flashcard sets:', setsError);
        throw setsError;
      }

      // Fetch user profile for weekly goal
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('weekly_goal_hours')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      const sessions = allSessions || [];
      const progress = flashcardProgress || [];
      const sets = flashcardSets || [];

      // Filter sessions by timezone-aware dates
      const todaySessions = sessions.filter(session => {
        const sessionStart = new Date(session.start_time);
        return sessionStart >= startOfToday && sessionStart <= endOfToday;
      });

      const thisWeekSessions = sessions.filter(session => {
        const sessionStart = new Date(session.start_time);
        return sessionStart >= thisWeekStart && sessionStart <= thisWeekEnd;
      });

      const lastWeekSessions = sessions.filter(session => {
        const sessionStart = new Date(session.start_time);
        return sessionStart >= lastWeekStart && sessionStart <= lastWeekEnd;
      });

      // Calculate metrics
      const totalSessions = sessions.length;
      const todaySessionsCount = todaySessions.length;
      const weeklySessionsCount = thisWeekSessions.length;

      // Calculate study time
      const totalStudyTimeMinutes = sessions.reduce((total, session) => {
        if (session.end_time) {
          const duration = (new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / (1000 * 60);
          return total + Math.max(0, duration);
        }
        return total;
      }, 0);

      const todayStudyTimeMinutes = todaySessions.reduce((total, session) => {
        if (session.end_time) {
          const duration = (new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / (1000 * 60);
          return total + Math.max(0, duration);
        }
        return total;
      }, 0);

      const weeklyStudyTimeMinutes = thisWeekSessions.reduce((total, session) => {
        if (session.end_time) {
          const duration = (new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / (1000 * 60);
          return total + Math.max(0, duration);
        }
        return total;
      }, 0);

      const lastWeekStudyTimeMinutes = lastWeekSessions.reduce((total, session) => {
        if (session.end_time) {
          const duration = (new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / (1000 * 60);
          return total + Math.max(0, duration);
        }
        return total;
      }, 0);

      // Calculate averages
      const averageSessionTime = totalSessions > 0 ? Math.round(totalStudyTimeMinutes / totalSessions) : 0;

      // Calculate flashcard metrics
      const totalCardsMastered = progress.filter(p => p.mastery_level >= 5).length;
      const totalCardsReviewed = progress.length;
      const flashcardAccuracy = totalCardsReviewed > 0 
        ? Math.round((totalCardsMastered / totalCardsReviewed) * 100) 
        : 0;

      // Calculate weekly goal progress
      const weeklyGoalHours = profile?.weekly_goal_hours || 10;
      const weeklyGoalMinutes = weeklyGoalHours * 60;
      const weeklyGoalProgress = Math.min(100, Math.round((weeklyStudyTimeMinutes / weeklyGoalMinutes) * 100));

      // Calculate streak (simplified - consecutive days with study activity)
      let streakDays = 0;
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(now);
        checkDate.setDate(checkDate.getDate() - i);
        const checkDateString = getTodayInTimezone(timezone);
        
        const dayHasActivity = sessions.some(session => {
          const sessionDate = new Date(session.start_time);
          const sessionDateString = sessionDate.toISOString().split('T')[0];
          return sessionDateString === checkDateString;
        });

        if (dayHasActivity) {
          streakDays++;
        } else if (i > 0) {
          break; // Break streak if no activity (but allow today to be 0)
        }
      }

      // Calculate weekly change
      const weeklyChange = lastWeekStudyTimeMinutes > 0 
        ? Math.round(((weeklyStudyTimeMinutes - lastWeekStudyTimeMinutes) / lastWeekStudyTimeMinutes) * 100)
        : weeklyStudyTimeMinutes > 0 ? 100 : 0;

      // Get active sessions
      const activeSessions = sessions.filter(session => !session.end_time).length;

      // Get recent sessions (last 10)
      const recentSessions = sessions.slice(0, 10);

      return {
        totalSessions,
        todaySessions: todaySessionsCount,
        weeklySessions: weeklySessionsCount,
        averageSessionTime,
        activeSessions,
        
        // Time metrics
        totalStudyTime: Math.round(totalStudyTimeMinutes / 60 * 10) / 10, // Hours with 1 decimal
        totalStudyTimeMinutes: Math.round(totalStudyTimeMinutes),
        todayStudyTimeMinutes: Math.round(todayStudyTimeMinutes),
        weeklyStudyTimeMinutes: Math.round(weeklyStudyTimeMinutes),
        
        // Goal tracking
        weeklyGoalProgress,
        weeklyGoalMinutes,
        
        // Performance metrics
        flashcardAccuracy,
        totalCardsMastered,
        totalSets: sets.length,
        totalCardsReviewed,
        
        // Streak and trends
        streakDays,
        weeklyChange,
        
        // Session data
        recentSessions,
        
        // Timezone info
        timezone,
        todayString
      };
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
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
      todayStudyTimeMinutes: 0,
      weeklyStudyTimeMinutes: 0,
      weeklyGoalProgress: 0,
      weeklyGoalMinutes: 600,
      flashcardAccuracy: 0,
      totalCardsMastered: 0,
      totalSets: 0,
      totalCardsReviewed: 0,
      streakDays: 0,
      weeklyChange: 0,
      recentSessions: [],
      timezone: timezone,
      todayString: getTodayInTimezone(timezone)
    },
    isLoading,
    error,
    timezone
  };
};
