
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { UseFormReturn } from "react-hook-form";

interface SessionTimingSectionProps {
  form: UseFormReturn<any>;
}

export const SessionTimingSection = ({ form }: SessionTimingSectionProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="preferredSessionLength"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Preferred Session Length: {field.value || 45} minutes</FormLabel>
            <FormControl>
              <Slider
                value={[field.value || 45]}
                onValueChange={(value) => field.onChange(value[0])}
                max={120}
                min={15}
                step={15}
                className="w-full"
              />
            </FormControl>
            <FormDescription>
              Your ideal study session duration (15-120 minutes)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="maxDailyStudyTime"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Maximum Daily Study Time: {field.value || 180} minutes</FormLabel>
            <FormControl>
              <Slider
                value={[field.value || 180]}
                onValueChange={(value) => field.onChange(value[0])}
                max={480}
                min={60}
                step={30}
                className="w-full"
              />
            </FormControl>
            <FormDescription>
              Maximum time you want to study per day (1-8 hours)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
