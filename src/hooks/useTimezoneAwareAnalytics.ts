
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

export const useTimezoneAwareAnalytics = () => {
  const { user, userProfile } = useAuth();

  // Get user's timezone from profile
  const timezone = userProfile?.timezone || 'UTC';
  
  // Calculate today's date in user's timezone
  const todayInTimezone = useMemo(() => {
    try {
      const today = new Date();
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(today);
    } catch (error) {
      console.error('Error formatting date for timezone:', timezone, error);
      return new Date().toISOString().split('T')[0];
    }
  }, [timezone]);

  // Calculate week boundaries in user's timezone
  const { weekStart, weekEnd, lastWeekStart, lastWeekEnd } = useMemo(() => {
    try {
      const [year, month, day] = todayInTimezone.split('-').map(Number);
      const todayDate = new Date(year, month - 1, day);
      
      // Current week (Monday to Sunday)
      const dayOfWeek = todayDate.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      
      const thisWeekMonday = new Date(todayDate);
      thisWeekMonday.setDate(todayDate.getDate() - daysToMonday);
      
      const thisWeekSunday = new Date(thisWeekMonday);
      thisWeekSunday.setDate(thisWeekMonday.getDate() + 6);
      
      // Previous week
      const lastWeekMonday = new Date(thisWeekMonday);
      lastWeekMonday.setDate(thisWeekMonday.getDate() - 7);
      
      const lastWeekSunday = new Date(lastWeekMonday);
      lastWeekSunday.setDate(lastWeekMonday.getDate() + 6);
      
      return {
        weekStart: thisWeekMonday.toISOString().split('T')[0],
        weekEnd: thisWeekSunday.toISOString().split('T')[0],
        lastWeekStart: lastWeekMonday.toISOString().split('T')[0],
        lastWeekEnd: lastWeekSunday.toISOString().split('T')[0]
      };
    } catch (error) {
      console.error('Error calculating week boundaries:', error);
      const today = new Date().toISOString().split('T')[0];
      return {
        weekStart: today,
        weekEnd: today,
        lastWeekStart: today,
        lastWeekEnd: today
      };
    }
  }, [todayInTimezone]);

  // Query for study sessions
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["timezone-aware-sessions", user?.id, timezone],
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
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });

  // Query for flashcard data
  const { data: flashcardData, isLoading: flashcardLoading } = useQuery({
    queryKey: ["timezone-aware-flashcards", user?.id],
    queryFn: async () => {
      if (!user) return { sets: [], progress: [] };

      const [setsResult, progressResult] = await Promise.all([
        supabase
          .from('flashcard_sets')
          .select('id, name, card_count')
          .eq('user_id', user.id),
        supabase
          .from('user_flashcard_progress')
          .select('*')
          .eq('user_id', user.id)
      ]);

      return {
        sets: setsResult.data || [],
        progress: progressResult.data || []
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Query for user profile with weekly goal
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["user-profile-goal", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('weekly_study_goal_hours')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return { weekly_study_goal_hours: 5 }; // Default value
      }
      
      return data;
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000,
  });

  const analytics = useMemo(() => {
    if (!sessions.length && !flashcardData) {
      return {
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
        weeklyGoalProgress: 0,
        weeklyGoalMinutes: (profileData?.weekly_study_goal_hours || 5) * 60,
        weeklyGoalHours: profileData?.weekly_study_goal_hours || 5,
        flashcardAccuracy: 0,
        totalCardsMastered: 0,
        totalSets: flashcardData?.sets?.length || 0,
        totalCardsReviewed: 0,
        streakDays: 0,
        weeklyChange: 0,
        recentSessions: [],
        timezone,
        todayString: todayInTimezone
      };
    }

    // Filter sessions by time periods
    const todaySessions = sessions.filter(s => 
      s.start_time.startsWith(todayInTimezone)
    );

    const weeklySessions = sessions.filter(s => {
      const sessionDate = s.start_time.split('T')[0];
      return sessionDate >= weekStart && sessionDate <= weekEnd;
    });

    const lastWeekSessions = sessions.filter(s => {
      const sessionDate = s.start_time.split('T')[0];
      return sessionDate >= lastWeekStart && sessionDate <= lastWeekEnd;
    });

    const completedSessions = sessions.filter(s => !s.is_active && s.duration);

    // Calculate time metrics
    const totalMinutes = completedSessions.reduce((acc, session) => acc + (session.duration || 0), 0) / 60;
    const todayMinutes = todaySessions.reduce((acc, session) => acc + (session.duration || 0), 0) / 60;
    const weeklyMinutes = weeklySessions.reduce((acc, session) => acc + (session.duration || 0), 0) / 60;
    const previousWeekMinutes = lastWeekSessions.reduce((acc, session) => acc + (session.duration || 0), 0) / 60;

    const totalHours = Math.round(totalMinutes * 10) / 10;
    const averageDuration = completedSessions.length ? Math.round((totalMinutes * 60) / completedSessions.length) : 0;

    // Calculate weekly goal progress
    const weeklyGoalHours = profileData?.weekly_study_goal_hours || 5;
    const weeklyGoalMinutes = weeklyGoalHours * 60;
    const weeklyGoalProgress = weeklyGoalMinutes > 0 ? Math.min(100, (weeklyMinutes / weeklyGoalMinutes) * 100) : 0;

    // Calculate weekly change
    const weeklyChange = previousWeekMinutes > 0 
      ? Math.round(((weeklyMinutes - previousWeekMinutes) / previousWeekMinutes) * 100)
      : weeklyMinutes > 0 ? 100 : 0;

    // Flashcard metrics
    const totalSets = flashcardData?.sets?.length || 0;
    const totalProgress = flashcardData?.progress || [];
    const totalCardsReviewed = totalProgress.length;
    const masteredCards = totalProgress.filter(p => p.mastery_level >= 3).length;
    const correctCards = totalProgress.filter(p => (p.last_score || 0) >= 3).length;
    const flashcardAccuracy = totalCardsReviewed > 0 ? Math.round((correctCards / totalCardsReviewed) * 100) : 0;

    // Calculate streak (simplified)
    const studyDates = [...new Set(sessions.map(s => s.start_time.split('T')[0]))].sort().reverse();
    let streakDays = 0;
    
    if (studyDates.includes(todayInTimezone)) {
      streakDays = 1;
      const todayDateObj = new Date(todayInTimezone);
      for (let i = 1; i < studyDates.length; i++) {
        const expectedDate = new Date(todayDateObj.getTime() - i * 24 * 60 * 60 * 1000);
        const expectedDateStr = expectedDate.toISOString().split('T')[0];
        if (studyDates.includes(expectedDateStr)) {
          streakDays++;
        } else {
          break;
        }
      }
    }

    return {
      totalSessions: sessions.length,
      todaySessions: todaySessions.length,
      weeklySessions: weeklySessions.length,
      averageSessionTime: averageDuration,
      activeSessions: sessions.filter(s => s.is_active).length,
      totalStudyTime: totalHours,
      totalStudyTimeMinutes: Math.round(totalMinutes),
      todayStudyTimeMinutes: Math.round(todayMinutes),
      weeklyStudyTimeMinutes: Math.round(weeklyMinutes),
      previousWeekTimeMinutes: Math.round(previousWeekMinutes),
      weeklyGoalProgress: Math.round(weeklyGoalProgress),
      weeklyGoalMinutes,
      weeklyGoalHours,
      flashcardAccuracy,
      totalCardsMastered: masteredCards,
      totalSets,
      totalCardsReviewed,
      streakDays,
      weeklyChange,
      recentSessions: sessions.slice(0, 10),
      timezone,
      todayString: todayInTimezone
    };
  }, [sessions, flashcardData, profileData, todayInTimezone, weekStart, weekEnd, lastWeekStart, lastWeekEnd, timezone]);

  return {
    analytics,
    isLoading: sessionsLoading || flashcardLoading || profileLoading
  };
};
