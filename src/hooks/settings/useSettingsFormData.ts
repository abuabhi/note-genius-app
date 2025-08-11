
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
          // Load basic account information
          form.setValue("username", data.username || "");
          form.setValue("email", user.email || "");
          form.setValue("school", data.school || "");
          form.setValue("whatsapp_phone", data.whatsapp_phone || "");
          form.setValue("avatar_url", data.avatar_url || user.user_metadata?.avatar_url || "");
          form.setValue("country_id", data.country_id || "");
          form.setValue("timezone", data.timezone || "UTC");
          
          // Load study goal
          form.setValue("weeklyStudyGoalHours", data.weekly_study_goal_hours || 5);
          
          // Load notification preferences if they exist
          if (data.notification_preferences) {
            const notifPrefs = typeof data.notification_preferences === 'string' 
              ? JSON.parse(data.notification_preferences) 
              : data.notification_preferences;
            
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
          if (data.adaptive_learning_preferences) {
            const adaptivePrefs = typeof data.adaptive_learning_preferences === 'string'
              ? JSON.parse(data.adaptive_learning_preferences)
              : data.adaptive_learning_preferences;

            form.setValue("adaptiveDifficulty", adaptivePrefs.difficulty ?? "adaptive");
            form.setValue("studyStyle", adaptivePrefs.study_style ?? "distributed");
            form.setValue("preferredSessionLength", adaptivePrefs.session_length ?? 45);
            form.setValue("maxDailyStudyTime", adaptivePrefs.max_daily_time ?? 180);
            form.setValue("breakFrequency", adaptivePrefs.break_frequency ?? "moderate");
            form.setValue("adaptationSensitivity", adaptivePrefs.adaptation_sensitivity ?? "normal");
            form.setValue("enableRealTimeAdaptations", adaptivePrefs.real_time_adaptations ?? true);
            form.setValue("enableLearningPaths", adaptivePrefs.learning_paths ?? true);
          }

          // Load engagement/fun preferences from auth metadata (no DB changes required)
          const meta = user.user_metadata || {};
          const engage = (meta.engagement_preferences as any) || meta;
          form.setValue("enableConfettiCelebrations", engage.enableConfettiCelebrations ?? engage.confettiCelebrations ?? true);
          form.setValue("enableAvatarFrames", engage.enableAvatarFrames ?? engage.avatarFrames ?? true);
          form.setValue("enableDailyQuoteCard", engage.enableDailyQuoteCard ?? engage.dailyQuoteCard ?? true);
          form.setValue("enableSoundEffects", engage.enableSoundEffects ?? engage.soundEffects ?? true);
          form.setValue("enableEmojiBurst", engage.enableEmojiBurst ?? engage.emojiBurst ?? true);
        }
      } catch (error) {
        console.error("Error fetching user preferences:", error);
      }
    };
    
    fetchUserPreferences();
  }, [user, form]);
};
