import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useSimpleAnalytics = () => {
  const { user } = useAuth();

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['simple-analytics', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      // Get all sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Get flashcard sets count
      const { data: flashcardSets, error: setsError } = await supabase
        .from('flashcard_sets')
        .select('id')
        .eq('user_id', user.id);

      // Get notes count
      const { data: notes, error: notesError } = await supabase
        .from('notes')
        .select('id')
        .eq('user_id', user.id);

      // Get quizzes count
      const { data: quizzes, error: quizzesError } = await supabase
        .from('quizzes')
        .select('id')
        .eq('user_id', user.id);

      const allSessions = sessions || [];
      const completedSessions = allSessions.filter(s => !s.is_active && s.duration);
      const activeSessions = allSessions.filter(s => s.is_active);

      // Simple calculations
      const totalStudyTimeMinutes = completedSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
      const totalStudyTime = Math.round((totalStudyTimeMinutes / 60) * 10) / 10;
      
      const totalCardsReviewed = allSessions.reduce((acc, s) => acc + (s.cards_reviewed || 0), 0);
      const totalCardsCorrect = allSessions.reduce((acc, s) => acc + (s.cards_correct || 0), 0);
      const flashcardAccuracy = totalCardsReviewed > 0 ? Math.round((totalCardsCorrect / totalCardsReviewed) * 100) : 0;

      // Today's sessions (simple - just today in local time)
      const today = new Date().toISOString().split('T')[0];
      const todaySessions = allSessions.filter(session => {
        if (!session.start_time) return false;
        const sessionDate = new Date(session.start_time).toISOString().split('T')[0];
        return sessionDate === today;
      });

      const todayStudyTimeMinutes = todaySessions.reduce((acc, s) => acc + (s.duration || 0), 0);
      const todayStudyTime = Math.round((todayStudyTimeMinutes / 60) * 10) / 10;

      // This week's sessions (simple - last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekSessions = allSessions.filter(session => {
        if (!session.start_time) return false;
        const sessionDate = new Date(session.start_time);
        return sessionDate >= weekAgo;
      });

      const weeklyStudyTimeMinutes = weekSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
      const weeklyStudyTime = Math.round((weeklyStudyTimeMinutes / 60) * 10) / 10;

      // Simple streak calculation
      let streakDays = 0;
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - i);
        const dayString = checkDate.toISOString().split('T')[0];
        
        const hasSessions = allSessions.some(session => {
          if (!session.start_time) return false;
          const sessionDate = new Date(session.start_time).toISOString().split('T')[0];
          return sessionDate === dayString;
        });
        
        if (hasSessions) {
          streakDays++;
        } else if (i > 0) {
          break;
        }
      }

      const weeklyGoalMinutes = 600; // 10 hours default
      const weeklyGoalProgress = Math.min(Math.round((weeklyStudyTimeMinutes / weeklyGoalMinutes) * 100), 100);

      const result = {
        // Session metrics
        totalSessions: allSessions.length,
        todaySessions: todaySessions.length,
        weeklySessions: weekSessions.length,
        averageSessionTime: completedSessions.length > 0 ? Math.round(totalStudyTimeMinutes / completedSessions.length) : 0,
        activeSessions: activeSessions,
        
        // Time metrics
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
        totalQuizzes: quizzes?.length || 0,
        completedQuizzes: allSessions.filter(s => (s.quiz_total_questions || 0) > 0).length,
        totalNotes: notes?.length || 0,
        totalCardsMastered: totalCardsCorrect,
        totalSets: flashcardSets?.length || 0,
        totalCardsReviewed,
        flashcardAccuracy,
        
        // Other
        streakDays,
        recentSessions: allSessions.slice(0, 10),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        todayString: today
      };

      return result;
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
