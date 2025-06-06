
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UseFormReturn } from "react-hook-form";
import { Brain } from "lucide-react";
import { DifficultyAndStyleSection } from "./adaptive-sections/DifficultyAndStyleSection";
import { SessionTimingSection } from "./adaptive-sections/SessionTimingSection";
import { BreakAndSensitivitySection } from "./adaptive-sections/BreakAndSensitivitySection";
import { FeatureTogglesSection } from "./adaptive-sections/FeatureTogglesSection";

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
        <DifficultyAndStyleSection form={form} />
        <SessionTimingSection form={form} />
        <BreakAndSensitivitySection form={form} />
        <FeatureTogglesSection form={form} />
      </CardContent>
    </Card>
  );
};
