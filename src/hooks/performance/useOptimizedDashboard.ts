
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DashboardData {
  recentActivity: any[];
  studyStats: any;
  todaysFocus: any[];
  goals: any[];
}

export const useOptimizedDashboard = () => {
  const [priorityData, setPriorityData] = useState<Partial<DashboardData>>({});

  // Load critical data first (Today's Focus)
  const { data: todaysFocus, isLoading: todaysFocusLoading } = useQuery({
    queryKey: ['dashboard', 'todaysFocus'],
    queryFn: async () => {
      const { data } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('due_date', new Date().toISOString().split('T')[0])
        .order('priority', { ascending: false })
        .limit(5);
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Load secondary data (Study Stats)
  const { data: studyStats, isLoading: studyStatsLoading } = useQuery({
    queryKey: ['dashboard', 'studyStats'],
    queryFn: async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const today = new Date().toISOString().split('T')[0];
      
      const [sessionsData, analyticsData] = await Promise.all([
        supabase
          .from('study_sessions')
          .select('duration, cards_reviewed, cards_correct')
          .eq('user_id', userId)
          .gte('start_time', today)
          .limit(10),
        supabase
          .from('study_analytics')
          .select('total_study_time, flashcard_accuracy, consistency_score')
          .eq('user_id', userId)
          .eq('date', today)
          .single()
      ]);

      return {
        sessions: sessionsData.data || [],
        analytics: analyticsData.data
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!todaysFocus, // Load after priority data
  });

  // Load tertiary data (Recent Activity)
  const { data: recentActivity, isLoading: recentActivityLoading } = useQuery({
    queryKey: ['dashboard', 'recentActivity'],
    queryFn: async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      const [notesData, flashcardsData, goalsData] = await Promise.all([
        supabase
          .from('notes')
          .select('id, title, updated_at')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .limit(3),
        supabase
          .from('flashcard_sets')
          .select('id, name, updated_at')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .limit(3),
        supabase
          .from('study_goals')
          .select('id, title, progress, updated_at')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .limit(3)
      ]);

      return [
        ...(notesData.data || []).map(item => ({ ...item, type: 'note' })),
        ...(flashcardsData.data || []).map(item => ({ ...item, type: 'flashcard' })),
        ...(goalsData.data || []).map(item => ({ ...item, type: 'goal' }))
      ].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!studyStats, // Load after secondary data
  });

  // Load goals last
  const { data: goals, isLoading: goalsLoading } = useQuery({
    queryKey: ['dashboard', 'goals'],
    queryFn: async () => {
      const { data } = await supabase
        .from('study_goals')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('is_completed', false)
        .order('end_date', { ascending: true })
        .limit(5);
      return data || [];
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!recentActivity, // Load last
  });

  const isLoading = todaysFocusLoading;
  const isPartiallyLoaded = !!todaysFocus;

  const dashboardData = useMemo(() => ({
    todaysFocus: todaysFocus || [],
    studyStats: studyStats || null,
    recentActivity: recentActivity || [],
    goals: goals || []
  }), [todaysFocus, studyStats, recentActivity, goals]);

  return {
    data: dashboardData,
    isLoading,
    isPartiallyLoaded,
    loadingStates: {
      todaysFocus: todaysFocusLoading,
      studyStats: studyStatsLoading,
      recentActivity: recentActivityLoading,
      goals: goalsLoading
    }
  };
};
