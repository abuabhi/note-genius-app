
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, MessageSquare, Clock, Target } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

const notificationPreferencesSchema = z.object({
  emailNotifications: z.boolean(),
  whatsappNotifications: z.boolean(),
  whatsappPhone: z.string().optional(),
  inAppNotifications: z.boolean(),
  studyReminders: z.boolean(),
  goalNotifications: z.boolean(),
  flashcardReminders: z.boolean(),
  reminderFrequency: z.enum(['immediate', '15min', '30min', '1hour']),
  quietHoursEnabled: z.boolean(),
  quietHoursStart: z.string(),
  quietHoursEnd: z.string(),
});

type NotificationPreferencesValues = z.infer<typeof notificationPreferencesSchema>;

export const NotificationPreferences = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm<NotificationPreferencesValues>({
    resolver: zodResolver(notificationPreferencesSchema),
    defaultValues: {
      emailNotifications: true,
      whatsappNotifications: false,
      whatsappPhone: '',
      inAppNotifications: true,
      studyReminders: true,
      goalNotifications: true,
      flashcardReminders: true,
      reminderFrequency: 'immediate',
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
    },
  });

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('notification_preferences, whatsapp_phone')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data?.notification_preferences) {
          const prefs = data.notification_preferences as any;
          form.reset({
            emailNotifications: prefs.email ?? true,
            whatsappNotifications: prefs.whatsapp ?? false,
            whatsappPhone: data.whatsapp_phone || '',
            inAppNotifications: prefs.in_app ?? true,
            studyReminders: prefs.studyReminders ?? true,
            goalNotifications: prefs.goalNotifications ?? true,
            flashcardReminders: prefs.flashcardReminders ?? true,
            reminderFrequency: prefs.reminderFrequency || 'immediate',
            quietHoursEnabled: prefs.quietHoursEnabled ?? false,
            quietHoursStart: prefs.quietHoursStart || '22:00',
            quietHoursEnd: prefs.quietHoursEnd || '08:00',
          });
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
        toast.error('Failed to load notification preferences');
      }
    };

    loadPreferences();
  }, [user, form]);

  const onSubmit = async (data: NotificationPreferencesValues) => {
    if (!user) return;

    try {
      setLoading(true);

      const notificationPreferences = {
        email: data.emailNotifications,
        whatsapp: data.whatsappNotifications,
        in_app: data.inAppNotifications,
        studyReminders: data.studyReminders,
        goalNotifications: data.goalNotifications,
        flashcardReminders: data.flashcardReminders,
        reminderFrequency: data.reminderFrequency,
        quietHoursEnabled: data.quietHoursEnabled,
        quietHoursStart: data.quietHoursStart,
        quietHoursEnd: data.quietHoursEnd,
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          notification_preferences: notificationPreferences,
          whatsapp_phone: data.whatsappPhone,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Notification preferences updated successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save notification preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Delivery Methods */}
              <div>
                <h3 className="text-lg font-medium mb-4">Delivery Methods</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="inAppNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            <FormLabel className="text-base">In-App Notifications</FormLabel>
                          </div>
                          <FormDescription>
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
                    name="emailNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <FormLabel className="text-base">Email Notifications</FormLabel>
                          </div>
                          <FormDescription>
                            Receive notifications via email
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
                    name="whatsappNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            <FormLabel className="text-base">WhatsApp Notifications</FormLabel>
                          </div>
                          <FormDescription>
                            Receive notifications via WhatsApp
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                              placeholder="+1234567890" 
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Include country code (e.g., +1 for US)
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>

              <Separator />

              {/* Notification Types */}
              <div>
                <h3 className="text-lg font-medium mb-4">Notification Types</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="studyReminders"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <FormLabel className="text-base">Study Reminders</FormLabel>
                          </div>
                          <FormDescription>
                            Reminders for study sessions and events
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
                    name="goalNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            <FormLabel className="text-base">Goal Notifications</FormLabel>
                          </div>
                          <FormDescription>
                            Updates on goal progress and deadlines
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
                    name="flashcardReminders"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <FormLabel className="text-base">Flashcard Review Reminders</FormLabel>
                          </div>
                          <FormDescription>
                            Reminders to review flashcard sets
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

              <Separator />

              {/* Advanced Settings */}
              <div>
                <h3 className="text-lg font-medium mb-4">Advanced Settings</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="reminderFrequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Reminder Frequency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
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
                          How far in advance to send reminder notifications
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quietHoursEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Quiet Hours</FormLabel>
                          <FormDescription>
                            Pause notifications during specified hours
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch('quietHoursEnabled') && (
                    <div className="grid grid-cols-2 gap-4">
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
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Saving...' : 'Save Preferences'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
