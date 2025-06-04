
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { SettingsFormValues } from "../schemas/settingsFormSchema";
import { Bell, Mail, MessageCircle } from "lucide-react";

interface NotificationsCardProps {
  form: UseFormReturn<SettingsFormValues>;
}

export const NotificationsCard: React.FC<NotificationsCardProps> = ({ form }) => {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-mint-100/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-mint-50/50 to-blue-50/30 border-b border-mint-100/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-mint-100 rounded-full flex items-center justify-center">
            <Bell className="h-5 w-5 text-mint-600" />
          </div>
          <div>
            <CardTitle className="text-mint-800">Notification Settings</CardTitle>
            <CardDescription className="text-slate-600">
              Manage how and when Study Compass notifies you
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <FormField
          control={form.control}
          name="emailNotifications"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-mint-100 bg-white/50 p-4 shadow-sm hover:shadow-md transition-all">
              <div className="space-y-0.5 flex items-center gap-3">
                <Mail className="h-5 w-5 text-mint-600" />
                <div>
                  <FormLabel className="text-slate-700 font-medium">Email Notifications</FormLabel>
                  <FormDescription className="text-slate-600">
                    Receive notifications via email
                  </FormDescription>
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-mint-500"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="whatsappNotifications"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-mint-100 bg-white/50 p-4 shadow-sm hover:shadow-md transition-all">
              <div className="space-y-0.5 flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-mint-600" />
                <div>
                  <FormLabel className="text-slate-700 font-medium">WhatsApp Notifications</FormLabel>
                  <FormDescription className="text-slate-600">
                    Receive notifications via WhatsApp
                  </FormDescription>
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-mint-500"
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
              <FormItem className="ml-8">
                <FormLabel className="text-slate-700 font-medium">WhatsApp Phone Number</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="+1 (123) 456-7890"
                    className="bg-white/60 border-mint-200 focus:border-mint-400 focus:ring-mint-400/20"
                  />
                </FormControl>
                <FormDescription className="text-slate-600">
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
