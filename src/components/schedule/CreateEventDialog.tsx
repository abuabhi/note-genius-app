import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { useUserSubjects } from "@/hooks/useUserSubjects";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useScheduleColors } from "@/hooks/useScheduleColors";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  date: z.date({
    required_error: "A date is required.",
  }),
  subject: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
});

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventCreated?: () => void;
  defaultDate?: Date | null;
}

export default function CreateEventDialog({ 
  open, 
  onOpenChange, 
  onEventCreated,
  defaultDate
}: CreateEventDialogProps) {
  const { subjects } = useUserSubjects();
  const { user } = useAuth();
  const { scheduleColors } = useScheduleColors();
  const [selectedColor, setSelectedColor] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      date: defaultDate || new Date(),
      subject: "",
      description: "",
      color: "",
    },
  });

  // Update form when defaultDate changes
  useEffect(() => {
    if (defaultDate) {
      form.setValue("date", defaultDate);
    }
  }, [defaultDate, form]);

  useEffect(() => {
    if (scheduleColors && scheduleColors.length > 0) {
      setSelectedColor(scheduleColors[0].value);
      form.setValue("color", scheduleColors[0].value);
    }
  }, [scheduleColors, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;

    const createEvent = async () => {
      // Create a single event object with all required fields
      const eventData = {
        user_id: user.id,
        title: values.title,
        start_time: format(values.date, "yyyy-MM-dd"),
        end_time: format(values.date, "yyyy-MM-dd"),
        description: values.description || "",
        color: values.color || "#3b82f6",
        all_day: true,
        event_type: "task",
        is_recurring: false,
        subject: values.subject || ""
      };

      const { data, error } = await supabase
        .from("events")
        .insert(eventData)
        .select();

      if (error) {
        console.error("Error creating event:", error);
        toast.error("Something went wrong. Please try again.");
      } else {
        toast.success("Event created successfully!");
        form.reset();
        onOpenChange(false);
        if (onEventCreated) {
          onEventCreated();
        }
      }
    };

    createEvent();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Event</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Event title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
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
                          date < new Date()
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
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects?.map((subject) => (
                        <SelectItem key={subject.id} value={subject.name}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      placeholder="Event description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="color">Color</Label>
              <div className="flex gap-2">
                {scheduleColors?.map((color) => (
                  <Button
                    key={color.value}
                    variant="outline"
                    className={cn(
                      "w-8 h-8 rounded-full p-0",
                      color.value === selectedColor
                        ? "ring-2 ring-primary"
                        : "ring-0"
                    )}
                    style={{ backgroundColor: color.value }}
                    onClick={() => {
                      setSelectedColor(color.value);
                      form.setValue("color", color.value);
                    }}
                  ></Button>
                ))}
              </div>
            </div>
            <Button type="submit">Create event</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
