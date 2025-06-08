
import { Button } from "@/components/ui/button";
import { StudyMode } from "@/pages/study/types";
import { BookOpen, RefreshCw, Timer } from "lucide-react";

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
      label: "Study Mode",
      icon: BookOpen,
      description: "Learn new cards and practice"
    },
    {
      key: "review" as StudyMode,
      label: "Review",
      icon: RefreshCw,
      description: "Review cards that need practice"
    },
    {
      key: "test" as StudyMode,
      label: "Timed Review",
      icon: Timer,
      description: "Timed quiz mode"
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
            className={`flex items-center gap-2 ${
              isActive 
                ? "bg-mint-500 hover:bg-mint-600 text-white" 
                : "border-mint-200 hover:bg-mint-50 text-mint-700"
            }`}
          >
            <Icon className="h-4 w-4" />
            {mode.label}
          </Button>
        );
      })}
    </div>
  );
};
