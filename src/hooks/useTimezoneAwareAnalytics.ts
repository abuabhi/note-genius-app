
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useTimezone } from './useTimezone';
import { 
  getTodayInTimezone, 
  getStartOfDayInTimezone, 
  getEndOfDayInTimezone,
  getWeekStartInTimezone,
  getWeekEndInTimezone,
  debugTimezone
} from '@/utils/timezoneUtils';

// Enhanced validation helpers
const validateDuration = (duration: number | null): number => {
  if (!duration || duration < 60) return 0; // Minimum 1 minute
  if (duration > 14400) return 3600; // Cap at 1 hour for suspicious long sessions
  if (duration === 14400) return 3600; // Fix the exactly 4-hour bug
  return duration;
};

const validateHours = (hours: number): number => {
  if (hours > 1000) return Math.round(hours / 3600); // Convert seconds to hours if needed
  return Math.max(0, Math.min(hours, 24)); // Cap at 24 hours per day max
};

const safePercentage = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

// Helper to calculate consecutive study streak
const calculateConsecutiveStreak = (sessions: any[], timezone: string): number => {
  if (!sessions || sessions.length === 0) return 0;

  // Get unique study dates sorted descending
  const studyDates = Array.from(
    new Set(
      sessions.map(session => {
        const date = new Date(session.start_time);
        return date.toLocaleDateString('en-CA', { timeZone: timezone }); // YYYY-MM-DD format
      })
    )
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (studyDates.length === 0) return 0;

  const today = new Date().toLocaleDateString('en-CA', { timeZone: timezone });
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    .toLocaleDateString('en-CA', { timeZone: timezone });

  // Start streak calculation
  let streak = 0;
  const mostRecentDate = studyDates[0];

  // Check if user studied today or yesterday (to maintain streak)
  if (mostRecentDate !== today && mostRecentDate !== yesterday) {
    return 0; // Streak broken
  }

  // Count consecutive days
  let expectedDate = today;
  for (const studyDate of studyDates) {
    if (studyDate === expectedDate) {
      streak++;
      // Move to previous day
      const prevDay = new Date(expectedDate);
      prevDay.setDate(prevDay.getDate() - 1);
      expectedDate = prevDay.toLocaleDateString('en-CA', { timeZone: timezone });
    } else {
      break; // Non-consecutive day found
    }
  }

  return streak;
};

export const useTimezoneAwareAnalytics = () => {
  const { user } = useAuth();
  const { timezone, isLoading: timezoneLoading } = useTimezone();

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['timezone-aware-analytics', user?.id, timezone],
    queryFn: async () => {
      if (!user || !timezone) return null;

      console.log('🔄 Fetching enhanced timezone-aware analytics for user:', user.id, 'timezone:', timezone);
      
      // Debug timezone calculations
      if (timezone.includes('Melbourne') || timezone.includes('Australia')) {
        debugTimezone(timezone);
      }

      // Get user's weekly goal from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('weekly_study_goal_hours')
        .eq('id', user.id)
        .single();

      const weeklyGoalHours = profile?.weekly_study_goal_hours || 5;

      // Get study sessions with enhanced filtering - only valid, completed sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', false) // Only completed sessions
        .not('duration', 'is', null)
        .gte('duration', 60) // At least 1 minute
        .lte('duration', 14400) // At most 4 hours
        .gte('start_time', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()) // Last 90 days only
        .order('start_time', { ascending: false });

      if (sessionsError) {
        console.error('❌ Error fetching sessions:', sessionsError);
        throw sessionsError;
      }

      // Get quiz data
      const { data: quizResults } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', user.id);

      const { data: totalQuizzes } = await supabase
        .from('quizzes')
        .select('id')
        .or(`user_id.eq.${user.id},is_public.eq.true`);

      // Get notes count
      const { data: notesData } = await supabase
        .from('notes')
        .select('id')
        .eq('user_id', user.id);

      // Get flashcard sets and progress
      const { data: flashcardSets } = await supabase
        .from('flashcard_sets')
        .select('id, name')
        .eq('user_id', user.id);

      const { data: progress } = await supabase
        .from('user_flashcard_progress')
        .select('*')
        .eq('user_id', user.id);

      // Get today's learning progress
      const todayString = getTodayInTimezone(timezone);
      const startOfToday = getStartOfDayInTimezone(timezone);
      const { data: todayProgress } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', user.id)
        .gte('last_seen_at', startOfToday.toISOString());

      const allSessions = sessions || [];
      
      // Calculate total study time with enhanced validation
      const totalStudyTimeSeconds = allSessions.reduce((sum, session) => {
        const validDuration = validateDuration(session.duration);
        return sum + validDuration;
      }, 0);

      const totalStudyTimeHours = Math.round((totalStudyTimeSeconds / 3600) * 10) / 10;
      const averageSessionTimeMinutes = allSessions.length > 0 
        ? Math.round((totalStudyTimeSeconds / allSessions.length) / 60) 
        : 0;

      // Calculate quiz statistics
      const totalQuizzesCount = totalQuizzes?.length || 0;
      const completedQuizzesCount = quizResults?.length || 0;
      const totalNotesCount = notesData?.length || 0;

      // Calculate flashcard statistics
      const totalSets = flashcardSets?.length || 0;
      const totalCardsReviewed = progress?.length || 0;
      
      let flashcardAccuracy = 0;
      if (progress && progress.length > 0) {
        const totalScore = progress.reduce((sum, p) => sum + (p.last_score || 0), 0);
        flashcardAccuracy = Math.round((totalScore / (progress.length * 5)) * 100);
      }

      // Enhanced Cards Mastered calculation
      const spacedRepetitionMastered = progress?.filter(p => 
        p.ease_factor && p.ease_factor >= 2.5 && 
        p.interval && p.interval >= 7
      ).length || 0;

      const recentlyMastered = todayProgress?.filter(p => 
        p.times_correct > 0 && 
        p.times_seen > 0 && 
        (p.times_correct / p.times_seen) >= 0.8
      ).length || 0;

      const totalCardsMastered = spacedRepetitionMastered + recentlyMastered;

      // Timezone-aware date calculations
      const startOfTodayCalc = getStartOfDayInTimezone(timezone);
      const endOfToday = getEndOfDayInTimezone(timezone);
      
      // Today's sessions using proper timezone boundaries
      const todaySessions = allSessions.filter(s => {
        if (!s.start_time) return false;
        const sessionDate = new Date(s.start_time);
        return sessionDate >= startOfTodayCalc && sessionDate <= endOfToday;
      });

      const todayStudyTimeSeconds = todaySessions.reduce((sum, session) => {
        return sum + validateDuration(session.duration);
      }, 0);

      const todayStudyTimeHours = Math.round((todayStudyTimeSeconds / 3600) * 10) / 10;
      const todayStudyTimeMinutes = Math.round(todayStudyTimeSeconds / 60);

      // Weekly statistics - current week (Monday to Sunday)
      const weekStart = getWeekStartInTimezone(timezone, 0);
      const weekEnd = getWeekEndInTimezone(timezone, 0);
      
      const weeklySessions = allSessions.filter(s => {
        if (!s.start_time) return false;
        const sessionDate = new Date(s.start_time);
        return sessionDate >= weekStart && sessionDate <= weekEnd;
      });

      const weeklyStudyTimeSeconds = weeklySessions.reduce((sum, session) => {
        return sum + validateDuration(session.duration);
      }, 0);

      const weeklyStudyTimeHours = Math.round((weeklyStudyTimeSeconds / 3600) * 10) / 10;
      const weeklyStudyTimeMinutes = Math.round(weeklyStudyTimeSeconds / 60);

      // Previous week for comparison
      const previousWeekStart = getWeekStartInTimezone(timezone, 1);
      const previousWeekEnd = getWeekEndInTimezone(timezone, 1);
      
      const previousWeekSessions = allSessions.filter(s => {
        if (!s.start_time) return false;
        const sessionDate = new Date(s.start_time);
        return sessionDate >= previousWeekStart && sessionDate <= previousWeekEnd;
      });

      const previousWeekTimeSeconds = previousWeekSessions.reduce((sum, session) => {
        return sum + validateDuration(session.duration);
      }, 0);

      const previousWeekTimeMinutes = Math.round(previousWeekTimeSeconds / 60);

      // Calculate week-over-week change
      const weeklyChange = safePercentage(weeklyStudyTimeMinutes, previousWeekTimeMinutes);

      // Weekly goal progress using user's actual goal
      const weeklyGoalMinutes = weeklyGoalHours * 60;
      const weeklyGoalProgress = Math.min(100, Math.round((weeklyStudyTimeMinutes / weeklyGoalMinutes) * 100));

      // Enhanced consecutive streak calculation
      const streakDays = calculateConsecutiveStreak(allSessions, timezone);

      const result = {
        // Session counts
        totalSessions: allSessions.length,
        todaySessions: todaySessions.length,
        weeklySessions: weeklySessions.length,
        
        // Study time in multiple formats - now properly validated
        totalStudyTime: validateHours(totalStudyTimeHours),
        totalStudyTimeMinutes: Math.round(totalStudyTimeSeconds / 60),
        
        todayStudyTime: validateHours(todayStudyTimeHours),
        todayStudyTimeMinutes: todayStudyTimeMinutes,
        
        weeklyStudyTime: validateHours(weeklyStudyTimeHours),  
        weeklyStudyTimeMinutes: weeklyStudyTimeMinutes,
        
        previousWeekTimeMinutes,
        weeklyChange,
        
        // Session metrics
        averageSessionTime: averageSessionTimeMinutes,
        
        // Goal tracking - now uses user's actual goal
        weeklyGoalProgress,
        weeklyGoalMinutes,
        weeklyGoalHours,
        
        // Quiz metrics
        totalQuizzes: totalQuizzesCount,
        completedQuizzes: completedQuizzesCount,
        
        // Notes metrics
        totalNotes: totalNotesCount,
        
        // Flashcard metrics
        totalSets,
        totalCardsReviewed,
        totalCardsMastered,
        flashcardAccuracy,
        
        // Data for components
        recentSessions: allSessions.slice(0, 5),
        activeSessions: [],
        
        // Enhanced streak calculation
        streakDays,
        
        // Timezone info
        timezone,
        todayString,
        
        // Legacy compatibility
        studyTimeHours: validateHours(totalStudyTimeHours),
        stats: {
          totalSessions: allSessions.length,
          totalStudyTime: validateHours(totalStudyTimeHours),
          averageSessionTime: averageSessionTimeMinutes,
          totalCardsMastered,
          totalSets,
          flashcardAccuracy,
          streakDays,
          studyTimeHours: validateHours(totalStudyTimeHours)
        }
      };

      console.log('📈 ENHANCED Analytics Summary:', {
        timezone,
        totalSessions: result.totalSessions,
        todayMinutes: result.todayStudyTimeMinutes,
        weeklyHours: result.weeklyStudyTime,
        weeklyGoalProgress: result.weeklyGoalProgress,
        streakDays: result.streakDays,
        totalQuizzes: result.totalQuizzes,
        completedQuizzes: result.completedQuizzes,
        totalNotes: result.totalNotes
      });
      
      return result;
    },
    enabled: !!user && !!timezone && !timezoneLoading,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: false,
  });

  const defaultAnalytics = {
    totalSessions: 0,
    todaySessions: 0,
    weeklySessions: 0,
    totalStudyTime: 0,
    totalStudyTimeMinutes: 0,
    todayStudyTime: 0,
    todayStudyTimeMinutes: 0,
    weeklyStudyTime: 0,
    weeklyStudyTimeMinutes: 0,
    previousWeekTimeMinutes: 0,
    weeklyChange: 0,
    averageSessionTime: 0,
    weeklyGoalProgress: 0,
    weeklyGoalMinutes: 300,
    weeklyGoalHours: 5,
    totalQuizzes: 0,
    completedQuizzes: 0,
    totalNotes: 0,
    totalSets: 0,
    totalCardsReviewed: 0,
    totalCardsMastered: 0,
    flashcardAccuracy: 0,
    recentSessions: [],
    activeSessions: [],
    streakDays: 0,
    timezone: timezone || 'UTC',
    todayString: '',
    studyTimeHours: 0,
    stats: {
      totalSessions: 0,
      totalStudyTime: 0,
      averageSessionTime: 0,
      totalCardsMastered: 0,
      totalSets: 0,
      flashcardAccuracy: 0,
      streakDays: 0,
      studyTimeHours: 0
    }
  };

  return { 
    analytics: analytics || defaultAnalytics, 
    isLoading: analyticsLoading || timezoneLoading,
    timezone
  };
};
