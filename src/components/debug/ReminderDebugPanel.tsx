
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUnifiedReminderSystem } from '@/hooks/useUnifiedReminderSystem';
import { useReminderProcessing } from '@/hooks/reminders/useReminderProcessing';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Bell, Mail, Smartphone, PlayCircle, TestTube2, Trash2 } from 'lucide-react';

export const ReminderDebugPanel = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [isCreatingTest, setIsCreatingTest] = useState(false);
  
  const { 
    reminders, 
    totalCount, 
    isLoading, 
    refresh,
    batchDismissReminders 
  } = useUnifiedReminderSystem({
    limit: 1000,
    enableRealtime: true
  });
  
  const { processReminders } = useReminderProcessing();

  // Count by delivery methods
  const emailReminders = reminders.filter(r => 
    Array.isArray(r.delivery_methods) && r.delivery_methods.includes('email')
  );
  const inAppReminders = reminders.filter(r => 
    Array.isArray(r.delivery_methods) && r.delivery_methods.includes('in_app')
  );

  const handleProcessNow = async () => {
    setIsProcessing(true);
    try {
      console.log('🔄 Manual reminder processing triggered');
      await processReminders();
      toast.success('Reminder processing completed');
      setTimeout(() => refresh(), 1000);
    } catch (error) {
      console.error('Processing failed:', error);
      toast.error('Processing failed: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTestEmail = async () => {
    setIsTestingEmail(true);
    try {
      console.log('📧 Testing email notification system');
      
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: {
          userId: (await supabase.auth.getUser()).data.user?.id,
          type: 'email',
          subject: 'Test Email from PrepGenie - Reminder System',
          body: 'This is a test email to verify your reminder system is working correctly. If you received this, email notifications are functioning!',
          reminderData: {
            type: 'test',
            priority: 'high'
          }
        }
      });

      if (error) throw error;
      
      console.log('✅ Test email sent successfully:', data);
      toast.success('Test email sent successfully! Check your inbox.');
    } catch (error) {
      console.error('❌ Test email failed:', error);
      toast.error('Test email failed: ' + (error as Error).message);
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleCreateTestReminder = async () => {
    setIsCreatingTest(true);
    try {
      const testTime = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now
      
      const { error } = await supabase
        .from('reminders')
        .insert({
          title: 'Test Email Reminder',
          description: 'This is a test reminder with email delivery - should arrive in 2 minutes',
          reminder_time: testTime.toISOString(),
          type: 'other',
          status: 'pending',
          priority: 'high',
          delivery_methods: ['in_app', 'email'],
          recurrence: 'none'
        });

      if (error) throw error;

      toast.success(`Test reminder created! Will fire at ${testTime.toLocaleTimeString()}`);
      refresh();
    } catch (error) {
      console.error('Failed to create test reminder:', error);
      toast.error('Failed to create test reminder');
    } finally {
      setIsCreatingTest(false);
    }
  };

  const handleClearAll = async () => {
    try {
      const allIds = reminders.map(r => r.id);
      if (allIds.length > 0) {
        await batchDismissReminders(allIds);
        toast.success(`Cleared ${allIds.length} reminders`);
      }
    } catch (error) {
      console.error('Failed to clear reminders:', error);
      toast.error('Failed to clear reminders');
    }
  };

  const getDeliveryIcon = (method: string) => {
    switch (method) {
      case 'email': return <Mail className="h-3 w-3" />;
      case 'in_app': return <Bell className="h-3 w-3" />;
      case 'whatsapp': return <Smartphone className="h-3 w-3" />;
      default: return <Bell className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            🎯 UNIFIED Reminder System Debug Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{totalCount}</div>
              <div className="text-sm text-blue-600">Total Reminders</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{emailReminders.length}</div>
              <div className="text-sm text-green-600">Email Enabled</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700">{inAppReminders.length}</div>
              <div className="text-sm text-yellow-600">In-App Only</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">
                {reminders.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-sm text-purple-600">Pending</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleProcessNow}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              <PlayCircle className="h-4 w-4" />
              {isProcessing ? 'Processing...' : 'Process Now'}
            </Button>
            
            <Button
              onClick={handleTestEmail}
              disabled={isTestingEmail}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              {isTestingEmail ? 'Sending...' : 'Test Email'}
            </Button>
            
            <Button
              onClick={handleCreateTestReminder}
              disabled={isCreatingTest}
              variant="outline"
              className="flex items-center gap-2"
            >
              <TestTube2 className="h-4 w-4" />
              {isCreatingTest ? 'Creating...' : 'Create Test Reminder'}
            </Button>

            <Button
              onClick={handleClearAll}
              variant="destructive"
              size="sm"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reminders List */}
      <Card>
        <CardHeader>
          <CardTitle>Current Reminders ({totalCount})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading reminders...</div>
          ) : reminders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No reminders found</p>
              <p className="text-sm">Create a test reminder to see how the system works</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reminders.slice(0, 10).map((reminder) => (
                <div key={reminder.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{reminder.title}</h4>
                      {reminder.description && (
                        <p className="text-xs text-gray-600 mt-1">{reminder.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={reminder.status === 'pending' ? 'default' : 'secondary'}>
                        {reminder.status}
                      </Badge>
                      <Badge variant="outline">{reminder.priority}</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <span>Due: {new Date(reminder.reminder_time).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Delivery:</span>
                      {Array.isArray(reminder.delivery_methods) ? 
                        reminder.delivery_methods.map((method, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            {getDeliveryIcon(method)}
                            <span>{method}</span>
                          </div>
                        )) : 
                        <span className="text-red-500">Invalid format</span>
                      }
                    </div>
                  </div>
                </div>
              ))}
              
              {reminders.length > 10 && (
                <div className="text-center text-sm text-gray-500 py-2">
                  Showing first 10 of {reminders.length} reminders
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
