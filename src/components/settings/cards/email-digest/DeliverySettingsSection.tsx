
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Clock, Send, Loader2 } from "lucide-react";
import { EmailDigestPreferences } from "@/hooks/useEmailDigestPreferences";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { COMPREHENSIVE_TIMEZONES, getTimezonesByRegion, getCurrentTimeInTimezone } from "@/utils/timezoneData";

interface DeliverySettingsSectionProps {
  preferences: EmailDigestPreferences;
  updatePreferences: (updates: Partial<EmailDigestPreferences>) => Promise<void>;
}

export const DeliverySettingsSection = ({ preferences, updatePreferences }: DeliverySettingsSectionProps) => {
  const [sendingTest, setSendingTest] = useState(false);
  const timezonesByRegion = getTimezonesByRegion();

  const handleSendTestEmail = async () => {
    setSendingTest(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch('/functions/v1/send-test-digest', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (response.ok) {
        toast.success(`Test email sent successfully to ${result.sentTo}!`);
      } else {
        toast.error(result.error || 'Failed to send test email');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-4 w-4 text-green-600" />
          Delivery Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Master Toggle */}
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border">
          <div>
            <div className="font-medium text-green-900">Enable Email Digest</div>
            <div className="text-sm text-green-700">
              Receive daily summaries of your study progress
            </div>
          </div>
          <Switch
            checked={preferences.digest_enabled}
            onCheckedChange={(enabled) => updatePreferences({ digest_enabled: enabled })}
          />
        </div>

        {preferences.digest_enabled && (
          <>
            {/* Frequency and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Frequency</label>
                <Select
                  value={preferences.frequency}
                  onValueChange={(frequency: 'daily' | 'weekly' | 'never') => 
                    updatePreferences({ frequency })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Time</label>
                <Input
                  type="time"
                  value={preferences.digest_time}
                  onChange={(e) => updatePreferences({ digest_time: e.target.value })}
                />
              </div>
            </div>

            {/* Timezone with regional grouping */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Timezone</label>
              <Select
                value={preferences.timezone}
                onValueChange={(timezone) => updatePreferences({ timezone })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {Object.entries(timezonesByRegion).map(([region, timezones]) => (
                    <div key={region}>
                      <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground border-b">
                        {region}
                      </div>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          <div className="flex flex-col">
                            <span>{tz.label}</span>
                            <span className="text-xs text-muted-foreground">
                              Current: {getCurrentTimeInTimezone(tz.value)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Current time in selected timezone: {getCurrentTimeInTimezone(preferences.timezone)}
              </p>
            </div>

            {/* Test Email Button */}
            <div className="pt-4 border-t">
              <Button
                onClick={handleSendTestEmail}
                disabled={sendingTest}
                variant="outline"
                className="w-full"
              >
                {sendingTest ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending Test Email...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Test Email Now
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Send a test email to verify your settings are working
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
