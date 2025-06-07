
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

// Validation helpers
const validateDuration = (duration: number | null): number => {
  if (!duration || duration < 60 || duration > 14400) return 0; // 1 min to 4 hours
  return duration;
};

const validateHours = (hours: number): number => {
  if (hours > 1000) return Math.round(hours / 3600); // Convert seconds to hours if needed
  return Math.max(0, hours);
};

const safePercentage = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

export const useConsolidatedAnalytics = () => {
  const { user } = useAuth();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['consolidated-analytics', user?.id],
    queryFn: async () => {
      if (!user) return null;

      console.log('🔄 Fetching consolidated analytics for user:', user.id);

      // Get study sessions with strict filtering - only completed, realistic sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', false) // Only completed sessions
        .not('duration', 'is', null)
        .gte('duration', 60) // At least 1 minute
        .lte('duration', 14400) // At most 4 hours
        .order('start_time', { ascending: false });

      if (sessionsError) {
        console.error('❌ Error fetching sessions:', sessionsError);
        throw sessionsError;
      }

      console.log(`📊 Found ${sessions?.length || 0} valid sessions`);

      // Get flashcard sets
      const { data: flashcardSets, error: setsError } = await supabase
        .from('flashcard_sets')
        .select('id, name')
        .eq('user_id', user.id);

      if (setsError) {
        console.error('❌ Error fetching flashcard sets:', setsError);
      }

      // Get flashcard progress
      const { data: progress, error: progressError } = await supabase
        .from('user_flashcard_progress')
        .select('*')
        .eq('user_id', user.id);

      if (progressError) {
        console.error('❌ Error fetching flashcard progress:', progressError);
      }

      // Calculate statistics from completed sessions only
      const allSessions = sessions || [];
      
      // Calculate total study time (duration is in seconds)
      const totalStudyTimeSeconds = allSessions.reduce((sum, session) => {
        const validDuration = validateDuration(session.duration);
        return sum + validDuration;
      }, 0);

      // Convert to hours with proper rounding
      const totalStudyTimeHours = Math.round((totalStudyTimeSeconds / 3600) * 10) / 10;
      
      // Calculate average session time in minutes
      const averageSessionTimeMinutes = allSessions.length > 0 
        ? Math.round((totalStudyTimeSeconds / allSessions.length) / 60) 
        : 0;

      // Calculate flashcard statistics
      const totalSets = flashcardSets?.length || 0;
      const totalCardsReviewed = progress?.length || 0;
      
      // Calculate accuracy
      let flashcardAccuracy = 0;
      if (progress && progress.length > 0) {
        const totalScore = progress.reduce((sum, p) => sum + (p.last_score || 0), 0);
        flashcardAccuracy = Math.round((totalScore / (progress.length * 5)) * 100);
      }

      // Calculate cards mastered (ease_factor >= 2.5 and interval >= 7)
      const totalCardsMastered = progress?.filter(p => 
        p.ease_factor && p.ease_factor >= 2.5 && 
        p.interval && p.interval >= 7
      ).length || 0;

      // Recent sessions for dashboard
      const recentSessions = allSessions.slice(0, 5);

      // Today's statistics - using consistent timezone
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const todaySessions = allSessions.filter(s => 
        s.start_time && s.start_time.startsWith(today)
      );

      const todayStudyTimeSeconds = todaySessions.reduce((sum, session) => {
        const validDuration = validateDuration(session.duration);
        return sum + validDuration;
      }, 0);

      const todayStudyTimeHours = Math.round((todayStudyTimeSeconds / 3600) * 10) / 10;
      const todayStudyTimeMinutes = Math.round(todayStudyTimeSeconds / 60);

      // Weekly statistics - last 7 days from now
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const weeklySessions = allSessions.filter(s => 
        s.start_time && new Date(s.start_time) >= sevenDaysAgo
      );

      const weeklyStudyTimeSeconds = weeklySessions.reduce((sum, session) => {
        const validDuration = validateDuration(session.duration);
        return sum + validDuration;
      }, 0);

      const weeklyStudyTimeHours = Math.round((weeklyStudyTimeSeconds / 3600) * 10) / 10;
      const weeklyStudyTimeMinutes = Math.round(weeklyStudyTimeSeconds / 60);

      // Previous week for comparison
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      
      const previousWeekSessions = allSessions.filter(s => 
        s.start_time && 
        new Date(s.start_time) >= fourteenDaysAgo && 
        new Date(s.start_time) < sevenDaysAgo
      );

      const previousWeekTimeSeconds = previousWeekSessions.reduce((sum, session) => {
        const validDuration = validateDuration(session.duration);
        return sum + validDuration;
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
        
        // Study time in multiple formats for different uses
        totalStudyTime: validateHours(totalStudyTimeHours), // Total hours
        totalStudyTimeMinutes: Math.round(totalStudyTimeSeconds / 60), // Total minutes
        
        todayStudyTime: validateHours(todayStudyTimeHours), // Today hours
        todayStudyTimeMinutes: todayStudyTimeMinutes, // Today minutes
        
        weeklyStudyTime: validateHours(weeklyStudyTimeHours), // Weekly hours  
        weeklyStudyTimeMinutes: weeklyStudyTimeMinutes, // Weekly minutes
        
        previousWeekTimeMinutes,
        weeklyChange, // Week-over-week percentage change
        
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
        recentSessions,
        activeSessions: [], // No active sessions in this calculation
        
        // Streak calculation (simplified)
        streakDays: todaySessions.length > 0 ? 1 : 0,
        
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

      console.log('📈 Analytics calculation summary:', {
        totalSessions: result.totalSessions,
        totalMinutes: result.totalStudyTimeMinutes,
        todayMinutes: result.todayStudyTimeMinutes,
        weeklyMinutes: result.weeklyStudyTimeMinutes,
        previousWeekMinutes: result.previousWeekTimeMinutes,
        weeklyChange: result.weeklyChange,
        goalProgress: result.weeklyGoalProgress
      });
      
      return result;
    },
    enabled: !!user,
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
    isLoading 
  };
};
