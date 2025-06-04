
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useFlashcards } from '@/contexts/FlashcardContext';
import { useStreakCalculation } from '@/hooks/useStreakCalculation';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export interface UnifiedStudyStats {
  // Session stats
  totalHours: number;
  averageDuration: number;
  totalSessions: number;
  activeSessions: number;
  
  // Progress stats
  totalCardsMastered: number;
  flashcardAccuracy: number;
  cardsReviewedToday: number;
  totalCardsReviewed: number;
  
  // General stats
  streakDays: number;
  totalSets: number;
  studyTimeHours: number;
  
  // Today's activity
  todayStudyMinutes: number;
  todaySessionCount: number;
}

export const useUnifiedStudyStats = () => {
  const { user } = useAuth();
  const { flashcardSets, loading: flashcardsLoadingState } = useFlashcards();
  const { streak } = useStreakCalculation();

  // Handle complex loading state from useFlashcards
  const flashcardsLoading = typeof flashcardsLoadingState === 'boolean' 
    ? flashcardsLoadingState 
    : flashcardsLoadingState?.flashcards || false;

  const { data: stats = {
    totalHours: 0,
    averageDuration: 0,
    totalSessions: 0,
    activeSessions: 0,
    totalCardsMastered: 0,
    flashcardAccuracy: 0,
    cardsReviewedToday: 0,
    totalCardsReviewed: 0,
    streakDays: streak,
    totalSets: flashcardSets?.length || 0,
    studyTimeHours: 0,
    todayStudyMinutes: 0,
    todaySessionCount: 0
  }, isLoading, error } = useQuery({
    queryKey: ['unified-study-stats', user?.id, streak],
    queryFn: async (): Promise<UnifiedStudyStats> => {
      if (!user) throw new Error("User not authenticated");

      // Get today's boundaries
      const today = new Date();
      const startOfToday = startOfDay(today).toISOString();
      const endOfToday = endOfDay(today).toISOString();

      // Fetch all data in parallel
      const [
        { data: studySessions },
        { data: todaySessions },
        { data: flashcardProgress },
        { data: todayReviews }
      ] = await Promise.all([
        // All study sessions
        supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('start_time', { ascending: false }),
        
        // Today's sessions
        supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .gte('start_time', startOfToday)
          .lte('start_time', endOfToday),
        
        // All flashcard progress
        supabase
          .from('user_flashcard_progress')
          .select('*')
          .eq('user_id', user.id),
        
        // Today's reviews
        supabase
          .from('user_flashcard_progress')
          .select('*')
          .eq('user_id', user.id)
          .gte('last_reviewed_at', startOfToday)
          .lte('last_reviewed_at', endOfToday)
      ]);

      // Calculate session statistics
      const completedSessions = studySessions?.filter(s => !s.is_active && s.duration) || [];
      const totalMinutes = completedSessions.reduce((acc, session) => acc + (session.duration || 0), 0);
      const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
      const averageDuration = completedSessions.length ? Math.round(totalMinutes / completedSessions.length) : 0;
      const activeSessions = studySessions?.filter(s => s.is_active).length || 0;

      // Calculate today's activity
      const todayMinutes = todaySessions?.reduce((total, session) => 
        total + (session.duration ? Math.round(session.duration / 60) : 0), 0) || 0;
      const todaySessionCount = todaySessions?.length || 0;

      // Calculate flashcard accuracy
      let flashcardAccuracy = 0;
      if (flashcardProgress && flashcardProgress.length > 0) {
        const recentReviews = flashcardProgress.filter(p => p.last_score !== null);
        if (recentReviews.length > 0) {
          const totalScore = recentReviews.reduce((sum, p) => sum + (p.last_score || 0), 0);
          flashcardAccuracy = Math.round((totalScore / (recentReviews.length * 5)) * 100);
        }
      }

      // Calculate mastered cards
      const masteredCards = flashcardProgress?.filter(p => 
        p.ease_factor && p.ease_factor >= 2.5 && 
        p.interval && p.interval >= 7
      ).length || 0;

      return {
        totalHours,
        averageDuration,
        totalSessions: studySessions?.length || 0,
        activeSessions,
        totalCardsMastered: masteredCards,
        flashcardAccuracy,
        cardsReviewedToday: todayReviews?.length || 0,
        totalCardsReviewed: flashcardProgress?.length || 0,
        streakDays: streak,
        totalSets: flashcardSets?.length || 0,
        studyTimeHours: totalHours,
        todayStudyMinutes: todayMinutes,
        todaySessionCount
      };
    },
    enabled: !!user && !flashcardsLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60000 // 1 minute
  });

  return { 
    stats, 
    isLoading: isLoading || flashcardsLoading,
    error
  };
};
