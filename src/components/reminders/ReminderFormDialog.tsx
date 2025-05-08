
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Reminder, ReminderFormValues, DeliveryMethod } from '@/hooks/useReminders';

const reminderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  reminderDate: z.date(),
  reminderTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time in 24-hour format (HH:MM)"),
  type: z.enum(['study_event', 'goal_deadline', 'flashcard_review']),
  delivery_methods: z.array(z.enum(['in_app', 'email', 'whatsapp']).transform(val => val as DeliveryMethod)),
  recurrence: z.enum(['none', 'daily', 'weekly', 'monthly']),
  event_id: z.string().optional(),
  goal_id: z.string().optional(),
});

type ReminderFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ReminderFormValues) => Promise<any>;
  initialData?: Reminder;
  events?: Array<{ id: string; title: string }>;
  goals?: Array<{ id: string; title: string }>;
};

export const ReminderFormDialog = ({ 
  open,
  onOpenChange,
  onSubmit,
  initialData,
  events = [],
  goals = []
}: ReminderFormDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof reminderSchema>>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      title: '',
      description: '',
      reminderDate: new Date(),
      reminderTime: format(new Date(), 'HH:mm'),
      type: 'study_event',
      delivery_methods: ['in_app'] as DeliveryMethod[],
      recurrence: 'none',
      event_id: undefined,
      goal_id: undefined,
    }
  });

  useEffect(() => {
    if (initialData) {
      const reminderDate = new Date(initialData.reminder_time);
      
      form.reset({
        title: initialData.title,
        description: initialData.description || '',
        reminderDate,
        reminderTime: format(reminderDate, 'HH:mm'),
        type: initialData.type,
        delivery_methods: initialData.delivery_methods,
        recurrence: initialData.recurrence,
        event_id: initialData.event_id,
        goal_id: initialData.goal_id,
      });
    } else {
      form.reset({
        title: '',
        description: '',
        reminderDate: new Date(),
        reminderTime: format(new Date(), 'HH:mm'),
        type: 'study_event',
        delivery_methods: ['in_app'] as DeliveryMethod[],
        recurrence: 'none',
        event_id: undefined,
        goal_id: undefined,
      });
    }
  }, [initialData, form, open]);

  const handleSubmit = async (data: z.infer<typeof reminderSchema>) => {
    setIsSubmitting(true);
    
    try {
      const reminderDate = new Date(data.reminderDate);
      const [hours, minutes] = data.reminderTime.split(':').map(Number);
      
      reminderDate.setHours(hours, minutes, 0, 0);
      
      const formData: ReminderFormValues = {
        title: data.title,
        description: data.description || null,
        reminder_time: reminderDate.toISOString(),
        type: data.type,
        delivery_methods: data.delivery_methods as DeliveryMethod[],
        recurrence: data.recurrence,
        event_id: data.event_id,
        goal_id: data.goal_id,
        id: initialData?.id,
      };
      
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting reminder:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const deliveryMethods = [
    { id: 'in_app' as const, label: 'In-App' },
    { id: 'email' as const, label: 'Email' },
    { id: 'whatsapp' as const, label: 'WhatsApp' }
  ];
  
  const reminderType = form.watch('type');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Reminder' : 'Create Reminder'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter reminder title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add details about this reminder"
                      className="resize-none" 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="reminderDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className="w-full pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "MMM dd, yyyy")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="reminderTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <div className="flex">
                      <FormControl>
                        <div className="relative flex items-center">
                          <Clock className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="HH:MM" 
                            className="pl-8"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reminder Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reminder type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="study_event">Study Event</SelectItem>
                      <SelectItem value="goal_deadline">Goal Deadline</SelectItem>
                      <SelectItem value="flashcard_review">Flashcard Review</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {reminderType === 'study_event' && events.length > 0 && (
              <FormField
                control={form.control}
                name="event_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Associated Event (Optional)</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value} 
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select event" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {events.map(event => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {reminderType === 'goal_deadline' && goals.length > 0 && (
              <FormField
                control={form.control}
                name="goal_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Associated Goal (Optional)</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select goal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {goals.map(goal => (
                          <SelectItem key={goal.id} value={goal.id}>
                            {goal.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="delivery_methods"
              render={() => (
                <FormItem>
                  <div className="mb-2">
                    <FormLabel>Delivery Methods</FormLabel>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {deliveryMethods.map((method) => (
                      <FormField
                        key={method.id}
                        control={form.control}
                        name="delivery_methods"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={method.id}
                              className="flex flex-row items-center space-x-2 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(method.id)}
                                  onCheckedChange={(checked) => {
                                    const updatedValue = checked
                                      ? [...field.value, method.id]
                                      : field.value?.filter(
                                          (value) => value !== method.id
                                        );
                                    field.onChange(updatedValue);
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {method.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="recurrence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recurrence</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recurrence" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : initialData ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
