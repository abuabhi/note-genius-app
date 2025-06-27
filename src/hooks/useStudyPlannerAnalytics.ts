
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

interface StudyPlannerAnalytics {
  totalSessionTime: number; // in minutes
  todaySessionTime: number; // in minutes
  weeklySessionTime: number; // in minutes
  totalSessions: number;
  activePlansCount: number;
  completionRate: number;
  recentSessions: any[];
}

interface StudyPlanSpecificAnalytics extends StudyPlannerAnalytics {
  planSessionTime: number; // Time spent on this specific plan
  planSessions: number; // Sessions for this specific plan
}

export const useStudyPlannerAnalytics = (studyPlanId?: string) => {
  const { user } = useAuth();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['study-planner-analytics', user?.id, studyPlanId],
    queryFn: async (): Promise<StudyPlannerAnalytics | StudyPlanSpecificAnalytics> => {
      if (!user) throw new Error('Not authenticated');

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Get sessions - filter by study plan if specified
      let sessionsQuery = supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('auto_created', false)
        .order('start_time', { ascending: false });

      if (studyPlanId) {
        sessionsQuery = sessionsQuery.eq('study_plan_id', studyPlanId);
      }

      const { data: sessions } = await sessionsQuery;

      // Get active and completed plans
      const [activePlansResult, completedPlansResult] = await Promise.all([
        supabase
          .from('study_plans')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'active'),
        supabase
          .from('study_plans')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'completed')
      ]);

      const allSessions = sessions || [];
      const completedSessions = allSessions.filter(s => !s.is_active && s.duration);
      
      // Calculate session times in minutes (duration is in seconds)
      const totalSessionTime = Math.round(
        completedSessions.reduce((acc, session) => acc + (session.duration || 0), 0) / 60
      );
      
      const todaySessions = completedSessions.filter(s => 
        new Date(s.start_time) >= today
      );
      const todaySessionTime = Math.round(
        todaySessions.reduce((acc, session) => acc + (session.duration || 0), 0) / 60
      );
      
      const weeklySessions = completedSessions.filter(s => 
        new Date(s.start_time) >= weekAgo
      );
      const weeklySessionTime = Math.round(
        weeklySessions.reduce((acc, session) => acc + (session.duration || 0), 0) / 60
      );

      const activePlansCount = activePlansResult.data?.length || 0;
      const completedPlansCount = completedPlansResult.data?.length || 0;
      const totalPlans = activePlansCount + completedPlansCount;
      const completionRate = totalPlans > 0 ? Math.round((completedPlansCount / totalPlans) * 100) : 0;

      const baseAnalytics = {
        totalSessionTime,
        todaySessionTime,
        weeklySessionTime,
        totalSessions: allSessions.length,
        activePlansCount,
        completionRate,
        recentSessions: allSessions.slice(0, 10)
      };

      // If querying for a specific study plan, add plan-specific metrics
      if (studyPlanId) {
        return {
          ...baseAnalytics,
          planSessionTime: totalSessionTime, // Since we filtered by plan, this is plan-specific
          planSessions: allSessions.length
        } as StudyPlanSpecificAnalytics;
      }

      return baseAnalytics;
    },
    enabled: !!user,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  return {
    analytics: analytics || {
      totalSessionTime: 0,
      todaySessionTime: 0,
      weeklySessionTime: 0,
      totalSessions: 0,
      activePlansCount: 0,
      completionRate: 0,
      recentSessions: []
    },
    isLoading
  };
};
