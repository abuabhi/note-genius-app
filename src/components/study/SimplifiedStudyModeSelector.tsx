
import { Button } from "@/components/ui/button";
import { StudyMode } from "@/pages/study/types";
import { BookOpen, RotateCcw, Clock } from "lucide-react";

interface SimplifiedStudyModeSelectorProps {
  currentMode: StudyMode;
  onModeChange: (mode: StudyMode) => void;
}

export const SimplifiedStudyModeSelector = ({ 
  currentMode, 
  onModeChange 
}: SimplifiedStudyModeSelectorProps) => {
  const modes = [
    {
      key: "learn" as StudyMode,
      label: "Study",
      icon: BookOpen,
      description: "Learn new cards"
    },
    {
      key: "review" as StudyMode,
      label: "Review",
      icon: RotateCcw,
      description: "Practice difficult cards"
    },
    {
      key: "test" as StudyMode,
      label: "Timed Review",
      icon: Clock,
      description: "Quick timed assessment"
    }
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = currentMode === mode.key;
        
        return (
          <Button
            key={mode.key}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onModeChange(mode.key)}
            className="flex items-center gap-2"
          >
            <Icon className="h-4 w-4" />
            {mode.label}
          </Button>
        );
      })}
    </div>
  );
};
