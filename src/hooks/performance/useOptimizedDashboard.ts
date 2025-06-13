
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

  console.log('📊 [OPTIMIZED DASHBOARD] Using SessionDock-created sessions for all data');

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

  // Load secondary data (Study Stats) - ONLY from SessionDock sessions
  const { data: studyStats, isLoading: studyStatsLoading } = useQuery({
    queryKey: ['dashboard', 'studyStats'],
    queryFn: async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const today = new Date().toISOString().split('T')[0];
      
      console.log('📊 [OPTIMIZED DASHBOARD] Loading study stats from SessionDock sessions only');
      
      // Get sessions created by SessionDock (useBasicSessionTracker)
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('study_sessions')
        .select('duration, cards_reviewed, cards_correct, activity_type, auto_created')
        .eq('user_id', userId)
        .gte('start_time', today)
        .order('start_time', { ascending: false })
        .limit(10);

      if (sessionsError) {
        console.error('📊 [OPTIMIZED DASHBOARD] Error loading sessions:', sessionsError);
        throw sessionsError;
      }

      console.log('📊 [OPTIMIZED DASHBOARD] Loaded sessions:', sessionsData);

      // Get analytics (read-only)
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('study_analytics')
        .select('total_study_time, flashcard_accuracy, consistency_score')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (analyticsError && analyticsError.code !== 'PGRST116') {
        console.error('📊 [OPTIMIZED DASHBOARD] Error loading analytics:', analyticsError);
      }

      return {
        sessions: sessionsData || [],
        analytics: analyticsData
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!todaysFocus,
  });

  // Load tertiary data (Recent Activity) - ONLY from SessionDock data
  const { data: recentActivity, isLoading: recentActivityLoading } = useQuery({
    queryKey: ['dashboard', 'recentActivity'],
    queryFn: async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      console.log('📊 [OPTIMIZED DASHBOARD] Loading recent activity from SessionDock data');
      
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
    enabled: !!studyStats,
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
    enabled: !!recentActivity,
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
