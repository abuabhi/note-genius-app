
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
  console.log('📊 [OPTIMIZED DASHBOARD] Using fresh start mode - all data cleared');

  // Since all data has been cleared, return empty states
  const { data: studyStats, isLoading: studyStatsLoading } = useQuery({
    queryKey: ['dashboard', 'studyStats'],
    queryFn: async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const today = new Date().toISOString().split('T')[0];
      
      console.log('📊 [OPTIMIZED DASHBOARD] Loading session data (expecting empty)');
      
      // Get sessions (expecting empty after clear)
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('study_sessions')
        .select('duration, cards_reviewed, cards_correct, activity_type, start_time')
        .eq('user_id', userId)
        .gte('start_time', today)
        .order('start_time', { ascending: false })
        .limit(10);

      if (sessionsError) {
        console.error('📊 [OPTIMIZED DASHBOARD] Error loading sessions:', sessionsError);
        throw sessionsError;
      }

      console.log('📊 [OPTIMIZED DASHBOARD] Loaded sessions:', sessionsData);

      return {
        sessions: sessionsData || [],
        analytics: null
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Load recent activity (expecting empty)
  const { data: recentActivity, isLoading: recentActivityLoading } = useQuery({
    queryKey: ['dashboard', 'recentActivity'],
    queryFn: async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      console.log('📊 [OPTIMIZED DASHBOARD] Loading recent activity (expecting empty)');
      
      const [notesData, flashcardsData] = await Promise.all([
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
          .limit(3)
      ]);

      return [
        ...(notesData.data || []).map(item => ({ ...item, type: 'note' })),
        ...(flashcardsData.data || []).map(item => ({ ...item, type: 'flashcard' }))
      ].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!studyStats,
  });

  const isLoading = studyStatsLoading;
  const isPartiallyLoaded = true; // Always consider partially loaded for fresh start

  const dashboardData = useMemo(() => ({
    todaysFocus: [], // Empty after clear
    studyStats: studyStats || null,
    recentActivity: recentActivity || [],
    goals: [] // Empty after clear
  }), [studyStats, recentActivity]);

  return {
    data: dashboardData,
    isLoading,
    isPartiallyLoaded,
    loadingStates: {
      todaysFocus: false, // No loading needed for empty state
      studyStats: studyStatsLoading,
      recentActivity: recentActivityLoading,
      goals: false // No loading needed for empty state
    }
  };
};
