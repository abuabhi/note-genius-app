
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Settings, Target, Bell } from "lucide-react";
import { OnboardingData } from "../OnboardingWizard";

interface PreferencesStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isSubmitting: boolean;
}

export const PreferencesStep = ({ data, updateData, onNext, onPrev, isSubmitting }: PreferencesStepProps) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <Settings className="h-6 w-6 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Set Your Preferences
        </h2>
        <p className="text-slate-600">
          These settings help us personalize your experience. You can change them later.
        </p>
      </div>

      <div className="space-y-6">
        {/* Study Goal */}
        <div className="bg-purple-50/50 rounded-xl p-6 border border-purple-100">
          <div className="flex items-center gap-3 mb-4">
            <Target className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-slate-800">Weekly Study Goal</h3>
          </div>
          
          <div className="space-y-4">
            <Label className="text-sm text-slate-600">
              How many hours per week do you want to study? ({data.studyGoal} hours)
            </Label>
            <Slider
              value={[data.studyGoal]}
              onValueChange={([value]) => updateData({ studyGoal: value })}
              max={20}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>1 hour</span>
              <span>20 hours</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-slate-800">Notifications</h3>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium text-slate-800">Study Reminders</Label>
              <p className="text-sm text-slate-600">Get helpful reminders to stay on track</p>
            </div>
            <Switch
              checked={data.notifications}
              onCheckedChange={(notifications) => updateData({ notifications })}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button onClick={onPrev} variant="outline" disabled={isSubmitting}>
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={isSubmitting}
          className="bg-mint-600 hover:bg-mint-700"
        >
          {isSubmitting ? "Setting up..." : "Complete Setup"}
        </Button>
      </div>
    </div>
  );
};
