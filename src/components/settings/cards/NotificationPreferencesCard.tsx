
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { Bell, Mail, MessageSquare, Clock, Target } from "lucide-react";

interface NotificationPreferencesCardProps {
  form: UseFormReturn<any>;
}

export const NotificationPreferencesCard = ({ form }: NotificationPreferencesCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-600" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Configure how and when you receive study reminders and AI suggestions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Delivery Methods */}
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

        {/* Notification Types */}
        <div>
          <h4 className="text-sm font-medium mb-4">Study Reminders</h4>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="studySessionReminders"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <FormLabel className="text-sm">Study Session Reminders</FormLabel>
                    </div>
                    <FormDescription className="text-xs">
                      Reminders for scheduled study sessions
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
              name="goalDeadlineReminders"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-red-500" />
                      <FormLabel className="text-sm">Goal Deadline Reminders</FormLabel>
                    </div>
                    <FormDescription className="text-xs">
                      Alerts for approaching study goal deadlines
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

        {/* Timing Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="reminderFrequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Reminder Timing</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || "15min"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timing" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="15min">15 minutes before</SelectItem>
                    <SelectItem value="30min">30 minutes before</SelectItem>
                    <SelectItem value="1hour">1 hour before</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  How far in advance to send reminders
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quietHoursEnabled"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <div className="flex items-center space-x-2">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel>Quiet Hours</FormLabel>
                </div>
                <FormDescription>
                  Pause notifications during specified hours
                </FormDescription>
              </FormItem>
            )}
          />
        </div>

        {form.watch('quietHoursEnabled') && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <FormField
              control={form.control}
              name="quietHoursStart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quietHoursEnd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
