import { useEffect, useRef, useState, startTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from "@/contexts/auth";
import { useUserTier, UserTier } from "@/hooks/useUserTier";
import { useCountries } from "@/hooks/useCountries";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { settingsFormSchema, SettingsFormValues } from "@/components/settings/schemas/settingsFormSchema";

export const useSettingsForm = () => {
  // Consolidated settings form hook - v2 (cache refresh)
  const { user } = useAuth();
  const { userTier } = useUserTier();
  const { countries, userCountry, updateUserCountry } = useCountries();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("account");
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  const isDeanUser = userTier === UserTier.DEAN;

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      username: "",
      email: user?.email || "",
      school: "",
      whatsapp_phone: "",
      avatar_url: user?.user_metadata?.avatar_url || "",
      country_id: "",
      timezone: "UTC",
      language: "en",
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
      // Fun & Feedback defaults
      enableConfettiCelebrations: true,
      enableAvatarFrames: true,
      enableDailyQuoteCard: true,
      enableSoundEffects: true,
      enableEmojiBurst: true,
    },
    mode: "onBlur",
  });

  const { reset, formState: { isDirty, isSubmitSuccessful } } = form;

  // Handle tab parameter from URL and load user data
  // Apply ?tab= URL param exactly when it changes — independent of profile load.
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (
      tabParam &&
      ['account', 'subjects', 'adaptive', 'notifications', 'subscription', 'study', 'password'].includes(
        tabParam
      )
    ) {
      startTransition(() => {
        setActiveTab(tabParam);
      });
    }
  }, [searchParams]);

  // Load user preferences data exactly once per user. Without the ref guard
  // this effect re-fired every time `form` changed reference or `userCountry`
  // arrived async, causing duplicate profile fetches and noticeable lag.
  const loadedForUserRef = useRef<string | null>(null);
  useEffect(() => {
    if (!user || loadedForUserRef.current === user.id) return;
    loadedForUserRef.current = user.id;

    const fetchUserPreferences = async () => {
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

          // Load engagement/fun preferences from auth metadata
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
        // Reset guard so a manual reload / next user can retry
        loadedForUserRef.current = null;
      }
    };

    fetchUserPreferences();
  }, [user, form]);

  // Sync country independently when it resolves async — does not retrigger the
  // full profile fetch above.
  useEffect(() => {
    if (userCountry?.id) {
      form.setValue("country_id", userCountry.id);
    }
  }, [userCountry, form]);

  // Settings mutation following the announcement pattern
  const settingsMutation = useMutation({
    mutationFn: async (data: SettingsFormValues) => {
      if (!user) {
        throw new Error("User not authenticated");
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
      };

      // Update user profile
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);
        
      if (error) {
        throw error;
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
      toast.success("Settings saved successfully");
      setShowUnsavedChangesDialog(false);
    },
    onError: (error) => {
      toast.error("Failed to save settings");
      console.error('Error saving settings:', error);
    }
  });

  // Custom navigation blocking for unsaved changes
  useEffect(() => {
    if (!isDirty) return;

    // Custom event handler for navigation attempts
    const handleBeforeNavigate = (event: any) => {
      // Don't block if form is pristine (no changes)
      if (!isDirty) return;

      // If there's a nextPath, store it 
      if (event.detail && event.detail.nextPath) {
        event.preventDefault();
        setPendingNavigation(event.detail.nextPath);
        setShowUnsavedChangesDialog(true);
      }
    };

    // Add event listener
    window.addEventListener('beforeNavigate', handleBeforeNavigate);

    return () => {
      window.removeEventListener('beforeNavigate', handleBeforeNavigate);
    };
  }, [isDirty, setShowUnsavedChangesDialog, setPendingNavigation]);

  // Reset pending navigation when location changes
  useEffect(() => {
    setPendingNavigation(null);
  }, [location, setPendingNavigation]);

  // Reset form when submission is successful
  useEffect(() => {
    if (isSubmitSuccessful) {
      setShowUnsavedChangesDialog(false);
    }
  }, [isSubmitSuccessful]);

  const onSubmit = async (data: SettingsFormValues) => {
    settingsMutation.mutate(data);
  };

  const handleCountryChange = async (countryId: string) => {
    form.setValue("country_id", countryId, { 
      shouldDirty: true,
      shouldValidate: true 
    });
  };

  // Confirm navigation and discard changes
  const confirmNavigation = () => {
    setShowUnsavedChangesDialog(false);
    if (pendingNavigation) {
      startTransition(() => {
        navigate(pendingNavigation);
      });
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
    reset: () => reset()
  };
};