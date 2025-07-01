
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const ReminderDebugPanel = () => {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchDebugInfo = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('debug-reminders', {
        body: {},
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (error) throw error;
      setDebugInfo(data);
      toast.success('Debug info loaded');
    } catch (error) {
      console.error('Debug error:', error);
      toast.error('Failed to load debug info');
    } finally {
      setLoading(false);
    }
  };

  const processRemindersNow = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-reminders');
      
      if (error) throw error;
      
      toast.success(`Processed ${data.processed || 0} reminders`);
      console.log('Process result:', data);
      
      // Refresh debug info
      await fetchDebugInfo();
    } catch (error) {
      console.error('Process error:', error);
      toast.error('Failed to process reminders');
    } finally {
      setLoading(false);
    }
  };

  const testEmailNotification = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: {
          userId: user.id,
          type: 'email',
          subject: 'Test Reminder Email from PrepGenie',
          body: 'This is a test email to verify your reminder system is working correctly.',
          reminderData: {
            type: 'test',
            priority: 'normal'
          }
        }
      });
      
      if (error) throw error;
      
      toast.success('Test email sent successfully!');
      console.log('Email result:', data);
    } catch (error) {
      console.error('Test email error:', error);
      toast.error('Failed to send test email');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Please log in to use the reminder debug panel.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔧 Reminder Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={fetchDebugInfo} disabled={loading}>
            Load Debug Info
          </Button>
          <Button onClick={processRemindersNow} disabled={loading} variant="outline">
            Process Reminders Now
          </Button>
          <Button onClick={testEmailNotification} disabled={loading} variant="outline">
            Send Test Email
          </Button>
        </div>
        
        {debugInfo && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Debug Information:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
