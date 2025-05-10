
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, Clock, Repeat } from "lucide-react";
import { format, addHours } from "date-fns";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  allDay: z.boolean().default(false),
  eventType: z.string().default("study"),
  color: z.string().default("#4f46e5"),
  flashcardSetId: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurrencePattern: z.string().default("none"),
});

type EventFormValues = z.infer<typeof eventSchema>;

interface CreateEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  onEventCreated?: () => void;
}

export function CreateEventDialog({ 
  isOpen, 
  onClose, 
  selectedDate = new Date(),
  onEventCreated 
}: CreateEventDialogProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const startTime = new Date(selectedDate);
  startTime.setHours(9, 0, 0, 0);
  
  const endTime = addHours(startTime, 1);
  
  const defaultValues = {
    title: "",
    description: "",
    startTime: format(startTime, "yyyy-MM-dd'T'HH:mm"),
    endTime: format(endTime, "yyyy-MM-dd'T'HH:mm"),
    allDay: false,
    eventType: "study",
    color: "#3dc087", // Changed to mint color
    flashcardSetId: "",
    isRecurring: false,
    recurrencePattern: "none",
  };

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues,
  });

  // Fetch user's flashcard sets with improved error handling
  const { data: flashcardSets } = useQuery({
    queryKey: ['flashcardSets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        const { data, error } = await supabase
          .from('flashcard_sets')
          .select('id, name')
          .eq('user_id', user.id)
          .order('name', { ascending: true });
          
        if (error) {
          console.error('Error fetching flashcard sets:', error);
          return [];
        }
        return data || [];
      } catch (err) {
        console.error('Exception when fetching flashcard sets:', err);
        return [];
      }
    },
    enabled: !!user && isOpen, // Only fetch when dialog is open
    retry: false, // Don't retry on failure to prevent error loops
    staleTime: 30000, // Cache data for 30 seconds
  });

  const eventType = form.watch("eventType");
  const isRecurring = form.watch("isRecurring");

  const onSubmit = async (values: EventFormValues) => {
    if (!user) {
      toast.error("You must be logged in to create events");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare recurrence pattern data if recurring is enabled
      const recurrencePattern = values.isRecurring ? { pattern: values.recurrencePattern } : null;
      
      const eventData = {
        user_id: user.id,
        title: values.title,
        description: values.description,
        start_time: new Date(values.startTime).toISOString(),
        end_time: new Date(values.endTime).toISOString(),
        all_day: values.allDay,
        event_type: values.eventType,
        color: values.color,
        flashcard_set_id: values.flashcardSetId || null,
        is_recurring: values.isRecurring,
        recurrence_pattern: recurrencePattern,
      };

      const { error } = await supabase
        .from('events')
        .insert(eventData);

      if (error) throw error;

      toast.success("Event created successfully");
      onEventCreated?.(); // Call the callback to trigger a refresh
      onClose();
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white border border-mint-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-mint-800">
            <CalendarClock className="h-5 w-5 text-mint-600" />
            Add New Event
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-mint-800">Event Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Study Session" {...field} className="border-mint-200 focus-visible:ring-mint-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="eventType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-mint-800">Event Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-2"
                    >
                      <FormItem className="flex items-center space-x-1 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="study" className="text-mint-600 border-mint-400" />
                        </FormControl>
                        <FormLabel className="font-normal text-mint-700">Study</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-1 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="deadline" className="text-mint-600 border-mint-400" />
                        </FormControl>
                        <FormLabel className="font-normal text-mint-700">Deadline</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-1 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="reminder" className="text-mint-600 border-mint-400" />
                        </FormControl>
                        <FormLabel className="font-normal text-mint-700">Reminder</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
            
            {eventType === "study" && flashcardSets && flashcardSets.length > 0 && (
              <FormField
                control={form.control}
                name="flashcardSetId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-mint-800">Flashcard Set (optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-mint-200 focus:ring-mint-500">
                          <SelectValue placeholder="Select a flashcard set" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {flashcardSets.map((set) => (
                          <SelectItem key={set.id} value={set.id}>
                            {set.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-mint-800">Start Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} className="border-mint-200 focus-visible:ring-mint-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-mint-800">End Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} className="border-mint-200 focus-visible:ring-mint-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="allDay"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-mint-200 p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-mint-800">All Day</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-mint-600"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-mint-200 p-3">
                  <div className="space-y-0.5 flex items-center">
                    <Repeat className="h-4 w-4 mr-2 text-mint-600" />
                    <FormLabel className="text-mint-800">Recurring Event</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-mint-600"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {isRecurring && (
              <FormField
                control={form.control}
                name="recurrencePattern"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-mint-800">Recurrence Pattern</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-mint-200 focus:ring-mint-500">
                          <SelectValue placeholder="Select a recurrence pattern" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-mint-800">Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add details about your event" 
                      className="resize-none border-mint-200 focus-visible:ring-mint-500" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-mint-800">Color</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input 
                        type="color"
                        {...field}
                        className="w-12 h-8 p-1 cursor-pointer border-mint-200"
                      />
                    </FormControl>
                    <div 
                      className="w-8 h-8 rounded-full" 
                      style={{ backgroundColor: field.value }}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="sm:justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
                className="border-mint-300 text-mint-700 hover:bg-mint-50"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-mint-600 hover:bg-mint-700 text-white"
              >
                {isSubmitting ? "Creating..." : "Create Event"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
