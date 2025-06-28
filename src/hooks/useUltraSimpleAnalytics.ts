import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useUltraSimpleAnalytics = () => {
  const { user } = useAuth();

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['ultra-simple-analytics', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      console.log('📊 Fetching analytics for user:', user.id);

      try {
        // Get timezone-aware date boundaries
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const now = new Date();
        
        // Calculate today in user's timezone
        const today = new Date(now.toLocaleString("en-US", { timeZone: userTimezone }));
        today.setHours(0, 0, 0, 0);
        const todayEnd = new Date(today);
        todayEnd.setDate(today.getDate() + 1);
        
        // Calculate week boundaries (Sunday to Saturday)
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        
        // Calculate previous week for comparison
        const startOfPrevWeek = new Date(startOfWeek);
        startOfPrevWeek.setDate(startOfWeek.getDate() - 7);
        const endOfPrevWeek = new Date(startOfWeek);

        // Get all sessions with proper filtering
        const { data: allSessions, error: sessionsError } = await supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .not('duration', 'is', null)
          .gte('duration', 0)
          .lte('duration', 28800) // Max 8 hours
          .order('start_time', { ascending: false });

        if (sessionsError) throw sessionsError;

        const sessions = allSessions || [];
        console.log('📊 Found sessions:', sessions.length);

        // Get content counts
        const [flashcardSets, notes, quizzes] = await Promise.all([
          supabase.from('flashcard_sets').select('id').eq('user_id', user.id),
          supabase.from('notes').select('id').eq('user_id', user.id),
          supabase.from('quizzes').select('id').eq('user_id', user.id)
        ]);

        // Filter sessions by time periods
        const todaySessions = sessions.filter(session => {
          if (!session.start_time) return false;
          const sessionDate = new Date(session.start_time);
          return sessionDate >= today && sessionDate < todayEnd;
        });

        const weekSessions = sessions.filter(session => {
          if (!session.start_time) return false;
          const sessionDate = new Date(session.start_time);
          return sessionDate >= startOfWeek;
        });

        const prevWeekSessions = sessions.filter(session => {
          if (!session.start_time) return false;
          const sessionDate = new Date(session.start_time);
          return sessionDate >= startOfPrevWeek && sessionDate < endOfPrevWeek;
        });

        // Calculate streak properly
        let streakDays = 0;
        const sessionDates = new Set();
        
        // Group sessions by date
        sessions.forEach(session => {
          if (session.start_time && session.duration && session.duration > 0) {
            const sessionDate = new Date(session.start_time).toDateString();
            sessionDates.add(sessionDate);
          }
        });

        // Calculate consecutive days from today backwards
        const sortedDates = Array.from(sessionDates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        const todayStr = today.toDateString();
        
        if (sortedDates.includes(todayStr)) {
          streakDays = 1;
          // Check consecutive days backwards
          for (let i = 1; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            if (sortedDates.includes(checkDate.toDateString())) {
              streakDays++;
            } else {
              break;
            }
          }
        }

        // Calculate metrics with proper validation
        const completedSessions = sessions.filter(s => !s.is_active && s.duration && s.duration > 0);
        const totalStudyTimeMinutes = completedSessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60;
        const todayStudyTimeMinutes = todaySessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60;
        const weeklyStudyTimeMinutes = weekSessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60;
        const prevWeekStudyTimeMinutes = prevWeekSessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60;

        // Calculate cards metrics
        const totalCardsReviewed = sessions.reduce((acc, s) => acc + (s.cards_reviewed || 0), 0);
        const totalCardsCorrect = sessions.reduce((acc, s) => acc + (s.cards_correct || 0), 0);
        const flashcardAccuracy = totalCardsReviewed > 0 ? Math.round((totalCardsCorrect / totalCardsReviewed) * 100) : 0;

        // Weekly goal tracking
        const weeklyGoalMinutes = 600; // 10 hours default
        const weeklyGoalProgress = Math.min(Math.round((weeklyStudyTimeMinutes / weeklyGoalMinutes) * 100), 100);

        // Calculate weekly change
        const weeklyChange = prevWeekStudyTimeMinutes > 0 
          ? Math.round(((weeklyStudyTimeMinutes - prevWeekStudyTimeMinutes) / prevWeekStudyTimeMinutes) * 100)
          : weeklyStudyTimeMinutes > 0 ? 100 : 0;

        const result = {
          // Session metrics
          totalSessions: sessions.length,
          todaySessions: todaySessions.length,
          weeklySessions: weekSessions.length,
          averageSessionTime: completedSessions.length > 0 ? Math.round(totalStudyTimeMinutes / completedSessions.length) : 0,
          activeSessions: sessions.filter(s => s.is_active),
          
          // Time metrics
          totalStudyTime: Math.round((totalStudyTimeMinutes / 60) * 10) / 10,
          totalStudyTimeMinutes: Math.round(totalStudyTimeMinutes),
          todayStudyTime: Math.round((todayStudyTimeMinutes / 60) * 10) / 10,
          todayStudyTimeMinutes: Math.round(todayStudyTimeMinutes),
          weeklyStudyTime: Math.round((weeklyStudyTimeMinutes / 60) * 10) / 10,
          weeklyStudyTimeMinutes: Math.round(weeklyStudyTimeMinutes),
          previousWeekTimeMinutes: Math.round(prevWeekStudyTimeMinutes),
          
          // Goal tracking
          weeklyGoalProgress,
          weeklyGoalMinutes,
          weeklyGoalHours: Math.round((weeklyGoalMinutes / 60) * 10) / 10,
          weeklyChange,
          
          // Content metrics
          totalQuizzes: quizzes.data?.length || 0,
          completedQuizzes: sessions.filter(s => (s.quiz_total_questions || 0) > 0).length,
          totalNotes: notes.data?.length || 0,
          totalCardsMastered: totalCardsCorrect,
          totalSets: flashcardSets.data?.length || 0,
          totalCardsReviewed,
          flashcardAccuracy,
          
          // Other
          streakDays,
          recentSessions: sessions.slice(0, 10),
          timezone: userTimezone,
          todayString: today.toISOString().split('T')[0]
        };

        console.log('✅ Analytics calculated:', {
          totalSessions: result.totalSessions,
          weeklyStudyTime: result.weeklyStudyTime,
          streakDays: result.streakDays,
          flashcardAccuracy: result.flashcardAccuracy
        });

        return result;

      } catch (error) {
        console.error('❌ Analytics error:', error);
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
