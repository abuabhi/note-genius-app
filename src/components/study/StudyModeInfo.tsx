
import { Card, CardContent } from "@/components/ui/card";
import { StudyMode } from "@/pages/study/types";
import { BookOpen, RotateCcw, GraduationCap, Info } from "lucide-react";

interface StudyModeInfoProps {
  currentMode: StudyMode;
}

export const StudyModeInfo = ({ currentMode }: StudyModeInfoProps) => {
  const getModeInfo = () => {
    switch (currentMode) {
      case "learn":
        return {
          icon: BookOpen,
          title: "Study Mode",
          description: "Learn new flashcards at your own pace. Mark cards as 'Got it!' or 'Need practice' to track your progress.",
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200"
        };
      case "review":
        return {
          icon: RotateCcw,
          title: "Review Mode",
          description: "Focus on cards you marked as 'Need practice'. Perfect for reinforcing difficult concepts.",
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200"
        };
      case "test":
        return {
          icon: GraduationCap,
          title: "Quiz Mode",
          description: "Test your knowledge with a timed quiz. Your performance will be scored and tracked.",
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200"
        };
      default:
        return {
          icon: Info,
          title: "Study Mode",
          description: "Select a study mode to begin learning.",
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200"
        };
    }
  };

  const modeInfo = getModeInfo();
  const Icon = modeInfo.icon;

  return (
    <Card className={`${modeInfo.bgColor} ${modeInfo.borderColor} border`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Icon className={`h-5 w-5 ${modeInfo.color} mt-0.5 flex-shrink-0`} />
          <div>
            <h3 className={`font-medium ${modeInfo.color} mb-1`}>
              {modeInfo.title}
            </h3>
            <p className="text-sm text-gray-600">
              {modeInfo.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
