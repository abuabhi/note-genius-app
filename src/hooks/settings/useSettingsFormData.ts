
import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { SettingsFormValues } from "@/components/settings/schemas/settingsFormSchema";

export const useSettingsFormData = (
  user: User | null,
  form: UseFormReturn<SettingsFormValues>
) => {
  // Fetch initial user preferences
  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          // Use any type to bypass TypeScript issues with newly added columns
          const profileData = data as any;
          
          form.setValue("weeklyStudyGoalHours", profileData.weekly_study_goal_hours || 5);
          
          // Load notification preferences if they exist
          if (profileData.notification_preferences) {
            const notifPrefs = typeof profileData.notification_preferences === 'string' 
              ? JSON.parse(profileData.notification_preferences) 
              : profileData.notification_preferences;
            
            form.setValue("emailNotifications", notifPrefs.email ?? true);
            form.setValue("inAppNotifications", notifPrefs.in_app ?? true);
            form.setValue("adaptiveNotifications", notifPrefs.adaptive ?? true);
            form.setValue("studySessionReminders", notifPrefs.study_session_reminders ?? true);
            form.setValue("goalDeadlineReminders", notifPrefs.goal_deadline_reminders ?? true);
            form.setValue("reminderFrequency", notifPrefs.reminder_frequency ?? "15min");
            form.setValue("quietHoursEnabled", notifPrefs.quiet_hours_enabled ?? false);
            form.setValue("quietHoursStart", notifPrefs.quiet_hours_start ?? "22:00");
            form.setValue("quietHoursEnd", notifPrefs.quiet_hours_end ?? "08:00");
          }

          // Load adaptive learning preferences if they exist
          if (profileData.adaptive_learning_preferences) {
            const adaptivePrefs = typeof profileData.adaptive_learning_preferences === 'string'
              ? JSON.parse(profileData.adaptive_learning_preferences)
              : profileData.adaptive_learning_preferences;

            form.setValue("adaptiveDifficulty", adaptivePrefs.difficulty ?? "adaptive");
            form.setValue("studyStyle", adaptivePrefs.study_style ?? "distributed");
            form.setValue("preferredSessionLength", adaptivePrefs.session_length ?? 45);
            form.setValue("maxDailyStudyTime", adaptivePrefs.max_daily_time ?? 180);
            form.setValue("breakFrequency", adaptivePrefs.break_frequency ?? "moderate");
            form.setValue("adaptationSensitivity", adaptivePrefs.adaptation_sensitivity ?? "normal");
            form.setValue("enableRealTimeAdaptations", adaptivePrefs.real_time_adaptations ?? true);
            form.setValue("enableLearningPaths", adaptivePrefs.learning_paths ?? true);
          }
        }
      } catch (error) {
        console.error("Error fetching user preferences:", error);
      }
    };
    
    fetchUserPreferences();
  }, [user, form]);
};
