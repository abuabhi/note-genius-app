
import { UseFormReturn } from "react-hook-form";
import { User } from "@supabase/supabase-js";
import { UserTier } from "@/hooks/useUserTier";
import { supabase } from "@/integrations/supabase/client";
import { SettingsFormValues } from "@/components/settings/schemas/settingsFormSchema";
import { toast } from "sonner";

export const useSettingsFormSubmission = (
  user: User | null,
  userTier: UserTier | undefined,
  updateUserCountry: (countryId: string) => Promise<{ success: boolean; error?: any }>
) => {
  const onSubmit = async (data: SettingsFormValues) => {
    try {
      console.log("Form submitted with values:", data);
      
      const isDeanUser = userTier === UserTier.DEAN;
      
      // Handle country update for DEAN users
      if (isDeanUser && data.countryId) {
        const result = await updateUserCountry(data.countryId);
        if (!result.success) {
          toast.error("Failed to update country preference");
          return;
        }
      }
      
      // Save preferences to user profile
      if (user) {
        const notificationPreferences = {
          email: data.emailNotifications,
          in_app: data.inAppNotifications,
          adaptive: data.adaptiveNotifications,
          study_session_reminders: data.studySessionReminders,
          goal_deadline_reminders: data.goalDeadlineReminders,
          reminder_frequency: data.reminderFrequency,
          quiet_hours_enabled: data.quietHoursEnabled,
          quiet_hours_start: data.quietHoursStart,
          quiet_hours_end: data.quietHoursEnd,
        };

        const adaptiveLearningPreferences = {
          difficulty: data.adaptiveDifficulty,
          study_style: data.studyStyle,
          session_length: data.preferredSessionLength,
          max_daily_time: data.maxDailyStudyTime,
          break_frequency: data.breakFrequency,
          adaptation_sensitivity: data.adaptationSensitivity,
          real_time_adaptations: data.enableRealTimeAdaptations,
          learning_paths: data.enableLearningPaths,
        };

        const { error } = await supabase
          .from('profiles')
          .update({
            weekly_study_goal_hours: data.weeklyStudyGoalHours,
            notification_preferences: notificationPreferences,
            adaptive_learning_preferences: adaptiveLearningPreferences
          })
          .eq('id', user.id);
          
        if (error) {
          console.error("Error saving preferences:", error);
          toast.error("Failed to save preferences");
          return;
        }
      }
      
      toast.success("Settings saved successfully");
      return true;
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
      return false;
    }
  };

  return { onSubmit };
};
