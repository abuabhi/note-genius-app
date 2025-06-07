
import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useOptimizedStudySessions = () => {
  const queryClient = useQueryClient();
  
  // Load basic session data first (critical path)
  const { data: basicSessionData, isLoading: basicLoading } = useQuery({
    queryKey: ['studySessions', 'basic'],
    queryFn: async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const today = new Date().toISOString().split('T')[0];
      
      // Optimized queries with proper indexing
      const [recentSessions, sessionStats] = await Promise.all([
        supabase
          .from('study_sessions')
          .select('id, subject, start_time, activity_type, duration, cards_reviewed, cards_correct')
          .eq('user_id', userId)
          .order('start_time', { ascending: false })
          .limit(10), // Only get what we need
        
        // Basic aggregate query for stats
        supabase
          .from('study_sessions')
          .select('duration, cards_reviewed, cards_correct')
          .eq('user_id', userId)
          .gte('start_time', today)
      ]);

      return {
        recentSessions: recentSessions.data || [],
        sessionStats: {
          totalTime: sessionStats.data?.reduce((sum, s) => sum + (s.duration || 0), 0) || 0,
          totalCards: sessionStats.data?.reduce((sum, s) => sum + (s.cards_reviewed || 0), 0) || 0,
          accuracy: sessionStats.data?.length > 0 
            ? sessionStats.data.reduce((sum, s) => sum + (s.cards_correct || 0), 0) / 
              sessionStats.data.reduce((sum, s) => sum + (s.cards_reviewed || 1), 1) * 100
            : 0
        }
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - fresher for critical data
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Load detailed analytics second (non-critical)
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['studySessions', 'analytics'],
    queryFn: async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const [weeklyData, subjectStats] = await Promise.all([
        supabase
          .from('study_analytics')
          .select('date, total_study_time, subjects_studied')
          .eq('user_id', userId)
          .gte('date', sevenDaysAgo.toISOString().split('T')[0])
          .order('date', { ascending: true }),
        
        supabase
          .from('study_sessions')
          .select('subject, duration, cards_correct, cards_reviewed')
          .eq('user_id', userId)
          .gte('start_time', sevenDaysAgo.toISOString())
      ]);

      return {
        weeklyData: weeklyData.data || [],
        monthlyData: [], // Placeholder for monthly trends
        subjectStats: subjectStats.data || []
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes for analytics
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!basicSessionData, // Only load after basic data
  });

  // Prefetch next page data for pagination
  const prefetchNextSession = () => {
    queryClient.prefetchQuery({
      queryKey: ['studySessions', 'next'],
      queryFn: async () => {
        const userId = (await supabase.auth.getUser()).data.user?.id;
        
        return supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', userId)
          .range(10, 20)
          .order('start_time', { ascending: false });
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  const sessionData = useMemo(() => ({
    basic: basicSessionData || { recentSessions: [], sessionStats: {} },
    analytics: analyticsData || { weeklyData: [], monthlyData: [], subjectStats: [] }
  }), [basicSessionData, analyticsData]);

  return {
    data: sessionData,
    isLoading: basicLoading,
    isPartiallyLoaded: !!basicSessionData,
    loadingStates: {
      basic: basicLoading,
      analytics: analyticsLoading,
    },
    prefetchNextSession
  };
};
