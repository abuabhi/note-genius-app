
import { StudyMode } from "@/pages/study/types";
import { BookOpen, RotateCcw, GraduationCap } from "lucide-react";

interface StudyModeInfoProps {
  currentMode: StudyMode;
}

const modeInfo = {
  learn: {
    icon: BookOpen,
    title: "Study Mode",
    description: "Learn new flashcards at your own pace. Review each card and mark whether you know it or need more practice.",
  },
  review: {
    icon: RotateCcw,
    title: "Review Mode", 
    description: "Focus on cards you've marked as 'Need Practice'. Perfect for reinforcing difficult concepts.",
  },
  test: {
    icon: GraduationCap,
    title: "Quiz Mode",
    description: "Test your knowledge without hints. Great for exam preparation and checking your progress.",
  }
};

export const StudyModeInfo = ({ currentMode }: StudyModeInfoProps) => {
  const info = modeInfo[currentMode];
  const Icon = info.icon;

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-mint-100 p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-mint-50 rounded-md">
          <Icon className="h-4 w-4 text-mint-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-mint-800 mb-1">{info.title}</h3>
          <p className="text-sm text-muted-foreground">{info.description}</p>
        </div>
      </div>
    </div>
  );
};
