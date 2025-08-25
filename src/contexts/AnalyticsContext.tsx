import React, { createContext, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  // Core metrics
  totalSessions: number;
  activeSessions: number;
  totalStudyTime: number;
  totalStudyTimeMinutes: number;
  todayStudyTimeMinutes: number;
  weeklyStudyTimeMinutes: number;
  averageSessionTime: number;
  streakDays: number;
  
  // Flashcard metrics
  totalFlashcardSets: number;
  totalFlashcards: number;
  totalCardsMastered: number;
  flashcardAccuracy: number;
  totalCardsReviewed: number;
  totalCardsCorrect: number;
  totalSets: number; // Alias for totalFlashcardSets for backward compatibility
  
  // Notes metrics
  totalNotes: number;
  recentNotes: number;
  monthlyNotes: number;
  
  // Quiz metrics
  totalQuizzes: number;
  totalQuizzesTaken: number;
  
  // Collections
  recentSessions: any[];
  subjects: any[];
  
  // Calculated metrics
  weeklyChange: number;
  weeklyGoalProgress: number;
  weeklyGoalMinutes: number;
  averageAccuracy: number;
  timezone: string;
  todayString: string;
}

interface AnalyticsContextType {
  analytics: AnalyticsData;
  isLoading: boolean;
  error: Error | null;
}

const defaultAnalytics: AnalyticsData = {
  totalSessions: 0,
  activeSessions: 0,
  totalStudyTime: 0,
  totalStudyTimeMinutes: 0,
  todayStudyTimeMinutes: 0,
  weeklyStudyTimeMinutes: 0,
  averageSessionTime: 0,
  streakDays: 0,
  totalFlashcardSets: 0,
  totalFlashcards: 0,
  totalCardsMastered: 0,
  flashcardAccuracy: 0,
  totalCardsReviewed: 0,
  totalCardsCorrect: 0,
  totalSets: 0,
  totalNotes: 0,
  recentNotes: 0,
  monthlyNotes: 0,
  totalQuizzes: 0,
  totalQuizzesTaken: 0,
  recentSessions: [],
  subjects: [],
  weeklyChange: 0,
  weeklyGoalProgress: 0,
  weeklyGoalMinutes: 0,
  averageAccuracy: 0,
  timezone: 'UTC',
  todayString: new Date().toLocaleDateString(),
};

const AnalyticsContext = createContext<AnalyticsContextType>({
  analytics: defaultAnalytics,
  isLoading: false,
  error: null,
});

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // Single consolidated query for all analytics data
  const { data: rawData, isLoading, error } = useQuery({
    queryKey: ['consolidated-analytics', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Fetch all required data in parallel with optimized queries
      const [sessionsData, flashcardData, notesData, quizzesData] = await Promise.all([
        // Study sessions with specific columns
        supabase
          .from('study_sessions')
          .select(`
            id, start_time, end_time, duration, is_active, 
            cards_reviewed, cards_correct, quiz_score, quiz_total_questions,
            subject, title, created_at
          `)
          .eq('user_id', user.id)
          .order('start_time', { ascending: false })
          .limit(50),

        // Flashcard data with joins
        supabase
          .from('flashcard_sets')
          .select(`
            id, name, subject, card_count, created_at,
            flashcards!inner(
              id,
              user_flashcard_progress(mastery_level, last_reviewed_at, repetition, last_score)
            )
          `)
          .eq('user_id', user.id),

        // Notes count and recent activity
        supabase
          .from('notes')
          .select('id, subject, created_at')
          .eq('user_id', user.id),

        // Quizzes count
        supabase
          .from('quizzes')
          .select('id, created_at')
          .eq('user_id', user.id)
      ]);

      return {
        sessions: sessionsData.data || [],
        flashcardSets: flashcardData.data || [],
        notes: notesData.data || [],
        quizzes: quizzesData.data || [],
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });

  // Calculate analytics from raw data
  const analytics = useMemo((): AnalyticsData => {
    if (!rawData) return defaultAnalytics;

    const { sessions, flashcardSets, notes, quizzes } = rawData;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Session calculations
    const completedSessions = sessions.filter(s => !s.is_active && s.duration);
    const todaySessions = sessions.filter(s => new Date(s.start_time) >= today);
    const weeklySessions = sessions.filter(s => new Date(s.start_time) >= weekAgo);
    
    const totalMinutes = completedSessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60;
    const todayMinutes = todaySessions.filter(s => !s.is_active && s.duration).reduce((acc, s) => acc + (s.duration || 0), 0) / 60;
    const weeklyMinutes = weeklySessions.filter(s => !s.is_active && s.duration).reduce((acc, s) => acc + (s.duration || 0), 0) / 60;
    
    // Flashcard calculations
    const totalFlashcards = flashcardSets.reduce((acc, set) => acc + (set.flashcards?.length || 0), 0);
    let masteredCards = 0;
    let totalCardsReviewed = 0;
    let totalCardsCorrect = 0;

    flashcardSets.forEach(set => {
      set.flashcards?.forEach((card: any) => {
        const progress = card.user_flashcard_progress?.[0];
        if (progress) {
          if (progress.mastery_level >= 3) masteredCards++;
        }
      });
    });

    // Session-based card statistics
    totalCardsReviewed = sessions.reduce((acc, s) => acc + (s.cards_reviewed || 0), 0);
    totalCardsCorrect = sessions.reduce((acc, s) => acc + (s.cards_correct || 0), 0);

    // Notes calculations
    const recentNotes = notes.filter(note => new Date(note.created_at) >= weekAgo).length;
    const monthlyNotes = notes.filter(note => new Date(note.created_at) >= monthAgo).length;

    // Streak calculation
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

    // Subject aggregation
    const subjectMap = new Map();
    sessions.forEach(session => {
      if (session.subject) {
        const existing = subjectMap.get(session.subject) || { 
          name: session.subject, 
          totalTime: 0, 
          sessionCount: 0 
        };
        existing.totalTime += (session.duration || 0) / 60;
        existing.sessionCount += 1;
        subjectMap.set(session.subject, existing);
      }
    });

    const subjects = Array.from(subjectMap.values());

    // Calculate accuracy
    const flashcardAccuracy = totalCardsReviewed > 0 
      ? Math.round((totalCardsCorrect / totalCardsReviewed) * 100) 
      : 0;

    // Calculate quiz metrics
    const quizSessions = sessions.filter(s => (s.quiz_total_questions || 0) > 0);
    const totalQuizzesTaken = quizSessions.length;

    // Additional calculated values
    const weeklyGoalHours = 5; // Default weekly goal
    const weeklyGoalMinutes = weeklyGoalHours * 60;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const todayString = today.toLocaleDateString();

    return {
      totalSessions: sessions.length,
      activeSessions: sessions.filter(s => s.is_active).length,
      totalStudyTime: Math.round((totalMinutes / 60) * 10) / 10,
      totalStudyTimeMinutes: Math.round(totalMinutes),
      todayStudyTimeMinutes: Math.round(todayMinutes),
      weeklyStudyTimeMinutes: Math.round(weeklyMinutes),
      averageSessionTime: completedSessions.length ? Math.round((totalMinutes * 60) / completedSessions.length) : 0,
      streakDays,
      totalFlashcardSets: flashcardSets.length,
      totalFlashcards,
      totalCardsMastered: masteredCards,
      flashcardAccuracy,
      totalCardsReviewed,
      totalCardsCorrect,
      totalSets: flashcardSets.length, // Alias for backward compatibility
      totalNotes: notes.length,
      recentNotes,
      monthlyNotes,
      totalQuizzes: quizzes.length,
      totalQuizzesTaken,
      recentSessions: sessions.slice(0, 10),
      subjects,
      weeklyChange: 0, // Could be calculated with historical data
      weeklyGoalProgress: Math.min(100, Math.round((weeklyMinutes / weeklyGoalMinutes) * 100)),
      weeklyGoalMinutes,
      averageAccuracy: flashcardAccuracy,
      timezone,
      todayString,
    };
  }, [rawData]);

  return (
    <AnalyticsContext.Provider value={{ analytics, isLoading, error }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};