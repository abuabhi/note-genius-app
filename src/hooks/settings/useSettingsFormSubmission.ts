
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
      
      if (!user) {
        toast.error("User not authenticated");
        return false;
      }
      
      // Prepare notification preferences
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

      // Prepare the update data
      const updateData: any = {
        username: data.username || null,
        school: data.school || null,
        whatsapp_phone: data.whatsapp_phone || null,
        avatar_url: data.avatar_url || null,
        country_id: data.country_id || null,
        timezone: data.timezone || 'UTC',
        weekly_study_goal_hours: data.weeklyStudyGoalHours,
        notification_preferences: notificationPreferences,
        adaptive_learning_preferences: adaptiveLearningPreferences,
        study_music_preferences: {
          selectedTracks: data.selectedStudyTracks || []
        },
      };

      // Update user profile
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);
        
      if (error) {
        console.error("Error saving preferences:", error);
        toast.error("Failed to save preferences");
        return false;
      }
      
      // Also update auth user metadata so header avatar updates immediately and persist engagement prefs
      const engagementPreferences = {
        enableConfettiCelebrations: data.enableConfettiCelebrations,
        enableAvatarFrames: data.enableAvatarFrames,
        enableDailyQuoteCard: data.enableDailyQuoteCard,
        enableSoundEffects: data.enableSoundEffects,
        enableEmojiBurst: data.enableEmojiBurst,
      };

      await supabase.auth.updateUser({
        data: { 
          avatar_url: data.avatar_url || '',
          engagement_preferences: engagementPreferences,
        }
      });
      
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
