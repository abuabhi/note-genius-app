
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { CreateTodoData, TodoPriority, RecurrenceType } from "@/hooks/todos/types";
import { useTodos } from "@/hooks/useTodos";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DependencySelector } from "./DependencySelector";
import { RecurrenceSelector } from "./RecurrenceSelector";

const todoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  due_date: z.date().optional(),
  due_time: z.string().optional(),
  reminder_minutes: z.string().optional(),
  recurrence: z.enum(["none", "daily", "weekly", "monthly", "yearly"]).optional(),
  recurrence_end_date: z.date().optional(),
  depends_on_todo_id: z.string().optional(),
});

type TodoFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateTodoData) => Promise<void>;
};

export const TodoFormDialog = ({ open, onOpenChange, onSubmit }: TodoFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { todos } = useTodos();

  const form = useForm<z.infer<typeof todoSchema>>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      due_date: undefined,
      due_time: "",
      reminder_minutes: "none",
      recurrence: "none",
      recurrence_end_date: undefined,
      depends_on_todo_id: undefined,
    }
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const combineDateTime = (date?: Date, time?: string): Date | undefined => {
    if (!date) return undefined;
    
    if (time) {
      const [hours, minutes] = time.split(':').map(Number);
      const combined = new Date(date);
      combined.setHours(hours, minutes, 0, 0);
      return combined;
    }
    
    return date;
  };

  const calculateReminderTime = (dueDateTime?: Date, reminderMinutes?: string): Date | undefined => {
    if (!dueDateTime || !reminderMinutes || reminderMinutes === "none") return undefined;
    
    const minutes = parseInt(reminderMinutes);
    const reminderTime = new Date(dueDateTime.getTime() - (minutes * 60 * 1000));
    return reminderTime;
  };

  const handleSubmit = async (data: z.infer<typeof todoSchema>) => {
    setIsSubmitting(true);
    try {
      const dueDateTime = combineDateTime(data.due_date, data.due_time);
      const reminderDateTime = calculateReminderTime(dueDateTime, data.reminder_minutes);
      
      const todoData: CreateTodoData = {
        title: data.title,
        description: data.description,
        priority: data.priority,
        due_date: dueDateTime,
        reminder_time: reminderDateTime,
        recurrence: data.recurrence !== "none" ? data.recurrence : undefined,
        recurrence_end_date: data.recurrence_end_date,
        depends_on_todo_id: data.depends_on_todo_id,
      };
      
      await onSubmit(todoData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting todo:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reminderOptions = [
    { value: "15", label: "15 minutes before" },
    { value: "30", label: "30 minutes before" },
    { value: "60", label: "1 hour before" },
    { value: "240", label: "4 hours before" },
    { value: "1440", label: "1 day before" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Todo</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="What needs to be done?" {...field} />
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add more details..."
                          className="resize-none" 
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-400" />
                              Low
                            </div>
                          </SelectItem>
                          <SelectItem value="medium">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-yellow-400" />
                              Medium
                            </div>
                          </SelectItem>
                          <SelectItem value="high">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-400" />
                              High
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date & Time</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="flex-1 justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              </Button>
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
                          
                          <div className="flex items-center gap-2 w-32">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <Input
                              type="time"
                              value={form.watch("due_time") || ""}
                              onChange={(e) => form.setValue("due_time", e.target.value)}
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reminder_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reminder</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Set reminder time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No reminder</SelectItem>
                          {reminderOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-4">
                <RecurrenceSelector
                  value={form.watch("recurrence") || "none"}
                  onValueChange={(value) => form.setValue("recurrence", value)}
                  endDate={form.watch("recurrence_end_date")}
                  onEndDateChange={(date) => form.setValue("recurrence_end_date", date)}
                />
                
                <DependencySelector
                  todos={todos}
                  value={form.watch("depends_on_todo_id")}
                  onValueChange={(value) => form.setValue("depends_on_todo_id", value)}
                />
              </TabsContent>
            </Tabs>
            
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
                {isSubmitting ? "Creating..." : "Create Todo"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
