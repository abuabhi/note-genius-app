
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FormControl, FormField, FormItem, FormDescription } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { UserTier } from "@/hooks/useRequireAuth";

interface NotificationSettingsCardProps {
  form: UseFormReturn<any>;
  userTier: UserTier;
}

export const NotificationSettingsCard = ({ form, userTier }: NotificationSettingsCardProps) => {
  const canUseWhatsApp = userTier === UserTier.DEAN || userTier === UserTier.MASTER;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>
          Configure how you want to receive notifications and reminders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="emailNotifications"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <FormDescription>
                    Receive notifications about your goals and study plans
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
          
          <Separator />
          
          <FormField
            control={form.control}
            name="whatsappNotifications"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center">
                    <Label>WhatsApp Notifications</Label>
                    {!canUseWhatsApp && (
                      <span className="ml-2 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                        Premium
                      </span>
                    )}
                  </div>
                  <FormDescription>
                    Receive important reminders via WhatsApp
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value && canUseWhatsApp}
                    onCheckedChange={field.onChange}
                    disabled={!canUseWhatsApp}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          {form.watch("whatsappNotifications") && canUseWhatsApp && (
            <FormField
              control={form.control}
              name="whatsappPhone"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <Label>WhatsApp Phone Number</Label>
                  </div>
                  <FormControl>
                    <div className="flex">
                      <Input
                        placeholder="e.g. +1234567890 (with country code)"
                        className={cn("flex-1", {
                          "border-red-500": form.formState.errors.whatsappPhone
                        })}
                        {...field}
                        value={field.value || ""}
                      />
                    </div>
                  </FormControl>
                  {form.formState.errors.whatsappPhone && (
                    <p className="text-xs text-red-500 mt-1">
                      {form.formState.errors.whatsappPhone.message as string}
                    </p>
                  )}
                  <FormDescription>
                    Enter your phone number with country code
                  </FormDescription>
                </FormItem>
              )}
            />
          )}
          
          <Separator />
          
          <FormField
            control={form.control}
            name="studyReminders"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Study Reminders</Label>
                  <FormDescription>
                    Get reminded about upcoming study sessions
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
              <FormItem className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Goal Notifications</Label>
                  <FormDescription>
                    Receive updates about your goal progress and deadlines
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
              <FormItem className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly Progress Reports</Label>
                  <FormDescription>
                    Get a summary of your weekly study progress
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
        </div>
      </CardContent>
    </Card>
  );
};
