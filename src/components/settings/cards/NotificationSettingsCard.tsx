
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { SettingsFormValues } from "../schemas/settingsFormSchema";
import { UserTier } from '@/hooks/useUserTier';

interface NotificationSettingsCardProps {
  form: UseFormReturn<SettingsFormValues>;
  userTier?: UserTier;
}

export const NotificationSettingsCard: React.FC<NotificationSettingsCardProps> = ({ form, userTier }) => {
  const isGraduateOrHigher = userTier === UserTier.GRADUATE || userTier === UserTier.MASTER || userTier === UserTier.DEAN;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose which notifications you want to receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="studyReminders"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Study Reminders</FormLabel>
                <FormDescription>
                  Get notified about your upcoming study sessions
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="goalNotifications"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Goal Updates</FormLabel>
                <FormDescription>
                  Get notified about your study goal progress
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weeklyReports"
          render={({ field }) => (
            <FormItem className={`flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm ${!isGraduateOrHigher ? "opacity-60" : ""}`}>
              <div className="space-y-0.5">
                <FormLabel>Weekly Reports</FormLabel>
                <FormDescription>
                  Receive weekly study summary reports
                  {!isGraduateOrHigher && " (Requires GRADUATE tier or higher)"}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={isGraduateOrHigher && field.value}
                  onCheckedChange={field.onChange}
                  disabled={!isGraduateOrHigher}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};

export default NotificationSettingsCard;
