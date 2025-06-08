
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

export const useTimezoneAwareAnalytics = () => {
  const { user } = useAuth();
  const { timezone, isLoading: timezoneLoading } = useTimezone();

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['timezone-aware-analytics', user?.id, timezone],
    queryFn: async () => {
      if (!user || !timezone) return null;

      console.log('🔄 Fetching cleaned timezone-aware analytics for user:', user.id, 'timezone:', timezone);
      
      // Debug timezone calculations
      if (timezone.includes('Melbourne') || timezone.includes('Australia')) {
        debugTimezone(timezone);
      }

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

      console.log(`📊 Found ${sessions?.length || 0} valid sessions after cleanup`);

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
        console.log(`Session ${session.id}: ${session.duration}s -> ${validDuration}s`);
        return sum + validDuration;
      }, 0);

      const totalStudyTimeHours = Math.round((totalStudyTimeSeconds / 3600) * 10) / 10;
      const averageSessionTimeMinutes = allSessions.length > 0 
        ? Math.round((totalStudyTimeSeconds / allSessions.length) / 60) 
        : 0;

      console.log(`📈 Study time calculation: ${totalStudyTimeSeconds}s = ${totalStudyTimeHours}h from ${allSessions.length} sessions`);

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
      
      console.log(`🌏 ${timezone} Timezone Boundaries:`, {
        todayString,
        startOfToday: startOfTodayCalc.toISOString(),
        endOfToday: endOfToday.toISOString(),
        currentTime: new Date().toISOString()
      });
      
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

      // Weekly goal progress (default 5 hours = 300 minutes)
      const weeklyGoalMinutes = 300;
      const weeklyGoalProgress = Math.min(100, Math.round((weeklyStudyTimeMinutes / weeklyGoalMinutes) * 100));

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
        
        // Goal tracking
        weeklyGoalProgress,
        weeklyGoalMinutes,
        
        // Flashcard metrics
        totalSets,
        totalCardsReviewed,
        totalCardsMastered,
        flashcardAccuracy,
        
        // Data for components
        recentSessions: allSessions.slice(0, 5),
        activeSessions: [],
        
        // Streak calculation
        streakDays: todaySessions.length > 0 ? 1 : 0,
        
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
          streakDays: todaySessions.length > 0 ? 1 : 0,
          studyTimeHours: validateHours(totalStudyTimeHours)
        }
      };

      console.log('📈 CLEANED Analytics Summary:', {
        timezone,
        totalSessions: result.totalSessions,
        totalStudyTimeHours: result.totalStudyTime,
        totalStudyTimeMinutes: result.totalStudyTimeMinutes,
        todayMinutes: result.todayStudyTimeMinutes,
        weeklyMinutes: result.weeklyStudyTimeMinutes,
        weeklyChange: result.weeklyChange,
        goalProgress: result.weeklyGoalProgress,
        totalCardsMastered: result.totalCardsMastered
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
    analytics: analytics || {
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
    }, 
    isLoading: analyticsLoading || timezoneLoading,
    timezone
  };
};
