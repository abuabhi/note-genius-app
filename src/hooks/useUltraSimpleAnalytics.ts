
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

export interface UltraSimpleAnalytics {
  totalSessions: number;
  totalStudyTime: number;
  totalStudyTimeMinutes: number;
  todayStudyTimeMinutes: number;
  weeklyStudyTimeMinutes: number;
  streakDays: number;
  totalSets: number;
  totalNotes: number;
  todayStudyTime: number;
  flashcardAccuracy: number;
  recentSessions: any[];
  weeklyChange: number;
  previousWeekTimeMinutes: number;
  weeklyGoalProgress: number;
  weeklyGoalHours: number;
  totalCardsMastered: number;
}

export const useUltraSimpleAnalytics = () => {
  const { user } = useAuth();

  console.log('🎯 [ULTRA-SIMPLE] Loading analytics with essential data only');

  // Get study sessions
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['ultra-simple-sessions', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });

  // Get notes count
  const { data: notesCount = 0, isLoading: notesLoading } = useQuery({
    queryKey: ['ultra-simple-notes-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const { count, error } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Get flashcard data with better type handling
  const { data: flashcardData, isLoading: flashcardLoading } = useQuery({
    queryKey: ['ultra-simple-flashcard-data', user?.id],
    queryFn: async () => {
      if (!user) return { sets: [], progress: [] };

      try {
        const [setsResult, progressResult] = await Promise.all([
          supabase
            .from('flashcard_sets')
            .select('id, name, subject, card_count')
            .eq('user_id', user.id),
          supabase
            .from('user_flashcard_progress')
            .select('flashcard_id, mastery_level, last_reviewed_at')
            .eq('user_id', user.id)
        ]);

        if (setsResult.error) throw setsResult.error;
        if (progressResult.error) throw progressResult.error;

        return {
          sets: setsResult.data || [],
          progress: progressResult.data || []
        };
      } catch (error) {
        console.error('Error fetching flashcard data:', error);
        return { sets: [], progress: [] };
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Calculate analytics
  const analytics = useMemo((): UltraSimpleAnalytics => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    console.log('[ULTRA-SIMPLE] Calculating analytics from data:', {
      sessionsCount: sessions.length,
      notesCount,
      flashcardSetsCount: flashcardData?.sets?.length || 0
    });

    // Filter sessions
    const completedSessions = sessions.filter(s => !s.is_active && s.duration);
    const todaySessions = sessions.filter(s => new Date(s.start_time) >= today);
    const weeklySessions = sessions.filter(s => new Date(s.start_time) >= weekAgo);

    // Calculate times
    const totalMinutes = completedSessions.reduce((acc, session) => acc + (session.duration || 0), 0) / 60;
    const todayMinutes = todaySessions.reduce((acc, session) => acc + (session.duration || 0), 0) / 60;
    const weeklyMinutes = weeklySessions.reduce((acc, session) => acc + (session.duration || 0), 0) / 60;

    // Calculate streak
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
    const flashcardSets = flashcardData?.sets || [];
    const flashcardProgress = flashcardData?.progress || [];
    
    const totalCardsReviewed = sessions.reduce((acc, s) => acc + (s.cards_reviewed || 0), 0);
    const totalCardsCorrect = sessions.reduce((acc, s) => acc + (s.cards_correct || 0), 0);
    const flashcardAccuracy = totalCardsReviewed > 0 
      ? Math.round((totalCardsCorrect / totalCardsReviewed) * 100) 
      : 0;

    const masteredCards = flashcardProgress.filter(p => p.mastery_level >= 3).length;

    // Calculate weekly changes (simplified)
    const previousWeekMinutes = Math.max(0, weeklyMinutes - 30); // Placeholder
    const weeklyChange = previousWeekMinutes > 0 
      ? Math.round(((weeklyMinutes - previousWeekMinutes) / previousWeekMinutes) * 100) 
      : 0;

    // Calculate weekly goal progress
    const weeklyGoalHours = 5; // Default goal
    const weeklyGoalProgress = weeklyMinutes > 0 
      ? Math.min(100, Math.round((weeklyMinutes / (weeklyGoalHours * 60)) * 100))
      : 0;

    const result = {
      totalSessions: sessions.length,
      totalStudyTime: Math.round(totalMinutes * 10) / 10,
      totalStudyTimeMinutes: Math.round(totalMinutes),
      todayStudyTimeMinutes: Math.round(todayMinutes),
      todayStudyTime: Math.round(todayMinutes),
      weeklyStudyTimeMinutes: Math.round(weeklyMinutes),
      streakDays,
      totalSets: flashcardSets.length,
      totalNotes: notesCount,
      flashcardAccuracy,
      recentSessions: sessions.slice(0, 10),
      weeklyChange,
      previousWeekTimeMinutes: Math.round(previousWeekMinutes),
      weeklyGoalProgress,
      weeklyGoalHours,
      totalCardsMastered: masteredCards
    };

    console.log('[ULTRA-SIMPLE] Final analytics:', result);
    return result;
  }, [sessions, notesCount, flashcardData]);

  const isLoading = sessionsLoading || notesLoading || flashcardLoading;

  return {
    analytics,
    isLoading
  };
};
