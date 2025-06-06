
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { Clock, Target } from "lucide-react";

interface StudyRemindersSectionProps {
  form: UseFormReturn<any>;
}

export const StudyRemindersSection = ({ form }: StudyRemindersSectionProps) => {
  return (
    <div>
      <h4 className="text-sm font-medium mb-4">Study Reminders</h4>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="studySessionReminders"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <FormLabel className="text-sm">Study Session Reminders</FormLabel>
                </div>
                <FormDescription className="text-xs">
                  Reminders for scheduled study sessions
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="goalDeadlineReminders"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-red-500" />
                  <FormLabel className="text-sm">Goal Deadline Reminders</FormLabel>
                </div>
                <FormDescription className="text-xs">
                  Alerts for approaching study goal deadlines
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
