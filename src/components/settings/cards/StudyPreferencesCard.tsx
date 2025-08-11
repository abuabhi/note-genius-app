
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
      <CardContent className="space-y-6">
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

        {/* Fun & Feedback Preferences */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Fun & Feedback</h4>
          <p className="text-sm text-muted-foreground">Quick reactions to keep studying engaging. You can turn these off anytime.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="enableConfettiCelebrations"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <FormLabel>Confetti celebrations</FormLabel>
                    <FormDescription>Celebrate wins like streaks and goals.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enableAvatarFrames"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <FormLabel>Avatar frames</FormLabel>
                    <FormDescription>Show a colorful ring around your avatar.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enableDailyQuoteCard"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <FormLabel>Daily quote card</FormLabel>
                    <FormDescription>Motivational quote on the dashboard.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enableSoundEffects"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <FormLabel>Sound effects</FormLabel>
                    <FormDescription>Short SFX on achievements and answers.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enableEmojiBurst"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <FormLabel>Emoji bursts</FormLabel>
                    <FormDescription>Quick emoji animation on correct answers.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
