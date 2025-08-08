import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { useEmailDigestPreferences } from "@/hooks/useEmailDigestPreferences";
import { DeliverySettingsSection } from "./DeliverySettingsSection";
import { ContentTypesSection } from "./ContentTypesSection";
import { ContentLimitsSection } from "./ContentLimitsSection";
import { TaskSettingsSection } from "./TaskSettingsSection";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
export const EmailDigestCard = () => {
  const { preferences, loading, updatePreferences } = useEmailDigestPreferences();
  const [activating, setActivating] = useState(false);
  const [sending, setSending] = useState(false);

  const handleActivateCron = async () => {
    try {
      setActivating(true);
      const { error } = await supabase.functions.invoke('activate-digest-cron');
      if (error) throw error;
      toast.success('Daily digest cron activated');
    } catch (e: any) {
      toast.error(`Failed to activate cron: ${e.message || e}`);
    } finally {
      setActivating(false);
    }
  };

  const handleSendTest = async () => {
    try {
      setSending(true);
      const { error } = await supabase.functions.invoke('send-test-digest');
      if (error) throw error;
      toast.success('Test digest email sent');
    } catch (e: any) {
      toast.error(`Failed to send test email: ${e.message || e}`);
    } finally {
      setSending(false);
    }
  };
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            Email Digest Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!preferences) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-600" />
          Email Digest Settings
        </CardTitle>
        <CardDescription>
          Get a personalized daily digest of your study progress, goals, and tasks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={handleActivateCron} disabled={activating}>
            {activating ? 'Activating…' : 'Activate Daily Digest Cron'}
          </Button>
          <Button size="sm" onClick={handleSendTest} disabled={sending}>
            {sending ? 'Sending…' : 'Send Test Digest Email'}
          </Button>
        </div>

        <DeliverySettingsSection 
          preferences={preferences} 
          updatePreferences={updatePreferences}
        />
        
        <ContentTypesSection 
          preferences={preferences} 
          updatePreferences={updatePreferences}
        />
        
        <ContentLimitsSection 
          preferences={preferences} 
          updatePreferences={updatePreferences}
        />
        
        <TaskSettingsSection 
          preferences={preferences} 
          updatePreferences={updatePreferences}
        />
      </CardContent>
    </Card>
  );
};
