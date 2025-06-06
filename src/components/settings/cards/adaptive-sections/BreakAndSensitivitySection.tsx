
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

interface BreakAndSensitivitySectionProps {
  form: UseFormReturn<any>;
}

export const BreakAndSensitivitySection = ({ form }: BreakAndSensitivitySectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="breakFrequency"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Break Frequency</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value || "moderate"}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select break frequency" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="frequent">Frequent (Pomodoro style)</SelectItem>
                <SelectItem value="moderate">Moderate breaks</SelectItem>
                <SelectItem value="minimal">Minimal breaks</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              How often you prefer to take breaks during study sessions
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="adaptationSensitivity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>AI Adaptation Sensitivity</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value || "normal"}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select sensitivity" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="low">Low (fewer suggestions)</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High (more suggestions)</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              How quickly the AI should respond to performance changes
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
