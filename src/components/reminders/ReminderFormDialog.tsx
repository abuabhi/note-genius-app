
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUnifiedReminderSystem } from '@/hooks/useUnifiedReminderSystem';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReminderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ReminderFormDialog = ({ open, onOpenChange }: ReminderFormDialogProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [type, setType] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createReminder } = useUnifiedReminderSystem();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !reminderTime || !user) {
      toast.error('Please fill in title and reminder time');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('🔔 Creating reminder...');
      
      // Get user's email notification preferences from their profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', user.id)
        .single();
      
      // Determine delivery methods based on user preferences
      let deliveryMethods = ['in_app']; // Always include in-app
      
      if (profileData?.notification_preferences) {
        const prefs = typeof profileData.notification_preferences === 'string' 
          ? JSON.parse(profileData.notification_preferences)
          : profileData.notification_preferences;
          
        // Add email if user has email notifications enabled
        if (prefs.email === true) {
          deliveryMethods.push('email');
        }
      }
      
      console.log('📧 Using delivery methods:', deliveryMethods);
      
      await createReminder({
        title: title.trim(),
        description: description.trim() || undefined,
        reminder_time: new Date(reminderTime).toISOString(),
        type,
        priority,
        delivery_methods: deliveryMethods,
        recurrence: 'none',
        status: 'pending'
      });

      toast.success(`Reminder created with delivery methods: ${deliveryMethods.join(', ')}`);
      
      // Reset form
      setTitle('');
      setDescription('');
      setReminderTime('');
      setType('todo');
      setPriority('medium');
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating reminder:', error);
      toast.error('Failed to create reminder');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Reminder</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter reminder title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminderTime">Reminder Time</Label>
            <Input
              id="reminderTime"
              type="datetime-local"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Todo</SelectItem>
                  <SelectItem value="study_session">Study Session</SelectItem>
                  <SelectItem value="goal_deadline">Goal Deadline</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Notification Settings:</strong> This reminder will use your notification preferences from Settings. 
              Email notifications will be sent if you have them enabled.
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Reminder'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
