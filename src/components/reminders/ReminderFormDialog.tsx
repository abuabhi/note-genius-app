
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, CalendarDays, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

interface ReminderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type ReminderPriority = 'low' | 'medium' | 'high';
type ReminderType = 'general' | 'study' | 'event' | 'goal' | 'todo';
type ReminderRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';

interface ReminderFormData {
  title: string;
  description: string;
  reminderTime: Date;
  type: ReminderType;
  priority: ReminderPriority;
  deliveryMethods: string[];
  recurrence: ReminderRecurrence;
}

export const ReminderFormDialog = ({ 
  open, 
  onOpenChange, 
  onSuccess 
}: ReminderFormDialogProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<ReminderFormData>({
    title: '',
    description: '',
    reminderTime: new Date(),
    type: 'general',
    priority: 'medium',
    deliveryMethods: ['in_app'],
    recurrence: 'none',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to create reminders');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a reminder title');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('reminders')
        .insert({
          user_id: user.id,
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          reminder_time: formData.reminderTime.toISOString(),
          type: formData.type,
          priority: formData.priority,
          delivery_methods: formData.deliveryMethods,
          recurrence: formData.recurrence,
          status: 'pending',
        });

      if (error) throw error;

      toast.success('Reminder created successfully');
      onSuccess?.();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        reminderTime: new Date(),
        type: 'general',
        priority: 'medium',
        deliveryMethods: ['in_app'],
        recurrence: 'none',
      });
    } catch (error) {
      console.error('Error creating reminder:', error);
      toast.error('Failed to create reminder');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ReminderFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Create Reminder
          </DialogTitle>
          <DialogDescription>
            Set up a reminder to stay on track with your goals
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid w-full gap-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="What do you want to be reminded about?"
              required
            />
          </div>

          <div className="grid w-full gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Add more details (optional)"
              rows={3}
            />
          </div>

          <div className="grid w-full gap-1.5">
            <Label htmlFor="reminderTime">Reminder Time *</Label>
            <Input
              id="reminderTime"
              type="datetime-local"
              value={formatDateTimeLocal(formData.reminderTime)}
              onChange={(e) => handleInputChange('reminderTime', new Date(e.target.value))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: ReminderType) => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="study">Study</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="goal">Goal</SelectItem>
                  <SelectItem value="todo">Todo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid w-full gap-1.5">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: ReminderPriority) => handleInputChange('priority', value)}
              >
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

          <div className="grid w-full gap-1.5">
            <Label htmlFor="recurrence">Recurrence</Label>
            <Select
              value={formData.recurrence}
              onValueChange={(value: ReminderRecurrence) => handleInputChange('recurrence', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Repeat</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full gap-1.5">
            <Label>Delivery Methods</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="in_app"
                checked={formData.deliveryMethods.includes('in_app')}
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleInputChange('deliveryMethods', [...formData.deliveryMethods, 'in_app']);
                  } else {
                    handleInputChange('deliveryMethods', formData.deliveryMethods.filter(m => m !== 'in_app'));
                  }
                }}
              />
              <Label htmlFor="in_app" className="text-sm font-normal">
                In-App Notification
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Reminder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
