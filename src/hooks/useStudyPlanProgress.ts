import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

interface StudyPlanProgress {
  completionPercentage: number;
  totalSessionTime: number; // in minutes
  onlineSessionTime: number; // in minutes
  offlineSessionTime: number; // in minutes
  plannedHours: number;
}

export const useStudyPlanProgress = (studyPlanId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['study-plan-progress', studyPlanId],
    queryFn: async (): Promise<StudyPlanProgress> => {
      if (!user) throw new Error('Not authenticated');

      // Get the study plan details
      const { data: studyPlan } = await supabase
        .from('study_plans')
        .select('total_hours_per_week, start_date, end_date')
        .eq('id', studyPlanId)
        .single();

      if (!studyPlan) throw new Error('Study plan not found');

      // Calculate total planned hours for the entire plan duration
      const startDate = new Date(studyPlan.start_date);
      const endDate = new Date(studyPlan.end_date);
      const totalWeeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
      const plannedHours = Math.max(1, studyPlan.total_hours_per_week * totalWeeks); // Ensure at least 1 hour

      // Get all sessions for this study plan
      const { data: sessions } = await supabase
        .from('study_sessions')
        .select('duration, session_source')
        .eq('study_plan_id', studyPlanId)
        .eq('user_id', user.id)
        .not('duration', 'is', null);

      const completedSessions = sessions || [];
      
      // Calculate session times in minutes (duration is in seconds)
      const totalSessionTime = Math.round(
        completedSessions.reduce((acc, session) => acc + (session.duration || 0), 0) / 60
      );
      
      // Separate online and offline sessions
      const onlineSessionTime = Math.round(
        completedSessions
          .filter(s => s.session_source === 'online')
          .reduce((acc, session) => acc + (session.duration || 0), 0) / 60
      );
      
      const offlineSessionTime = Math.round(
        completedSessions
          .filter(s => s.session_source === 'offline')
          .reduce((acc, session) => acc + (session.duration || 0), 0) / 60
      );

      const plannedMinutes = plannedHours * 60;
      
      // Calculate completion percentage
      const completionPercentage = plannedMinutes > 0 
        ? Math.min(Math.round((totalSessionTime / plannedMinutes) * 100), 100)
        : 0;

      return {
        completionPercentage,
        totalSessionTime,
        onlineSessionTime,
        offlineSessionTime,
        plannedHours
      };
    },
    enabled: !!user && !!studyPlanId,
    staleTime: 30 * 1000, // 30 seconds
  });
};