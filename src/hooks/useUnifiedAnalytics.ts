
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
  // Add missing properties
  flashcardAccuracy: number;
  totalCardsMastered: number;
  totalSets: number;
}

export const useUnifiedAnalytics = () => {
  const { user } = useAuth();

  // Removed console logging to improve performance - this was running on every render

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
    staleTime: 5 * 60 * 1000, // 5 minutes - reduced frequent refetching to prevent timer conflicts
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Prevent refetch on focus that could cause flickering
  });

  // Query for flashcard sets count
  const { data: flashcardSets = [] } = useQuery({
    queryKey: ["flashcard-sets-count", user?.id],
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
    staleTime: 10 * 60 * 1000, // 10 minutes - flashcard sets don't change frequently
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });

  // Query for flashcard progress
  const { data: flashcardProgress = [] } = useQuery({
    queryKey: ["flashcard-progress", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_flashcard_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes - progress doesn't change rapidly
    gcTime: 30 * 60 * 1000, // 30 minutes  
    refetchOnWindowFocus: false,
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
      weeklySessions: 0,
      flashcardAccuracy: 0,
      totalCardsMastered: 0,
      totalSets: 0
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const completedSessions = sessions.filter(s => !s.is_active && s.duration);
    const todaySessions = sessions.filter(s => new Date(s.start_time) >= today);
    const weeklySessions = sessions.filter(s => new Date(s.start_time) >= weekAgo);
    
    // Fix: session.duration is already in seconds, convert to minutes
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

    // Calculate flashcard metrics
    const masteredCards = flashcardProgress.filter(p => p.mastery_level >= 3).length;

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
      weeklySessions: weeklySessions.length,
      flashcardAccuracy: averageAccuracy,
      totalCardsMastered: masteredCards,
      totalSets: flashcardSets.length
    };
  }, [sessions, flashcardSets, flashcardProgress]);

  return {
    analytics,
    sessions,
    isLoading
  };
};
