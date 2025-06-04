
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { SettingsFormValues } from "../schemas/settingsFormSchema";
import { Target } from "lucide-react";

interface StudyPreferencesCardProps {
  form: UseFormReturn<SettingsFormValues>;
}

export const StudyPreferencesCard = ({ form }: StudyPreferencesCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Study Preferences
        </CardTitle>
        <CardDescription>
          Configure your study goals and preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="weeklyStudyGoalHours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weekly Study Goal (hours)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min="1"
                  max="50"
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 5)}
                  placeholder="Enter weekly study goal"
                />
              </FormControl>
              <FormDescription>
                Set your weekly study goal between 1-50 hours. This will be displayed on your dashboard.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};
