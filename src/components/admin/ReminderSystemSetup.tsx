
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export const ReminderSystemSetup = () => {
  const [isActivating, setIsActivating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const activateCronJob = async () => {
    setIsActivating(true);
    try {
      console.log('🔄 Activating reminder cron job...');
      
      const { data, error } = await supabase.functions.invoke('setup-reminder-cron');
      
      if (error) throw error;
      
      console.log('✅ Cron job activated:', data);
      toast.success('Reminder processing cron job activated successfully!');
    } catch (error) {
      console.error('❌ Failed to activate cron job:', error);
      toast.error('Failed to activate cron job');
    } finally {
      setIsActivating(false);
    }
  };

  const manualProcess = async () => {
    setIsProcessing(true);
    try {
      console.log('🔄 Manually processing reminders...');
      
      const { data, error } = await supabase.functions.invoke('process-reminders');
      
      if (error) throw error;
      
      console.log('✅ Manual processing completed:', data);
      toast.success(`Processing completed: ${data.processed || 0} reminders processed`);
    } catch (error) {
      console.error('❌ Failed to process reminders:', error);
      toast.error('Failed to process reminders');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reminder System Setup</CardTitle>
        <CardDescription>
          Activate automatic reminder processing and test the system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Button 
            onClick={activateCronJob} 
            disabled={isActivating}
            className="w-full"
          >
            {isActivating ? 'Activating...' : 'Activate Automatic Processing (Every 15 min)'}
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            This will set up a cron job that automatically processes due reminders every 15 minutes.
          </p>
        </div>
        
        <div>
          <Button 
            onClick={manualProcess} 
            disabled={isProcessing}
            variant="outline"
            className="w-full"
          >
            {isProcessing ? 'Processing...' : 'Process Reminders Now (Manual Test)'}
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Manually trigger reminder processing to test the system immediately.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
