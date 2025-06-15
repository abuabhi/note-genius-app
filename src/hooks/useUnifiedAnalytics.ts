
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

export interface UnifiedAnalytics {
  totalSessions: number;
  activeSessions: number;
  totalStudyTime: number;
  totalStudyTimeMinutes: number;
  todayStudyTimeMinutes: number;
  weeklyStudyTimeMinutes: number;
  averageSessionTime: number;
  totalCardsReviewed: number;
  totalCardsCorrect: number;
  averageAccuracy: number;
  totalQuizzesTaken: number;
  streakDays: number;
  weeklyChange: number;
  recentSessions: any[];
  todaySessions: number;
  weeklySessions: number;
}

export const useUnifiedAnalytics = () => {
  const { user } = useAuth();

  console.log('📊 [UNIFIED ANALYTICS] Using only real sessions from unified tracker');

  // Query for unified session data (real sessions only)
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["unified-analytics", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('auto_created', false) // Only real sessions
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Calculate unified analytics
  const analytics = useMemo((): UnifiedAnalytics => {
    if (!sessions.length) return {
      totalSessions: 0,
      activeSessions: 0,
      totalStudyTime: 0,
      totalStudyTimeMinutes: 0,
      todayStudyTimeMinutes: 0,
      weeklyStudyTimeMinutes: 0,
      averageSessionTime: 0,
      totalCardsReviewed: 0,
      totalCardsCorrect: 0,
      averageAccuracy: 0,
      totalQuizzesTaken: 0,
      streakDays: 0,
      weeklyChange: 0,
      recentSessions: [],
      todaySessions: 0,
      weeklySessions: 0
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const completedSessions = sessions.filter(s => !s.is_active && s.duration);
    const todaySessions = sessions.filter(s => new Date(s.start_time) >= today);
    const weeklySessions = sessions.filter(s => new Date(s.start_time) >= weekAgo);
    
    const totalMinutes = completedSessions.reduce((acc, session) => acc + (session.duration || 0), 0) / 60;
    const todayMinutes = todaySessions.reduce((acc, session) => acc + (session.duration || 0), 0) / 60;
    const weeklyMinutes = weeklySessions.reduce((acc, session) => acc + (session.duration || 0), 0) / 60;
    
    const totalHours = Math.round(totalMinutes * 10) / 10;
    const averageDuration = completedSessions.length ? Math.round((totalMinutes * 60) / completedSessions.length) : 0;
    
    const totalCardsReviewed = sessions.reduce((acc, s) => acc + (s.cards_reviewed || 0), 0);
    const totalCardsCorrect = sessions.reduce((acc, s) => acc + (s.cards_correct || 0), 0);
    const averageAccuracy = totalCardsReviewed > 0 ? Math.round((totalCardsCorrect / totalCardsReviewed) * 100) : 0;
    
    const totalQuizzesTaken = sessions.filter(s => (s.quiz_total_questions || 0) > 0).length;
    
    // Calculate streak (simplified)
    const studyDates = [...new Set(sessions.map(s => s.start_time.split('T')[0]))].sort().reverse();
    let streakDays = 0;
    const todayStr = today.toISOString().split('T')[0];
    
    if (studyDates.includes(todayStr)) {
      streakDays = 1;
      for (let i = 1; i < studyDates.length; i++) {
        const expectedDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        if (studyDates.includes(expectedDate)) {
          streakDays++;
        } else {
          break;
        }
      }
    }

    return {
      totalSessions: sessions.length,
      activeSessions: sessions.filter(s => s.is_active).length,
      totalStudyTime: totalHours,
      totalStudyTimeMinutes: Math.round(totalMinutes),
      todayStudyTimeMinutes: Math.round(todayMinutes),
      weeklyStudyTimeMinutes: Math.round(weeklyMinutes),
      averageSessionTime: averageDuration,
      totalCardsReviewed,
      totalCardsCorrect,
      averageAccuracy,
      totalQuizzesTaken,
      streakDays,
      weeklyChange: 0, // Simplified for now
      recentSessions: sessions.slice(0, 10),
      todaySessions: todaySessions.length,
      weeklySessions: weeklySessions.length
    };
  }, [sessions]);

  return {
    analytics,
    sessions,
    isLoading
  };
};
