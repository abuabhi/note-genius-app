
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { Bell, Mail, MessageSquare } from "lucide-react";

interface DeliveryMethodsSectionProps {
  form: UseFormReturn<any>;
}

export const DeliveryMethodsSection = ({ form }: DeliveryMethodsSectionProps) => {
  return (
    <div>
      <h4 className="text-sm font-medium mb-4">Delivery Methods</h4>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="emailNotifications"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-green-500" />
                  <FormLabel className="text-sm">Email Notifications</FormLabel>
                </div>
                <FormDescription className="text-xs">
                  Receive study reminders and progress updates via email
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="inAppNotifications"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-blue-500" />
                  <FormLabel className="text-sm">In-App Notifications</FormLabel>
                </div>
                <FormDescription className="text-xs">
                  Show notifications within the application
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="adaptiveNotifications"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-purple-500" />
                  <FormLabel className="text-sm">AI Adaptation Alerts</FormLabel>
                </div>
                <FormDescription className="text-xs">
                  Get notified when AI suggests study adaptations
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
