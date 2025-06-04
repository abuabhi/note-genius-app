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
      emailNotifications: true,
      studyReminders: true,
      language: "en",
      countryId: "",
      whatsappNotifications: false,
      whatsappPhone: "",
      goalNotifications: true,
      weeklyReports: false,
      weeklyStudyGoalHours: 5,
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
  
  // Fetch initial user notification preferences
  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('notification_preferences, whatsapp_phone, weekly_study_goal_hours')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          // Parse notification preferences safely
          const notificationPrefs = data.notification_preferences ? 
            (typeof data.notification_preferences === 'object' && !Array.isArray(data.notification_preferences) ? 
              data.notification_preferences : {}) : 
            {};
          
          form.setValue("emailNotifications", notificationPrefs.email === true);
          form.setValue("whatsappNotifications", notificationPrefs.whatsapp === true);
          form.setValue("studyReminders", notificationPrefs.studyReminders === true);
          form.setValue("goalNotifications", notificationPrefs.goalNotifications === true);
          form.setValue("weeklyReports", notificationPrefs.weeklyReports === true);
          
          // Other settings
          form.setValue("whatsappPhone", data.whatsapp_phone || "");
          form.setValue("weeklyStudyGoalHours", data.weekly_study_goal_hours || 5);
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
      
      // Save notification preferences to user profile
      if (user) {
        const notificationPreferences = {
          email: data.emailNotifications,
          whatsapp: data.whatsappNotifications,
          in_app: true, // Always enabled
          studyReminders: data.studyReminders,
          goalNotifications: data.goalNotifications,
          weeklyReports: data.weeklyReports
        };
        
        const { error } = await supabase
          .from('profiles')
          .update({
            notification_preferences: notificationPreferences,
            whatsapp_phone: data.whatsappPhone,
            weekly_study_goal_hours: data.weeklyStudyGoalHours
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
