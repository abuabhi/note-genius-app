
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { UserTier } from "@/hooks/useRequireAuth";
import { Badge } from "@/components/ui/badge";

interface NotificationSettingsCardProps {
  form: any;
  userTier: UserTier;
}

export function NotificationSettingsCard({ form, userTier }: NotificationSettingsCardProps) {
  const isPremiumUser = userTier !== UserTier.SCHOLAR;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="whatsappNotifications"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <FormLabel className="text-base">WhatsApp Notifications</FormLabel>
                <FormDescription>
                  Receive notifications via WhatsApp
                </FormDescription>
              </div>
              <FormControl>
                <Switch 
                  checked={field.value} 
                  onCheckedChange={field.onChange}
                  disabled={!isPremiumUser}
                />
              </FormControl>
              {!isPremiumUser && (
                <Badge variant="outline" className="ml-2">Premium</Badge>
              )}
            </FormItem>
          )}
        />
        
        {form.watch("whatsappNotifications") && (
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
                    disabled={!isPremiumUser}
                  />
                </FormControl>
                <FormDescription>
                  Enter your phone number with country code
                </FormDescription>
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="goalNotifications"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Goal Reminders</FormLabel>
                <FormDescription>
                  Get reminders about upcoming goal deadlines
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
            <FormItem className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Weekly Reports</FormLabel>
                <FormDescription>
                  Receive weekly study progress reports
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
      </CardContent>
    </Card>
  );
}
