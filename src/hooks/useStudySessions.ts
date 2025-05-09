
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

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

export const useStudySessions = () => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

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

  return {
    sessions,
    isLoading,
    error
  };
};
