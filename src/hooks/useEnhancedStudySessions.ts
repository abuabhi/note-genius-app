
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

  // Query for enhanced sessions
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

  // Query for session activities
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

  // Query for analytics
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

  // Auto-create session mutation
  const createAutoSession = useMutation({
    mutationFn: async (data: {
      activity_type: string;
      title: string;
      subject?: string;
      resource_id?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Check if there's an active session within the last 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      const { data: recentSessions, error: recentError } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .gte('start_time', fiveMinutesAgo)
        .order('start_time', { ascending: false })
        .limit(1);

      if (recentError) throw recentError;

      // If there's a recent active session, return it instead of creating new
      if (recentSessions && recentSessions.length > 0) {
        return recentSessions[0];
      }

      // Create new auto session
      const sessionData = {
        user_id: user.id,
        title: data.title,
        subject: data.subject,
        start_time: new Date().toISOString(),
        is_active: true,
        activity_type: data.activity_type,
        auto_created: true,
        flashcard_set_id: data.activity_type === 'flashcard' ? data.resource_id : null
      };

      const { data: newSession, error } = await supabase
        .from('study_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;
      return newSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enhanced-study-sessions"] });
    },
    onError: (error) => {
      console.error('Error creating auto session:', error);
    }
  });

  // Track activity mutation
  const trackActivity = useMutation({
    mutationFn: async (activityData: {
      session_id: string;
      activity_type: 'flashcard' | 'quiz' | 'note';
      resource_id?: string;
      performance_data?: Record<string, any>;
      end_time?: string;
      duration_seconds?: number;
    }) => {
      const { data, error } = await supabase
        .from('study_session_activities')
        .insert({
          ...activityData,
          start_time: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-activities"] });
    }
  });

  // Update session with performance data
  const updateSessionPerformance = useMutation({
    mutationFn: async (data: {
      sessionId: string;
      cards_reviewed?: number;
      cards_correct?: number;
      quiz_score?: number;
      quiz_total_questions?: number;
      notes_created?: number;
      notes_reviewed?: number;
    }) => {
      const { error } = await supabase
        .from('study_sessions')
        .update({
          cards_reviewed: data.cards_reviewed,
          cards_correct: data.cards_correct,
          quiz_score: data.quiz_score,
          quiz_total_questions: data.quiz_total_questions,
          notes_created: data.notes_created,
          notes_reviewed: data.notes_reviewed,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enhanced-study-sessions"] });
    }
  });

  // End session mutation
  const endSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const endTime = new Date();
      
      const { data: session, error: fetchError } = await supabase
        .from('study_sessions')
        .select('start_time')
        .eq('id', sessionId)
        .single();

      if (fetchError) throw fetchError;

      const duration = Math.floor((endTime.getTime() - new Date(session.start_time).getTime()) / 1000);

      const { error } = await supabase
        .from('study_sessions')
        .update({
          end_time: endTime.toISOString(),
          duration,
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enhanced-study-sessions"] });
      toast.success('Study session completed');
    }
  });

  // Calculate session statistics
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

  // Get filtered sessions
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
    createAutoSession,
    trackActivity,
    updateSessionPerformance,
    endSession,
    getSessionStatistics,
    getFilteredSessions
  };
};
