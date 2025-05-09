import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Clock, Bell } from 'lucide-react';
import { ReminderFormValues, ReminderRecurrence, DeliveryMethod, ReminderType } from '@/hooks/useReminders';

import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const reminderSchema = z.object({
  enableReminder: z.boolean(),
  advanceDays: z.coerce.number().min(0).max(30),
  recurrence: z.enum(['none', 'daily', 'weekly', 'monthly']),
  delivery_methods: z.array(z.enum(['in_app', 'email', 'whatsapp']).transform(val => val as DeliveryMethod)),
});

type AutomaticReminderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reminderConfig: AutomaticReminderConfig | null) => void;
  title?: string;
  targetDate?: Date;
  reminderType: ReminderType;
};

export type AutomaticReminderConfig = {
  advanceDays: number;
  recurrence: ReminderRecurrence;
  delivery_methods: DeliveryMethod[];
};

export function AutomaticReminderDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Item",
  targetDate,
  reminderType
}: AutomaticReminderDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof reminderSchema>>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      enableReminder: true,
      advanceDays: 1,
      recurrence: 'none',
      delivery_methods: ['in_app'] as DeliveryMethod[],
    }
  });
  
  const enableReminder = form.watch('enableReminder');
  
  const handleSubmit = (data: z.infer<typeof reminderSchema>) => {
    setIsSubmitting(true);
    
    try {
      if (!data.enableReminder) {
        onConfirm(null);
        return;
      }
      
      const config: AutomaticReminderConfig = {
        advanceDays: data.advanceDays,
        recurrence: data.recurrence as ReminderRecurrence,
        delivery_methods: data.delivery_methods as DeliveryMethod[],
      };
      
      onConfirm(config);
    } catch (error) {
      console.error("Error configuring reminder:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const deliveryMethods = [
    { id: 'in_app' as const, label: 'In-App' },
    { id: 'email' as const, label: 'Email' },
    { id: 'whatsapp' as const, label: 'WhatsApp' }
  ];
  
  const targetDateFormatted = targetDate ? format(targetDate, "PPP") : "the scheduled date";
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Up Reminder</DialogTitle>
          <DialogDescription>
            Configure automatic reminder for "{title}"
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="enableReminder"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Enable Reminder</FormLabel>
                    <FormDescription>
                      Send a notification before {targetDateFormatted}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {enableReminder && (
              <>
                <FormField
                  control={form.control}
                  name="advanceDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remind me</FormLabel>
                      <Select
                        value={field.value.toString()}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select days in advance" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">On the day</SelectItem>
                          <SelectItem value="1">1 day before</SelectItem>
                          <SelectItem value="2">2 days before</SelectItem>
                          <SelectItem value="3">3 days before</SelectItem>
                          <SelectItem value="5">5 days before</SelectItem>
                          <SelectItem value="7">1 week before</SelectItem>
                          <SelectItem value="14">2 weeks before</SelectItem>
                        </SelectContent>
                      </Select>
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
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
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
                
                <FormField
                  control={form.control}
                  name="delivery_methods"
                  render={() => (
                    <FormItem>
                      <div className="mb-2">
                        <FormLabel>Notification Methods</FormLabel>
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
              </>
            )}
            
            <DialogFooter className="pt-2">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Confirm"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
