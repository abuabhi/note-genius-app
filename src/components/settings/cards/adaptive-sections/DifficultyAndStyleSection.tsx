
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

interface DifficultyAndStyleSectionProps {
  form: UseFormReturn<any>;
}

export const DifficultyAndStyleSection = ({ form }: DifficultyAndStyleSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="adaptiveDifficulty"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Difficulty Adaptation</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value || "adaptive"}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty mode" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="adaptive">Adaptive (AI decides)</SelectItem>
                <SelectItem value="challenging">Always Challenging</SelectItem>
                <SelectItem value="comfortable">Keep Comfortable</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              How aggressively should the AI adjust difficulty based on your performance?
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="studyStyle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Study Style</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value || "distributed"}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select study style" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="intensive">Intensive Sessions</SelectItem>
                <SelectItem value="distributed">Distributed Practice</SelectItem>
                <SelectItem value="mixed">Mixed Approach</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Your preferred approach to organizing study sessions
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
