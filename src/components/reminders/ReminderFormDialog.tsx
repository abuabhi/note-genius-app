
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useUnifiedReminderSystem } from '@/hooks/useUnifiedReminderSystem';
import { toast } from 'sonner';

interface ReminderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ReminderFormDialog = ({ open, onOpenChange }: ReminderFormDialogProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [type, setType] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [deliveryMethods, setDeliveryMethods] = useState<string[]>(['in_app', 'email']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createReminder } = useUnifiedReminderSystem();

  const handleDeliveryMethodChange = (method: string, checked: boolean) => {
    if (checked) {
      setDeliveryMethods(prev => [...prev, method]);
    } else {
      setDeliveryMethods(prev => prev.filter(m => m !== method));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !reminderTime) {
      toast.error('Please fill in title and reminder time');
      return;
    }

    if (deliveryMethods.length === 0) {
      toast.error('Please select at least one delivery method');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('🔔 Creating reminder with delivery methods:', deliveryMethods);
      
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

      toast.success('Reminder created successfully with delivery methods: ' + deliveryMethods.join(', '));
      
      // Reset form
      setTitle('');
      setDescription('');
      setReminderTime('');
      setType('todo');
      setPriority('medium');
      setDeliveryMethods(['in_app', 'email']);
      
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

          {/* Delivery Methods Section */}
          <div className="space-y-3">
            <Label>Delivery Methods</Label>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="in_app"
                  checked={deliveryMethods.includes('in_app')}
                  onCheckedChange={(checked) => handleDeliveryMethodChange('in_app', checked as boolean)}
                />
                <Label htmlFor="in_app" className="text-sm font-normal">
                  In-App Notification
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email"
                  checked={deliveryMethods.includes('email')}
                  onCheckedChange={(checked) => handleDeliveryMethodChange('email', checked as boolean)}
                />
                <Label htmlFor="email" className="text-sm font-normal">
                  Email Notification
                </Label>
              </div>
            </div>
            <p className="text-xs text-gray-600">
              Selected: {deliveryMethods.length > 0 ? deliveryMethods.join(', ') : 'None'}
            </p>
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
