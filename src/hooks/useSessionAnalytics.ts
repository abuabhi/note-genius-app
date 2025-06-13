
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export interface SessionAnalytics {
  totalSessions: number;
  activeSessions: number;
  totalStudyTime: number;
  averageSessionTime: number;
  totalCardsReviewed: number;
  totalCardsCorrect: number;
  averageAccuracy: number;
  totalQuizzesTaken: number;
  recentSessions: any[];
}

export const useSessionAnalytics = () => {
  const { user } = useAuth();

  console.log('📊 [SESSION ANALYTICS] Using unified session data from SessionDock only');

  // Query for all session data (READ-ONLY for analytics)
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["session-analytics", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Calculate analytics from unified session data
  const analytics = useMemo((): SessionAnalytics => {
    if (!sessions.length) return {
      totalSessions: 0,
      activeSessions: 0,
      totalStudyTime: 0,
      averageSessionTime: 0,
      totalCardsReviewed: 0,
      totalCardsCorrect: 0,
      averageAccuracy: 0,
      totalQuizzesTaken: 0,
      recentSessions: []
    };

    const completedSessions = sessions.filter(s => !s.is_active && s.duration);
    const totalMinutes = completedSessions.reduce((acc, session) => acc + (session.duration || 0), 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    const averageDuration = completedSessions.length ? Math.round(totalMinutes / completedSessions.length) : 0;
    
    const totalCardsReviewed = sessions.reduce((acc, s) => acc + (s.cards_reviewed || 0), 0);
    const totalCardsCorrect = sessions.reduce((acc, s) => acc + (s.cards_correct || 0), 0);
    const averageAccuracy = totalCardsReviewed > 0 ? Math.round((totalCardsCorrect / totalCardsReviewed) * 100) : 0;
    
    const totalQuizzesTaken = sessions.filter(s => (s.quiz_total_questions || 0) > 0).length;

    return {
      totalSessions: sessions.length,
      activeSessions: sessions.filter(s => s.is_active).length,
      totalStudyTime: totalHours,
      averageSessionTime: averageDuration,
      totalCardsReviewed,
      totalCardsCorrect,
      averageAccuracy,
      totalQuizzesTaken,
      recentSessions: sessions.slice(0, 10) // Last 10 sessions
    };
  }, [sessions]);

  return {
    analytics,
    sessions,
    isLoading
  };
};
