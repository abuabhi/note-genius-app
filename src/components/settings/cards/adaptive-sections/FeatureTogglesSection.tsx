
import { FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { Zap, Settings } from "lucide-react";

interface FeatureTogglesSectionProps {
  form: UseFormReturn<any>;
}

export const FeatureTogglesSection = ({ form }: FeatureTogglesSectionProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="enableRealTimeAdaptations"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <FormLabel className="text-base">Real-time Adaptations</FormLabel>
              </div>
              <FormDescription>
                Get AI suggestions during study sessions based on your performance
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
        name="enableLearningPaths"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-blue-500" />
                <FormLabel className="text-base">Automatic Learning Paths</FormLabel>
              </div>
              <FormDescription>
                Automatically create learning paths based on your study activities
              </FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};
