
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/auth"; 
import { supabase } from "@/integrations/supabase/client";
import { settingsFormSchema, SettingsFormValues } from "./schemas/settingsFormSchema";
import { useUserTier, UserTier } from "@/hooks/useUserTier";
import { useCountries } from "@/hooks/useCountries";
import { useUnsavedChangesPrompt } from "@/hooks/useUnsavedChangesPrompt";
import UnsavedChangesDialog from "@/components/dialogs/UnsavedChangesDialog";
import { toast } from "sonner";
import { 
  Form, 
  FormControl, 
  FormItem, 
  FormLabel, 
  FormDescription 
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

// Import the component properly - if it has both named and default exports, you can use either
import AccountSettingsCard from "./cards/AccountSettingsCard";
import { AppearanceCard } from "./cards/AppearanceCard";
import { NotificationsCard } from "./cards/NotificationsCard";
import { NotificationSettingsCard } from "./cards/NotificationSettingsCard";
import { DoNotDisturbCard } from "./cards/DoNotDisturbCard";
import { UpgradeTierCard } from "./cards/UpgradeTierCard";
import { SubjectsSettingsCard } from "./cards/SubjectsSettingsCard";

// Now let's use these imports in the component

const SettingsForm = () => {
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
      darkMode: false,
      language: "en",
      countryId: "",
      whatsappNotifications: false,
      whatsappPhone: "",
      goalNotifications: true,
      weeklyReports: false,
      dndEnabled: false,
      dndStartTime: "22:00",
      dndEndTime: "07:00",
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
          .select('notification_preferences, whatsapp_phone, do_not_disturb, dnd_start_time, dnd_end_time')
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
          
          // DND settings
          form.setValue("whatsappPhone", data.whatsapp_phone || "");
          form.setValue("dndEnabled", data.do_not_disturb || false);
          form.setValue("dndStartTime", data.dnd_start_time || "22:00");
          form.setValue("dndEndTime", data.dnd_end_time || "07:00");
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
            do_not_disturb: data.dndEnabled,
            dnd_start_time: data.dndEnabled ? data.dndStartTime : null,
            dnd_end_time: data.dndEnabled ? data.dndEndTime : null
          })
          .eq('id', user.id);
          
        if (error) {
          console.error("Error saving notification preferences:", error);
          toast.error("Failed to save notification preferences");
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

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TabsContent value="account" className="space-y-6">
              {/* New Upgrade Tier Card added at the top for visibility */}
              <UpgradeTierCard />
              
              <AccountSettingsCard 
                user={user}
                userTier={userTier}
                form={form}
                countries={countries}
                onCountryChange={handleCountryChange}
              />
              
              <AppearanceCard form={form} />
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-6">
              <NotificationsCard form={form} />
              
              <NotificationSettingsCard form={form} userTier={userTier} />
              
              <DoNotDisturbCard form={form} />
            </TabsContent>
            
            <TabsContent value="subjects" className="space-y-6">
              <SubjectsSettingsCard />
            </TabsContent>

            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => reset()}
                disabled={!isDirty}
              >
                Reset
              </Button>
              <Button 
                type="submit" 
                disabled={!isDirty || form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>

      {/* Unsaved changes confirmation dialog */}
      <UnsavedChangesDialog 
        isOpen={showUnsavedChangesDialog}
        onClose={() => setShowUnsavedChangesDialog(false)}
        onConfirm={confirmNavigation}
      />
    </>
  );
};

export default SettingsForm;
