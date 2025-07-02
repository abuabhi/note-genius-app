
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ReminderType, DeliveryMethod, ReminderRecurrence } from '@/hooks/reminders/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/components/ui/use-toast';

interface AutomaticReminderDialogProps {
  trigger?: React.ReactNode;
  onReminderCreated?: () => void;
}

export const AutomaticReminderDialog = ({ 
  trigger, 
  onReminderCreated 
}: AutomaticReminderDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reminderData, setReminderData] = useState({
    title: '',
    description: '',
    type: 'other' as ReminderType,
    deliveryMethods: ['in_app'] as DeliveryMethod[],
    recurrence: 'none' as ReminderRecurrence,
    reminderDate: new Date()
  });

  const handleCreateReminder = async () => {
    if (!user || !reminderData.title) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('reminders')
        .insert({
          user_id: user.id,
          title: reminderData.title,
          description: reminderData.description,
          type: reminderData.type,
          delivery_methods: reminderData.deliveryMethods,
          recurrence: reminderData.recurrence,
          reminder_time: reminderData.reminderDate.toISOString(),
          status: 'pending',
          priority: 'medium'
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Reminder created successfully'
      });

      setOpen(false);
      onReminderCreated?.();
      
      // Reset form
      setReminderData({
        title: '',
        description: '',
        type: 'other',
        deliveryMethods: ['in_app'],
        recurrence: 'none',
        reminderDate: new Date()
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create reminder',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Reminder
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Reminder</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={reminderData.title}
              onChange={(e) => setReminderData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter reminder title"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={reminderData.description}
              onChange={(e) => setReminderData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter description (optional)"
            />
          </div>

          <div>
            <Label>Type</Label>
            <Select 
              value={reminderData.type} 
              onValueChange={(value: ReminderType) => 
                setReminderData(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="study_event">Study Event</SelectItem>
                <SelectItem value="goal_deadline">Goal Deadline</SelectItem>
                <SelectItem value="flashcard_review">Flashcard Review</SelectItem>
                <SelectItem value="todo">Todo</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Reminder Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(reminderData.reminderDate, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={reminderData.reminderDate}
                  onSelect={(date) => date && setReminderData(prev => ({ ...prev, reminderDate: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateReminder} disabled={isLoading || !reminderData.title}>
              {isLoading ? 'Creating...' : 'Create Reminder'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
