
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface TimingSettingsSectionProps {
  form: UseFormReturn<any>;
}

export const TimingSettingsSection = ({ form }: TimingSettingsSectionProps) => {
  return (
    <div className="space-y-4">
      {/* Timing Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="reminderFrequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Reminder Timing</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || "15min"}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timing" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="15min">15 minutes before</SelectItem>
                  <SelectItem value="30min">30 minutes before</SelectItem>
                  <SelectItem value="1hour">1 hour before</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                How far in advance to send reminders
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quietHoursEnabled"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <div className="flex items-center space-x-2">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel>Quiet Hours</FormLabel>
              </div>
              <FormDescription>
                Pause notifications during specified hours
              </FormDescription>
            </FormItem>
          )}
        />
      </div>

      {form.watch('quietHoursEnabled') && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
          <FormField
            control={form.control}
            name="quietHoursStart"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quietHoursEnd"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};
