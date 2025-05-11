
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { SettingsFormValues } from "../schemas/settingsFormSchema";

interface NotificationsCardProps {
  form: UseFormReturn<SettingsFormValues>;
}

export const NotificationsCard: React.FC<NotificationsCardProps> = ({ form }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>
          Manage how and when Study Compass notifies you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="emailNotifications"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Email Notifications</FormLabel>
                <FormDescription>
                  Receive notifications via email
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
          name="whatsappNotifications"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>WhatsApp Notifications</FormLabel>
                <FormDescription>
                  Receive notifications via WhatsApp
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

        {form.watch('whatsappNotifications') && (
          <FormField
            control={form.control}
            name="whatsappPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp Phone Number</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="+1 (123) 456-7890"
                  />
                </FormControl>
                <FormDescription>
                  Enter your WhatsApp phone number with country code
                </FormDescription>
              </FormItem>
            )}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsCard;
