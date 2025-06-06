
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { UseFormReturn } from "react-hook-form";
import { Brain, Settings, Zap } from "lucide-react";

interface AdaptiveLearningCardProps {
  form: UseFormReturn<any>;
}

export const AdaptiveLearningCard = ({ form }: AdaptiveLearningCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          Adaptive Learning Preferences
        </CardTitle>
        <CardDescription>
          Configure how the AI adapts to your learning style and performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
      </CardContent>
    </Card>
  );
};
