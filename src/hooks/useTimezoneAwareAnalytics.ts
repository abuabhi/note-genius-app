
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useTimezone } from './useTimezone';
import { useMemo } from 'react';

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

  // Query for study sessions with timezone awareness
  const { data: sessions = [], isLoading, error } = useQuery({
    queryKey: ['timezone-aware-analytics', user?.id, timezone],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('auto_created', false)
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !timezoneLoading,
    staleTime: 1 * 60 * 1000,
  });

  // Query for flashcard sets to get totalSets
  const { data: flashcardSets = [] } = useQuery({
    queryKey: ['user-flashcard-sets', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('id')
        .eq('user_id', user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Calculate analytics with timezone-aware date boundaries
  const analytics = useMemo(() => {
    if (!sessions.length || !timezone) return {
      totalSessions: 0,
      todaySessions: 0,
      weeklySessions: 0,
      averageSessionTime: 0,
      activeSessions: 0,
      totalStudyTime: 0,
      totalStudyTimeMinutes: 0,
      todayStudyTimeMinutes: 0,
      weeklyStudyTimeMinutes: 0,
      previousWeekTimeMinutes: 0,
      totalCardsMastered: 0,
      totalCardsReviewed: 0,
      flashcardAccuracy: 0,
      streakDays: 0,
      weeklyGoalMinutes: 300, // 5 hours default
      weeklyGoalProgress: 0,
      weeklyChange: 0,
      todayString: new Date().toISOString().split('T')[0],
      totalSets: flashcardSets.length,
      recentSessions: [],
      timezone: timezone || 'UTC'
    };

    // Calculate date boundaries in the user's timezone
    const now = new Date();
    const todayInTimezone = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now);
    
    const [year, month, day] = todayInTimezone.split('-').map(Number);
    const todayDate = new Date(year, month - 1, day);
    
    // Week boundaries (Monday to Sunday)
    const dayOfWeek = todayDate.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    const thisWeekMonday = new Date(todayDate);
    thisWeekMonday.setDate(todayDate.getDate() - daysToMonday);
    
    const lastWeekMonday = new Date(thisWeekMonday);
    lastWeekMonday.setDate(thisWeekMonday.getDate() - 7);
    
    const lastWeekSunday = new Date(thisWeekMonday);
    lastWeekSunday.setDate(thisWeekMonday.getDate() - 1);

    // Filter sessions by time periods
    const todaySessions = sessions.filter(session => {
      const sessionDate = new Date(session.start_time);
      return sessionDate >= todayDate && sessionDate < new Date(todayDate.getTime() + 24 * 60 * 60 * 1000);
    });

    const thisWeekSessions = sessions.filter(session => {
      const sessionDate = new Date(session.start_time);
      return sessionDate >= thisWeekMonday;
    });

    const lastWeekSessions = sessions.filter(session => {
      const sessionDate = new Date(session.start_time);
      return sessionDate >= lastWeekMonday && sessionDate <= lastWeekSunday;
    });

    const completedSessions = sessions.filter(s => !s.is_active && s.duration);
    const todayCompletedSessions = todaySessions.filter(s => !s.is_active && s.duration);
    const thisWeekCompletedSessions = thisWeekSessions.filter(s => !s.is_active && s.duration);
    const lastWeekCompletedSessions = lastWeekSessions.filter(s => !s.is_active && s.duration);

    // Calculate time metrics (convert from seconds to minutes)
    const totalStudyTimeMinutes = Math.round(
      completedSessions.reduce((acc, session) => acc + (session.duration || 0), 0) / 60
    );
    
    const todayStudyTimeMinutes = Math.round(
      todayCompletedSessions.reduce((acc, session) => acc + (session.duration || 0), 0) / 60
    );
    
    const weeklyStudyTimeMinutes = Math.round(
      thisWeekCompletedSessions.reduce((acc, session) => acc + (session.duration || 0), 0) / 60
    );
    
    const previousWeekTimeMinutes = Math.round(
      lastWeekCompletedSessions.reduce((acc, session) => acc + (session.duration || 0), 0) / 60
    );

    const totalStudyTime = Math.round(totalStudyTimeMinutes / 60 * 10) / 10;
    const averageSessionTime = completedSessions.length ? Math.round((totalStudyTimeMinutes * 60) / completedSessions.length) : 0;

    // Calculate flashcard metrics
    const totalCardsMastered = sessions.reduce((acc, s) => acc + (s.cards_correct || 0), 0);
    const totalCardsReviewed = sessions.reduce((acc, s) => acc + (s.cards_reviewed || 0), 0);
    const flashcardAccuracy = totalCardsReviewed > 0 ? Math.round((totalCardsMastered / totalCardsReviewed) * 100) : 0;

    // Calculate streak (simplified)
    const studyDates = [...new Set(sessions.map(s => s.start_time.split('T')[0]))].sort().reverse();
    let streakDays = 0;
    const todayStr = todayInTimezone;
    
    if (studyDates.includes(todayStr)) {
      streakDays = 1;
      for (let i = 1; i < studyDates.length; i++) {
        const expectedDate = new Date(todayDate.getTime() - i * 24 * 60 * 60 * 1000);
        const expectedDateStr = new Intl.DateTimeFormat('en-CA', {
          timeZone: timezone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).format(expectedDate);
        
        if (studyDates.includes(expectedDateStr)) {
          streakDays++;
        } else {
          break;
        }
      }
    }

    // Weekly goal calculations
    const weeklyGoalMinutes = 300; // 5 hours default
    const weeklyGoalProgress = weeklyGoalMinutes > 0 ? Math.min(100, Math.round((weeklyStudyTimeMinutes / weeklyGoalMinutes) * 100)) : 0;
    
    // Weekly change calculation
    const weeklyChange = previousWeekTimeMinutes > 0 
      ? Math.round(((weeklyStudyTimeMinutes - previousWeekTimeMinutes) / previousWeekTimeMinutes) * 100)
      : weeklyStudyTimeMinutes > 0 ? 100 : 0;

    return {
      totalSessions: sessions.length,
      todaySessions: todaySessions.length,
      weeklySessions: thisWeekSessions.length,
      averageSessionTime,
      activeSessions: sessions.filter(s => s.is_active).length,
      totalStudyTime,
      totalStudyTimeMinutes,
      todayStudyTimeMinutes,
      weeklyStudyTimeMinutes,
      previousWeekTimeMinutes,
      totalCardsMastered,
      totalCardsReviewed,
      flashcardAccuracy,
      streakDays,
      weeklyGoalMinutes,
      weeklyGoalProgress,
      weeklyChange,
      todayString: todayInTimezone,
      totalSets: flashcardSets.length,
      recentSessions: sessions.slice(0, 10),
      timezone: timezone || 'UTC'
    };
  }, [sessions, timezone, flashcardSets.length]);

  return {
    analytics,
    timezone,
    isLoading: isLoading || timezoneLoading,
    error
  };
};
