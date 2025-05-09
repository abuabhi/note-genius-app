import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { StudyGoal, GoalFormValues } from '@/hooks/useStudyGoals';
import { useReminders, ReminderType } from '@/hooks/useReminders';
import { AutomaticReminderDialog, AutomaticReminderConfig } from '@/components/reminders/AutomaticReminderDialog';
import { toast } from 'sonner';

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const goalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  subject: z.string().optional(),
  target_hours: z.coerce.number().min(1, "Target hours must be at least 1"),
  start_date: z.date(),
  end_date: z.date(),
  flashcard_set_id: z.string().optional(),
}).refine(data => data.end_date >= data.start_date, {
  message: "End date must be after start date",
  path: ["end_date"],
});

type GoalFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: GoalFormValues) => Promise<any>;
  initialData?: StudyGoal;
  flashcardSets?: Array<{ id: string; name: string }>;
};

export const GoalFormDialog = ({ 
  open,
  onOpenChange,
  onSubmit,
  initialData,
  flashcardSets = []
}: GoalFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [reminderConfig, setReminderConfig] = useState<AutomaticReminderConfig | null>(null);
  const { createReminder } = useReminders();

  const form = useForm<z.infer<typeof goalSchema>>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: '',
      description: '',
      subject: '',
      target_hours: 1,
      start_date: new Date(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      flashcard_set_id: undefined,
    }
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title,
        description: initialData.description || '',
        subject: initialData.subject || '',
        target_hours: initialData.target_hours,
        start_date: new Date(initialData.start_date),
        end_date: new Date(initialData.end_date),
        flashcard_set_id: initialData.flashcard_set_id || undefined,
      });
    } else {
      form.reset({
        title: '',
        description: '',
        subject: '',
        target_hours: 1,
        start_date: new Date(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        flashcard_set_id: undefined,
      });
    }
  }, [initialData, form, open]);

  const handleSubmit = async (data: z.infer<typeof goalSchema>) => {
    setIsSubmitting(true);
    try {
      const formData: GoalFormValues = {
        title: data.title,
        description: data.description || '',
        subject: data.subject || '',
        target_hours: data.target_hours,
        start_date: format(data.start_date, 'yyyy-MM-dd'),
        end_date: format(data.end_date, 'yyyy-MM-dd'),
        flashcard_set_id: data.flashcard_set_id || null,
      };
      
      // Add the ID if we're updating an existing goal
      if (initialData?.id) {
        formData.id = initialData.id;
      }
      
      const result = await onSubmit(formData);
      
      // If reminder configuration exists and goal creation was successful
      if (reminderConfig && result?.id) {
        await createReminderForGoal(result.id, data, reminderConfig);
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting goal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const createReminderForGoal = async (
    goalId: string, 
    goalData: z.infer<typeof goalSchema>,
    config: AutomaticReminderConfig
  ) => {
    try {
      // Calculate reminder date based on end date and advance days
      const endDate = new Date(goalData.end_date);
      const reminderDate = new Date(endDate);
      reminderDate.setDate(endDate.getDate() - config.advanceDays);
      
      const reminderData = {
        title: `Goal Deadline: ${goalData.title}`,
        description: `Reminder for your goal: ${goalData.title}${goalData.description ? ` - ${goalData.description}` : ''}`,
        reminder_time: reminderDate,
        type: 'goal_deadline' as ReminderType,
        delivery_methods: config.delivery_methods,
        recurrence: config.recurrence,
        goal_id: goalId,
      };
      
      await createReminder.mutateAsync(reminderData);
      toast.success('Reminder created for this goal');
    } catch (error) {
      console.error("Error creating reminder for goal:", error);
      toast.error('Failed to create reminder for this goal');
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{initialData ? 'Edit Study Goal' : 'Create Study Goal'}</DialogTitle>
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
                      <Input placeholder="Enter goal title" {...field} />
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
                        placeholder="Describe your study goal"
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
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. Math, Science"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="target_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Hours</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          placeholder="Hours"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
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
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
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
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
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
                            disabled={(date) => {
                              const startDate = form.getValues("start_date");
                              return date < startDate;
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {flashcardSets.length > 0 && (
                <FormField
                  control={form.control}
                  name="flashcard_set_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flashcard Set (Optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a flashcard set" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {flashcardSets.map(set => (
                            <SelectItem key={set.id} value={set.id}>
                              {set.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Connect this goal to a flashcard set
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {/* Add button to set reminder at the end of the form */}
              <div className="flex justify-start">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowReminderDialog(true)}
                  className="flex items-center gap-2"
                >
                  {reminderConfig ? "✓ " : ""} Set Reminder
                </Button>
              </div>
              
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
      
      <AutomaticReminderDialog 
        open={showReminderDialog}
        onOpenChange={setShowReminderDialog}
        onConfirm={(config) => {
          setReminderConfig(config);
          setShowReminderDialog(false);
        }}
        title={form.watch('title') || "Goal"}
        targetDate={form.watch('end_date')}
        reminderType="goal_deadline"
      />
    </>
  );
};
