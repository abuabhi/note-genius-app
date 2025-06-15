
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  totalSessions: number;
  totalStudyTime: number;
  averageSessionTime: number;
  streakDays: number;
  recentSessions: any[];
}

// Simplified analytics hook with lazy loading
export const useSimplifiedAnalytics = (enabled = false) => {
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: async (): Promise<AnalyticsData> => {
      // Fetch study sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('study_sessions')
        .select('*')
        .order('start_time', { ascending: false })
        .limit(10);
      
      if (sessionsError) throw sessionsError;

      // Calculate basic metrics
      const totalSessions = sessions?.length || 0;
      const totalStudyTime = sessions?.reduce((sum, session) => sum + (session.duration || 0), 0) || 0;
      const averageSessionTime = totalSessions > 0 ? totalStudyTime / totalSessions : 0;

      return {
        totalSessions,
        totalStudyTime,
        averageSessionTime,
        streakDays: 0, // Simplified - calculate when needed
        recentSessions: sessions || [],
      };
    },
    enabled, // Only fetch when explicitly enabled
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    analytics,
    isLoading,
    error,
  };
};
