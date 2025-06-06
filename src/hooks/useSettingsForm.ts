
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/auth"; 
import { supabase } from "@/integrations/supabase/client";
import { settingsFormSchema, SettingsFormValues } from "@/components/settings/schemas/settingsFormSchema";
import { useUserTier, UserTier } from "@/hooks/useUserTier";
import { useCountries } from "@/hooks/useCountries";
import { useUnsavedChangesPrompt } from "@/hooks/useUnsavedChangesPrompt";
import { toast } from "sonner";

export const useSettingsForm = () => {
  const { userTier } = useUserTier();
  const { countries, userCountry, updateUserCountry } = useCountries();
  const { user } = useAuth();
  const isDeanUser = userTier === UserTier.DEAN;
  const navigate = useNavigate();
  
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("account");
  
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      email: user?.email || "user@example.com",
      language: "en",
      countryId: "",
      weeklyStudyGoalHours: 5,
      // Adaptive Learning defaults
      adaptiveDifficulty: "adaptive",
      studyStyle: "distributed", 
      preferredSessionLength: 45,
      maxDailyStudyTime: 180,
      breakFrequency: "moderate",
      adaptationSensitivity: "normal",
      enableRealTimeAdaptations: true,
      enableLearningPaths: true,
      // Notification defaults
      emailNotifications: true,
      inAppNotifications: true,
      adaptiveNotifications: true,
      studySessionReminders: true,
      goalDeadlineReminders: true,
      reminderFrequency: "15min",
      quietHoursEnabled: false,
      quietHoursStart: "22:00",
      quietHoursEnd: "08:00",
    },
    mode: "onBlur",
  });

  const { reset, formState: { isDirty, isSubmitSuccessful } } = form;

  // Use the unsaved changes prompt hook
  useUnsavedChangesPrompt(
    isDirty,
    setShowUnsavedChangesDialog,
    setPendingNavigation
  );
  
  // Fetch initial user preferences
  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('weekly_study_goal_hours, notification_preferences')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          form.setValue("weeklyStudyGoalHours", data.weekly_study_goal_hours || 5);
          
          // Load notification preferences if they exist
          if (data.notification_preferences) {
            const notifPrefs = typeof data.notification_preferences === 'string' 
              ? JSON.parse(data.notification_preferences) 
              : data.notification_preferences;
            
            form.setValue("emailNotifications", notifPrefs.email ?? true);
            form.setValue("inAppNotifications", notifPrefs.in_app ?? true);
            form.setValue("adaptiveNotifications", notifPrefs.adaptive ?? true);
          }
        }
      } catch (error) {
        console.error("Error fetching user preferences:", error);
      }
    };
    
    fetchUserPreferences();
  }, [user, form]);

  useEffect(() => {
    if (userCountry) {
      form.setValue("countryId", userCountry.id);
    }
  }, [userCountry, form]);

  // Reset form when submission is successful
  useEffect(() => {
    if (isSubmitSuccessful) {
      setShowUnsavedChangesDialog(false);
    }
  }, [isSubmitSuccessful]);

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      console.log("Form submitted with values:", data);
      
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
            // Store adaptive learning preferences in a JSONB column
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
      reset(data); // Reset form state but keep the values
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    }
  };

  const handleCountryChange = async (countryId: string) => {
    form.setValue("countryId", countryId, { 
      shouldDirty: true,
      shouldValidate: true 
    });
  };

  // Confirm navigation and discard changes
  const confirmNavigation = () => {
    setShowUnsavedChangesDialog(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  return {
    form,
    user,
    userTier,
    isDeanUser,
    countries,
    activeTab,
    setActiveTab,
    showUnsavedChangesDialog,
    setShowUnsavedChangesDialog,
    pendingNavigation,
    onSubmit,
    handleCountryChange,
    confirmNavigation,
    isDirty,
    reset
  };
};
