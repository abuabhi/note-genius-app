
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

interface AdaptiveLearningPreferences {
  difficulty: 'adaptive' | 'challenging' | 'comfortable';
  study_style: 'intensive' | 'distributed' | 'mixed';
  session_length: number;
  max_daily_time: number;
  break_frequency: 'frequent' | 'moderate' | 'minimal';
  adaptation_sensitivity: 'low' | 'normal' | 'high';
  real_time_adaptations: boolean;
  learning_paths: boolean;
}

interface NotificationPreferences {
  email: boolean;
  in_app: boolean;
  adaptive: boolean;
  study_session_reminders: boolean;
  goal_deadline_reminders: boolean;
  reminder_frequency: 'immediate' | '15min' | '30min' | '1hour';
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

export const useAdaptiveLearningPreferences = () => {
  const { user } = useAuth();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['adaptive-learning-preferences', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      // Use any type to bypass TypeScript issues with newly added columns
      const profileData = data as any;

      const adaptivePrefs: AdaptiveLearningPreferences = profileData?.adaptive_learning_preferences || {
        difficulty: 'adaptive',
        study_style: 'distributed',
        session_length: 45,
        max_daily_time: 180,
        break_frequency: 'moderate',
        adaptation_sensitivity: 'normal',
        real_time_adaptations: true,
        learning_paths: true,
      };

      const notificationPrefs: NotificationPreferences = profileData?.notification_preferences || {
        email: true,
        in_app: true,
        adaptive: true,
        study_session_reminders: true,
        goal_deadline_reminders: true,
        reminder_frequency: '15min',
        quiet_hours_enabled: false,
        quiet_hours_start: '22:00',
        quiet_hours_end: '08:00',
      };

      return {
        adaptive: adaptivePrefs,
        notifications: notificationPrefs,
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    preferences: preferences || {
      adaptive: {
        difficulty: 'adaptive' as const,
        study_style: 'distributed' as const,
        session_length: 45,
        max_daily_time: 180,
        break_frequency: 'moderate' as const,
        adaptation_sensitivity: 'normal' as const,
        real_time_adaptations: true,
        learning_paths: true,
      },
      notifications: {
        email: true,
        in_app: true,
        adaptive: true,
        study_session_reminders: true,
        goal_deadline_reminders: true,
        reminder_frequency: '15min' as const,
        quiet_hours_enabled: false,
        quiet_hours_start: '22:00',
        quiet_hours_end: '08:00',
      },
    },
    isLoading,
  };
};
