
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useCountries } from "@/hooks/useCountries";
import { useUserTier } from "@/hooks/useUserTier";
import { UserTier } from "@/hooks/useRequireAuth";
import AccountSettingsCard from "./cards/AccountSettingsCard";
import NotificationsCard from "./cards/NotificationsCard";
import AppearanceCard from "./cards/AppearanceCard";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingsFormSchema, type SettingsFormValues } from "./schemas/settingsFormSchema";
import { Form } from "@/components/ui/form";

const SettingsForm = () => {
  const { userTier } = useUserTier();
  const { countries, userCountry, updateUserCountry } = useCountries();
  const { user } = useAuth();
  const isDeanUser = userTier === UserTier.DEAN;
  
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      email: user?.email || "user@example.com",
      emailNotifications: true,
      studyReminders: true,
      darkMode: false,
      language: "en",
      countryId: "",
    },
    mode: "onBlur",
  });

  const { reset, formState: { isDirty } } = form;

  useEffect(() => {
    if (userCountry) {
      form.setValue("countryId", userCountry.id);
    }
  }, [userCountry, form]);

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <AccountSettingsCard 
          user={user}
          userTier={userTier}
          form={form}
          countries={countries}
          onCountryChange={handleCountryChange}
        />

        <NotificationsCard form={form} />

        <AppearanceCard form={form} />

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
  );
};

export default SettingsForm;
