
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
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

  // Get user's weekly goal
  const { data: weeklyGoal = 5, isLoading: goalLoading } = useQuery({
    queryKey: ['weekly-goal', user?.id],
    queryFn: async () => {
      if (!user) return 5;

      const { data, error } = await supabase
        .from('study_goals')
        .select('target_hours, end_date, start_date') 
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      // Calculate weekly hours from the most recent active goal
      if (data && data.target_hours && data.start_date && data.end_date) {
        const startDate = new Date(data.start_date);
        const endDate = new Date(data.end_date);
        const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (durationDays >= 7) {
          return Math.round((data.target_hours / durationDays) * 7);
        }
      }
      
      return 5; // Default fallback
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000,
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


    // Filter sessions
    const completedSessions = sessions.filter(s => !s.is_active && s.duration);
    const todaySessions = sessions.filter(s => new Date(s.start_time) >= today);
    const weeklySessions = sessions.filter(s => new Date(s.start_time) >= weekAgo);

    // Calculate times - session.duration is in seconds, convert to minutes
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

    // Calculate weekly changes from real historical data
    const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
    const previousWeekSessions = sessions.filter(s => {
      const sessionDate = new Date(s.start_time);
      return sessionDate >= twoWeeksAgo && sessionDate < weekAgo;
    });
    const previousWeekMinutes = previousWeekSessions.reduce((acc, session) => acc + (session.duration || 0), 0) / 60;
    
    const weeklyChange = previousWeekMinutes > 0 
      ? Math.round(((weeklyMinutes - previousWeekMinutes) / previousWeekMinutes) * 100) 
      : weeklyMinutes > 0 ? 100 : 0;

    // Calculate weekly goal progress from user's actual goals
    const weeklyGoalHours = weeklyGoal;
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

    
    return result;
  }, [sessions, notesCount, flashcardData, weeklyGoal]);

  const isLoading = sessionsLoading || notesLoading || flashcardLoading || goalLoading;

  return {
    analytics,
    isLoading
  };
};
