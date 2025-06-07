
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

      // Get study sessions with proper filtering
      const { data: sessions, error: sessionsError } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });

      if (sessionsError) {
        console.error('Error fetching sessions:', sessionsError);
        throw sessionsError;
      }

      console.log('Raw sessions data:', sessions);

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

      // Calculate statistics
      const allSessions = sessions || [];
      const completedSessions = allSessions.filter(s => !s.is_active);
      const activeSessions = allSessions.filter(s => s.is_active);

      // Calculate total study time (including active sessions)
      let totalStudyTimeMinutes = 0;
      
      completedSessions.forEach(session => {
        if (session.duration) {
          totalStudyTimeMinutes += session.duration / 60;
        }
      });

      // Add time from active sessions
      activeSessions.forEach(session => {
        if (session.start_time) {
          const sessionMinutes = (Date.now() - new Date(session.start_time).getTime()) / (1000 * 60);
          totalStudyTimeMinutes += sessionMinutes;
        }
      });

      const totalStudyTimeHours = Math.round(totalStudyTimeMinutes / 60 * 10) / 10;
      const averageSessionTime = completedSessions.length > 0 
        ? Math.round(totalStudyTimeMinutes / completedSessions.length) 
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

      // Today's statistics
      const today = new Date().toISOString().split('T')[0];
      const todaySessions = allSessions.filter(s => 
        s.start_time && s.start_time.startsWith(today)
      );

      const todayStudyTime = todaySessions.reduce((sum, session) => {
        if (session.duration) return sum + session.duration / 60;
        if (session.is_active && session.start_time) {
          const sessionMinutes = (Date.now() - new Date(session.start_time).getTime()) / (1000 * 60);
          return sum + sessionMinutes;
        }
        return sum;
      }, 0);

      const result = {
        // Overall statistics
        totalSessions: allSessions.length,
        totalStudyTime: totalStudyTimeHours,
        averageSessionTime,
        totalSets,
        totalCardsReviewed,
        totalCardsMastered,
        flashcardAccuracy,
        
        // Today's statistics
        todayStudyTime: Math.round(todayStudyTime / 60 * 10) / 10, // Convert to hours
        todaySessions: todaySessions.length,
        
        // Recent data
        recentSessions,
        activeSessions,
        
        // Streak calculation (simplified)
        streakDays: 0, // TODO: Implement proper streak calculation
        
        // For backward compatibility
        studyTimeHours: totalStudyTimeHours,
        stats: {
          totalSessions: allSessions.length,
          totalStudyTime: totalStudyTimeHours,
          averageSessionTime,
          totalCardsMastered,
          totalSets,
          flashcardAccuracy,
          streakDays: 0,
          studyTimeHours: totalStudyTimeHours
        }
      };

      console.log('Consolidated analytics result:', result);
      return result;
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute to catch active sessions
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
