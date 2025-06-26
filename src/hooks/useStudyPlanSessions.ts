
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { StudyPlanSession } from '@/types/studyPlanner';
import { toast } from 'sonner';

export const useStudyPlanSessions = () => {
  const { user } = useRequireAuth();
  const queryClient = useQueryClient();

  // Fetch all sessions for user's study plans
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['study-plan-sessions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('study_plan_sessions')
        .select(`
          *,
          study_plans!inner(user_id)
        `)
        .eq('study_plans.user_id', user.id)
        .order('scheduled_date', { ascending: true });
      
      if (error) throw error;
      return data as StudyPlanSession[];
    },
    enabled: !!user?.id,
  });

  // Get session statistics
  const getSessionStats = () => {
    if (!sessions) return { total: 0, scheduled: 0, completed: 0, inProgress: 0 };
    
    return {
      total: sessions.length,
      scheduled: sessions.filter(s => s.status === 'scheduled').length,
      completed: sessions.filter(s => s.status === 'completed').length,
      inProgress: sessions.filter(s => s.status === 'in_progress').length,
    };
  };

  // Start a session
  const startSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase
        .from('study_plan_sessions')
        .update({
          status: 'in_progress',
          actual_start_time: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-plan-sessions'] });
      toast.success('Session started!');
    },
  });

  // Complete a session
  const completeSessionMutation = useMutation({
    mutationFn: async ({ sessionId, notes, rating }: { 
      sessionId: string; 
      notes?: string; 
      rating?: number; 
    }) => {
      const { data, error } = await supabase
        .from('study_plan_sessions')
        .update({
          status: 'completed',
          actual_end_time: new Date().toISOString(),
          completion_notes: notes,
          performance_rating: rating,
        })
        .eq('id', sessionId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-plan-sessions'] });
      toast.success('Session completed!');
    },
  });

  // Reschedule a session
  const rescheduleSessionMutation = useMutation({
    mutationFn: async ({ sessionId, newDate, newStartTime, newEndTime }: {
      sessionId: string;
      newDate: string;
      newStartTime: string;
      newEndTime: string;
    }) => {
      const { data, error } = await supabase
        .from('study_plan_sessions')
        .update({
          scheduled_date: newDate,
          scheduled_start_time: newStartTime,
          scheduled_end_time: newEndTime,
          status: 'rescheduled',
        })
        .eq('id', sessionId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-plan-sessions'] });
      toast.success('Session rescheduled successfully!');
    },
  });

  return {
    sessions: sessions || [],
    sessionsLoading,
    sessionStats: getSessionStats(),
    startSession: startSessionMutation.mutateAsync,
    completeSession: completeSessionMutation.mutateAsync,
    rescheduleSession: rescheduleSessionMutation.mutateAsync,
    isStarting: startSessionMutation.isPending,
    isCompleting: completeSessionMutation.isPending,
    isRescheduling: rescheduleSessionMutation.isPending,
  };
};
