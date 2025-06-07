
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export const useConsolidatedAnalytics = () => {
  const { user } = useAuth();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['consolidated-analytics', user?.id],
    queryFn: async () => {
      if (!user) return null;

      console.log('Fetching consolidated analytics for user:', user.id);

      // Get study sessions with proper filtering - only completed, realistic sessions
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
        console.error('Error fetching sessions:', sessionsError);
        throw sessionsError;
      }

      console.log('Filtered sessions data:', sessions);

      // Get flashcard sets
      const { data: flashcardSets, error: setsError } = await supabase
        .from('flashcard_sets')
        .select('id, name')
        .eq('user_id', user.id);

      if (setsError) {
        console.error('Error fetching flashcard sets:', setsError);
      }

      // Get flashcard progress
      const { data: progress, error: progressError } = await supabase
        .from('user_flashcard_progress')
        .select('*')
        .eq('user_id', user.id);

      if (progressError) {
        console.error('Error fetching flashcard progress:', progressError);
      }

      // Calculate statistics from completed sessions only
      const allSessions = sessions || [];
      
      // Calculate total study time (duration is in seconds)
      const totalStudyTimeSeconds = allSessions.reduce((sum, session) => {
        return sum + (session.duration || 0);
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

      // Today's statistics - only from completed sessions
      const today = new Date().toISOString().split('T')[0];
      const todaySessions = allSessions.filter(s => 
        s.start_time && s.start_time.startsWith(today)
      );

      const todayStudyTimeSeconds = todaySessions.reduce((sum, session) => {
        return sum + (session.duration || 0);
      }, 0);

      const todayStudyTimeHours = Math.round((todayStudyTimeSeconds / 3600) * 10) / 10;

      // Weekly statistics - last 7 days of completed sessions
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const weeklySessions = allSessions.filter(s => 
        s.start_time && new Date(s.start_time) >= sevenDaysAgo
      );

      const weeklyStudyTimeSeconds = weeklySessions.reduce((sum, session) => {
        return sum + (session.duration || 0);
      }, 0);

      const weeklyStudyTimeHours = Math.round((weeklyStudyTimeSeconds / 3600) * 10) / 10;

      const result = {
        // Overall statistics
        totalSessions: allSessions.length,
        totalStudyTime: totalStudyTimeHours,
        averageSessionTime: averageSessionTimeMinutes,
        totalSets,
        totalCardsReviewed,
        totalCardsMastered,
        flashcardAccuracy,
        
        // Today's statistics
        todayStudyTime: todayStudyTimeHours,
        todaySessions: todaySessions.length,
        
        // Weekly statistics
        weeklyStudyTime: weeklyStudyTimeHours,
        weeklySessions: weeklySessions.length,
        
        // Recent data
        recentSessions,
        activeSessions: [], // No active sessions in this calculation
        
        // Streak calculation (simplified)
        streakDays: 0, // TODO: Implement proper streak calculation
        
        // For backward compatibility
        studyTimeHours: totalStudyTimeHours,
        stats: {
          totalSessions: allSessions.length,
          totalStudyTime: totalStudyTimeHours,
          averageSessionTime: averageSessionTimeMinutes,
          totalCardsMastered,
          totalSets,
          flashcardAccuracy,
          streakDays: 0,
          studyTimeHours: totalStudyTimeHours
        }
      };

      console.log('Consolidated analytics result:', result);
      console.log('Study time calculation:', {
        totalSeconds: totalStudyTimeSeconds,
        totalHours: totalStudyTimeHours,
        todayHours: todayStudyTimeHours,
        weeklyHours: weeklyStudyTimeHours,
        sessionsCount: allSessions.length
      });
      
      return result;
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: false, // Remove auto-refetch to prevent inconsistencies
  });

  return { 
    analytics: analytics || {
      totalSessions: 0,
      totalStudyTime: 0,
      averageSessionTime: 0,
      totalSets: 0,
      totalCardsReviewed: 0,
      totalCardsMastered: 0,
      flashcardAccuracy: 0,
      todayStudyTime: 0,
      todaySessions: 0,
      weeklyStudyTime: 0,
      weeklySessions: 0,
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
    }, 
    isLoading 
  };
};
