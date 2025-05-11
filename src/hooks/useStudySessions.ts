import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/auth'; // Updated import path
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface StudySession {
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
}

interface NewStudySession {
  title: string;
  subject?: string;
  flashcard_set_id?: string;
  notes?: string;
}

interface EndSessionData {
  sessionId: string;
  endTime: Date;
  duration: number;
  notes?: string;
  focusTime?: number;
  breakTime?: number;
}

export const useStudySessions = () => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('start_time', { ascending: false });

        if (error) throw error;
        setSessions(data || []);
      } catch (err) {
        console.error('Error fetching study sessions:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch study sessions'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [user]);

  const startSession = useMutation({
    mutationFn: async (sessionData: NewStudySession) => {
      if (!user) throw new Error('User not authenticated');
      
      const newSession = {
        user_id: user.id,
        title: sessionData.title,
        subject: sessionData.subject,
        flashcard_set_id: sessionData.flashcard_set_id,
        notes: sessionData.notes,
        start_time: new Date().toISOString(),
        is_active: true
      };

      const { data, error } = await supabase
        .from('study_sessions')
        .insert(newSession)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setSessions(prev => [data, ...prev]);
      toast.success('Study session started successfully!');
    },
    onError: (error) => {
      toast.error('Failed to start study session');
      console.error('Error starting session:', error);
    }
  });

  const endSession = useMutation({
    mutationFn: async (data: EndSessionData) => {
      const { sessionId, endTime, duration, notes, focusTime, breakTime } = data;

      const updateData = {
        end_time: endTime.toISOString(),
        duration,
        is_active: false,
        notes,
        focus_time: focusTime,
        break_time: breakTime
      };

      const { data: updatedSession, error } = await supabase
        .from('study_sessions')
        .update(updateData)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return updatedSession;
    },
    onSuccess: (data) => {
      setSessions(prev => prev.map(session => 
        session.id === data.id ? data : session
      ));
      toast.success('Study session ended successfully!');
    },
    onError: (error) => {
      toast.error('Failed to end study session');
      console.error('Error ending session:', error);
    }
  });

  const getSessionStatistics = () => {
    if (!sessions.length) return { totalHours: 0, averageDuration: 0, totalSessions: 0, activeSessions: 0 };

    const completedSessions = sessions.filter(s => !s.is_active && s.duration);
    const totalMinutes = completedSessions.reduce((acc, session) => acc + (session.duration || 0), 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    const averageDuration = completedSessions.length ? Math.round(totalMinutes / completedSessions.length) : 0;
    
    return {
      totalHours,
      averageDuration,
      totalSessions: sessions.length,
      activeSessions: sessions.filter(s => s.is_active).length
    };
  };

  return {
    sessions,
    isLoading,
    error,
    startSession,
    endSession,
    getSessionStatistics
  };
};
