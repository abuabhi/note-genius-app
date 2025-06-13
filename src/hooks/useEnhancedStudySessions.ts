
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface EnhancedStudySession {
  id: string;
  user_id: string;
  title: string;
  subject?: string;
  notes?: string;
  start_time: string;
  end_time?: string;
  duration?: number;
  is_active: boolean;
  flashcard_set_id?: string;
  focus_time?: number;
  break_time?: number;
  created_at: string;
  updated_at: string;
  // Enhanced fields
  activity_type: string;
  cards_reviewed: number;
  cards_correct: number;
  quiz_score: number;
  quiz_total_questions: number;
  notes_created: number;
  notes_reviewed: number;
  learning_velocity: number;
  session_quality: string;
  auto_created: boolean;
}

export interface SessionActivity {
  id: string;
  session_id: string;
  activity_type: 'flashcard' | 'quiz' | 'note';
  resource_id?: string;
  start_time: string;
  end_time?: string;
  duration_seconds?: number;
  performance_data: Record<string, any>;
  created_at: string;
}

export interface StudyAnalytics {
  id: string;
  user_id: string;
  date: string;
  total_study_time: number;
  flashcard_accuracy: number;
  quiz_average_score: number;
  learning_velocity: number;
  consistency_score: number;
  optimal_study_time?: string;
  subjects_studied: string[];
  analytics_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const useEnhancedStudySessions = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  console.log('🚫 [ENHANCED SESSIONS] DISABLED - Session creation functionality removed to prevent conflicts with SessionDock');

  // Query for enhanced sessions (READ-ONLY for analytics)
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["enhanced-study-sessions", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data as EnhancedStudySession[];
    },
    enabled: !!user,
  });

  // Query for session activities (READ-ONLY)
  const { data: activities = [] } = useQuery({
    queryKey: ["session-activities", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('study_session_activities')
        .select(`
          *,
          study_sessions!inner(user_id)
        `)
        .eq('study_sessions.user_id', user.id)
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data as SessionActivity[];
    },
    enabled: !!user,
  });

  // Query for analytics (READ-ONLY)
  const { data: analytics = [] } = useQuery({
    queryKey: ["study-analytics", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('study_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30); // Last 30 days

      if (error) throw error;
      return data as StudyAnalytics[];
    },
    enabled: !!user,
  });

  // DISABLED: Auto-create session mutation - SessionDock handles all session creation
  const createAutoSession = useMutation({
    mutationFn: async (data: any) => {
      console.log('🚫 [ENHANCED SESSIONS] createAutoSession DISABLED - Use SessionDock instead');
      throw new Error('Session creation disabled - SessionDock manages all sessions');
    },
    onError: (error) => {
      console.error('🚫 [ENHANCED SESSIONS] Session creation blocked:', error);
    }
  });

  // DISABLED: Track activity mutation - SessionDock handles all activity tracking
  const trackActivity = useMutation({
    mutationFn: async (activityData: any) => {
      console.log('🚫 [ENHANCED SESSIONS] trackActivity DISABLED - Use SessionDock instead');
      // Don't throw error, just log and ignore
      return null;
    },
    onError: (error) => {
      console.error('🚫 [ENHANCED SESSIONS] Activity tracking blocked:', error);
    }
  });

  // DISABLED: Update session with performance data - SessionDock handles all updates
  const updateSessionPerformance = useMutation({
    mutationFn: async (data: any) => {
      console.log('🚫 [ENHANCED SESSIONS] updateSessionPerformance DISABLED - Use SessionDock instead');
      // Don't throw error, just log and ignore
      return null;
    },
    onError: (error) => {
      console.error('🚫 [ENHANCED SESSIONS] Session update blocked:', error);
    }
  });

  // DISABLED: End session mutation - SessionDock handles all session ending
  const endSession = useMutation({
    mutationFn: async (sessionId: string) => {
      console.log('🚫 [ENHANCED SESSIONS] endSession DISABLED - Use SessionDock instead');
      throw new Error('Session ending disabled - SessionDock manages all sessions');
    },
    onError: (error) => {
      console.error('🚫 [ENHANCED SESSIONS] Session ending blocked:', error);
    }
  });

  // Calculate session statistics (READ-ONLY for analytics)
  const getSessionStatistics = useMemo(() => {
    if (!sessions.length) return {
      totalHours: 0,
      averageDuration: 0,
      totalSessions: 0,
      activeSessions: 0,
      averageAccuracy: 0,
      totalCardsReviewed: 0,
      totalQuizzesTaken: 0
    };

    const completedSessions = sessions.filter(s => !s.is_active && s.duration);
    const totalMinutes = completedSessions.reduce((acc, session) => acc + (session.duration || 0), 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    const averageDuration = completedSessions.length ? Math.round(totalMinutes / completedSessions.length) : 0;
    
    const totalCardsReviewed = sessions.reduce((acc, s) => acc + s.cards_reviewed, 0);
    const totalCardsCorrect = sessions.reduce((acc, s) => acc + s.cards_correct, 0);
    const averageAccuracy = totalCardsReviewed > 0 ? Math.round((totalCardsCorrect / totalCardsReviewed) * 100) : 0;
    
    const totalQuizzesTaken = sessions.filter(s => s.quiz_total_questions > 0).length;

    return {
      totalHours,
      averageDuration,
      totalSessions: sessions.length,
      activeSessions: sessions.filter(s => s.is_active).length,
      averageAccuracy,
      totalCardsReviewed,
      totalQuizzesTaken
    };
  }, [sessions]);

  // Get filtered sessions (READ-ONLY)
  const getFilteredSessions = (filter: string) => {
    switch(filter) {
      case 'recent':
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return sessions.filter(s => new Date(s.start_time) >= oneWeekAgo);
      case 'archived':
        return sessions.filter(s => !s.is_active);
      case 'all':
      default:
        return sessions;
    }
  };

  return {
    sessions,
    activities,
    analytics,
    isLoading: sessionsLoading,
    error,
    // DISABLED MUTATIONS - All return disabled versions
    createAutoSession,
    trackActivity,
    updateSessionPerformance,
    endSession,
    // READ-ONLY FUNCTIONS for analytics
    getSessionStatistics,
    getFilteredSessions
  };
};
