
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUnifiedReminderSystem } from '@/hooks/useUnifiedReminderSystem';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Bell, Play, TestTube, Plus, Loader2 } from 'lucide-react';

export const ReminderDebugPanel = () => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [isCreatingReminder, setIsCreatingReminder] = useState(false);
  
  const { 
    reminders, 
    isLoading, 
    refresh,
    totalCount 
  } = useUnifiedReminderSystem({
    limit: 1000,
    enableRealtime: false,
    status: ['pending', 'sent', 'failed', 'cancelled']
  });

  const handleProcessNow = async () => {
    setIsProcessing(true);
    try {
      console.log('🔄 Manually triggering reminder processing...');
      
      const { data, error } = await supabase.functions.invoke('process-reminders');
      
      if (error) {
        console.error('❌ Manual processing failed:', error);
        toast.error(`Processing failed: ${error.message}`);
        return;
      }
      
      console.log('✅ Manual processing result:', data);
      toast.success(`Processing completed: ${data?.processed || 0} reminders processed`);
      
      // Refresh the reminders list
      setTimeout(() => refresh(), 1000);
      
    } catch (error) {
      console.error('❌ Manual processing error:', error);
      toast.error('Failed to process reminders');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTestEmail = async () => {
    setIsTestingEmail(true);
    try {
      console.log('🧪 Testing email notification system...');
      
      const { data, error } = await supabase.functions.invoke('send-test-digest');
      
      if (error) {
        console.error('❌ Email test failed:', error);
        toast.error(`Email test failed: ${error.message}`);
        return;
      }
      
      console.log('✅ Email test result:', data);
      toast.success('Test email sent successfully!');
      
    } catch (error) {
      console.error('❌ Email test error:', error);
      toast.error('Failed to send test email');
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleCreateTestReminder = async () => {
    if (!user) return;
    
    setIsCreatingReminder(true);
    try {
      console.log('➕ Creating test reminder...');
      
      // Create a reminder for 1 minute from now
      const reminderTime = new Date(Date.now() + 60000).toISOString();
      
      const { data, error } = await supabase
        .from('reminders')
        .insert({
          user_id: user.id,
          title: 'Test Email Reminder',
          description: 'This is a test reminder to verify email notifications work',
          reminder_time: reminderTime,
          type: 'other',
          status: 'pending',
          priority: 'medium',
          delivery_methods: ['in_app', 'email'], // Include email delivery
          recurrence: 'none'
        })
        .select()
        .single();
      
      if (error) {
        console.error('❌ Failed to create test reminder:', error);
        toast.error(`Failed to create reminder: ${error.message}`);
        return;
      }
      
      console.log('✅ Test reminder created:', data);
      toast.success('Test reminder created! It will trigger in 1 minute.');
      
      // Refresh the reminders list
      setTimeout(() => refresh(), 500);
      
    } catch (error) {
      console.error('❌ Test reminder creation error:', error);
      toast.error('Failed to create test reminder');
    } finally {
      setIsCreatingReminder(false);
    }
  };

  // Group reminders by status for better display
  const remindersByStatus = reminders.reduce((acc, reminder) => {
    if (!acc[reminder.status]) {
      acc[reminder.status] = [];
    }
    acc[reminder.status].push(reminder);
    return acc;
  }, {} as Record<string, typeof reminders>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            Reminder System Debug Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Control Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleProcessNow}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Process Now
            </Button>
            
            <Button
              onClick={handleTestEmail}
              disabled={isTestingEmail}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isTestingEmail ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <TestTube className="h-4 w-4" />
              )}
              Test Email
            </Button>
            
            <Button
              onClick={handleCreateTestReminder}
              disabled={isCreatingReminder}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isCreatingReminder ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Create Test Reminder
            </Button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </CardContent>
            </Card>
            
            {Object.entries(remindersByStatus).map(([status, statusReminders]) => (
              <Card key={status}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-600">{statusReminders.length}</div>
                  <div className="text-sm text-muted-foreground capitalize">{status}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Reminder List */}
          {isLoading ? (
            <div className="text-center py-4">Loading reminders...</div>
          ) : reminders.length > 0 ? (
            <div className="space-y-2">
              <h4 className="font-semibold">Recent Reminders:</h4>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {reminders.slice(0, 20).map((reminder) => (
                  <div key={reminder.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium truncate">{reminder.title}</h5>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {reminder.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {reminder.priority}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Type: {reminder.type.replace('_', ' ')}</div>
                      <div>
                        Delivery: {Array.isArray(reminder.delivery_methods) 
                          ? reminder.delivery_methods.join(', ') 
                          : 'in_app'}
                      </div>
                      <div>
                        Time: {reminder.reminder_time ? 
                          new Date(reminder.reminder_time).toLocaleString() : 
                          'Not set'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No reminders found. Create a test reminder to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
