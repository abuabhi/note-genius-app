
import { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const SESSIONS_PER_PAGE = 15;

export const useOptimizedStudySessions = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState<'week' | 'month' | 'all'>('week');
  const queryClient = useQueryClient();

  // Get date range based on filter
  const getDateRange = useCallback(() => {
    const now = new Date();
    const ranges = {
      week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      month: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      all: new Date(0)
    };
    return ranges[dateFilter];
  }, [dateFilter]);

  // Load active/recent sessions first
  const { data: activeSessions, isLoading: activeLoading } = useQuery({
    queryKey: ['studySessions', 'active'],
    queryFn: async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      const { data } = await supabase
        .from('study_sessions')
        .select(`
          id, title, start_time, end_time, duration, is_active,
          activity_type, subject, session_quality,
          cards_reviewed, cards_correct
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('start_time', { ascending: false });

      return data || [];
    },
    staleTime: 30 * 1000, // 30 seconds for active sessions
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  });

  // Load paginated session history
  const { data: sessionHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['studySessions', 'history', currentPage, dateFilter],
    queryFn: async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const fromDate = getDateRange();
      const offset = (currentPage - 1) * SESSIONS_PER_PAGE;
      
      const { data, error, count } = await supabase
        .from('study_sessions')
        .select(`
          id, title, start_time, end_time, duration, is_active,
          activity_type, subject, session_quality,
          cards_reviewed, cards_correct, focus_time, break_time
        `, { count: 'exact' })
        .eq('user_id', userId)
        .eq('is_active', false)
        .gte('start_time', fromDate.toISOString())
        .range(offset, offset + SESSIONS_PER_PAGE - 1)
        .order('start_time', { ascending: false });

      if (error) throw error;

      return {
        sessions: data || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / SESSIONS_PER_PAGE)
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!activeSessions, // Load after active sessions
  });

  // Load session statistics
  const { data: sessionStats, isLoading: statsLoading } = useQuery({
    queryKey: ['studySessions', 'stats', dateFilter],
    queryFn: async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const fromDate = getDateRange();
      
      const { data } = await supabase
        .from('study_sessions')
        .select('duration, cards_reviewed, cards_correct, session_quality, subject')
        .eq('user_id', userId)
        .eq('is_active', false)
        .gte('start_time', fromDate.toISOString());

      const sessions = data || [];
      const totalSessions = sessions.length;
      const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
      const totalCards = sessions.reduce((sum, s) => sum + (s.cards_reviewed || 0), 0);
      const correctCards = sessions.reduce((sum, s) => sum + (s.cards_correct || 0), 0);
      
      const qualityDistribution = sessions.reduce((acc, s) => {
        acc[s.session_quality || 'unknown'] = (acc[s.session_quality || 'unknown'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const subjectDistribution = sessions.reduce((acc, s) => {
        const subject = s.subject || 'Unknown';
        acc[subject] = (acc[subject] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalSessions,
        totalDuration,
        averageDuration: totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0,
        accuracy: totalCards > 0 ? Math.round((correctCards / totalCards) * 100) : 0,
        qualityDistribution,
        subjectDistribution
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!sessionHistory, // Load after history
  });

  // Prefetch next page
  const prefetchNextPage = useCallback(() => {
    if (sessionHistory && currentPage < sessionHistory.totalPages) {
      queryClient.prefetchQuery({
        queryKey: ['studySessions', 'history', currentPage + 1, dateFilter],
        queryFn: async () => {
          const userId = (await supabase.auth.getUser()).data.user?.id;
          const fromDate = getDateRange();
          const offset = currentPage * SESSIONS_PER_PAGE;
          
          const { data, error, count } = await supabase
            .from('study_sessions')
            .select(`
              id, title, start_time, end_time, duration, is_active,
              activity_type, subject, session_quality,
              cards_reviewed, cards_correct, focus_time, break_time
            `, { count: 'exact' })
            .eq('user_id', userId)
            .eq('is_active', false)
            .gte('start_time', fromDate.toISOString())
            .range(offset, offset + SESSIONS_PER_PAGE - 1)
            .order('start_time', { ascending: false });

          if (error) throw error;

          return {
            sessions: data || [],
            totalCount: count || 0,
            totalPages: Math.ceil((count || 0) / SESSIONS_PER_PAGE)
          };
        },
      });
    }
  }, [queryClient, currentPage, dateFilter, sessionHistory, getDateRange]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setTimeout(prefetchNextPage, 100);
  }, [prefetchNextPage]);

  const handleDateFilterChange = useCallback((filter: 'week' | 'month' | 'all') => {
    setDateFilter(filter);
    setCurrentPage(1);
  }, []);

  const memoizedData = useMemo(() => ({
    activeSessions: activeSessions || [],
    sessionHistory: sessionHistory?.sessions || [],
    stats: sessionStats || {
      totalSessions: 0,
      totalDuration: 0,
      averageDuration: 0,
      accuracy: 0,
      qualityDistribution: {},
      subjectDistribution: {}
    },
    pagination: {
      currentPage,
      totalPages: sessionHistory?.totalPages || 1,
      totalCount: sessionHistory?.totalCount || 0
    }
  }), [activeSessions, sessionHistory, sessionStats, currentPage]);

  return {
    data: memoizedData,
    isLoading: activeLoading,
    isPartiallyLoaded: !!activeSessions,
    loadingStates: {
      active: activeLoading,
      history: historyLoading,
      stats: statsLoading
    },
    dateFilter,
    handlePageChange,
    handleDateFilterChange,
    prefetchNextPage
  };
};
