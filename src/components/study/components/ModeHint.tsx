
import { StudyMode } from "@/pages/study/types";
import { BookOpen, RotateCcw, Clock, Timer } from "lucide-react";

interface ModeHintProps {
  mode: StudyMode;
  isFlipped: boolean;
  timeLeft?: number;
}

export const ModeHint = ({ mode, isFlipped, timeLeft }: ModeHintProps) => {
  const getModeInfo = () => {
    switch (mode) {
      case "learn":
        return {
          icon: BookOpen,
          title: "Study Mode",
          description: "Take your time to learn each flashcard thoroughly"
        };
      case "review":
        return {
          icon: RotateCcw,
          title: "Review Mode",
          description: "Practice cards that need more attention"
        };
      case "test":
        return {
          icon: Clock,
          title: "Timed Review",
          description: "Quick assessment of your flashcard knowledge"
        };
      default:
        return {
          icon: BookOpen,
          title: "Study Mode",
          description: "Learn and practice your flashcards"
        };
    }
  };

  const { icon: Icon, title, description } = getModeInfo();

  return (
    <div className="text-center space-y-2">
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="font-medium">{title}</span>
        {mode === "test" && timeLeft !== undefined && (
          <>
            <Timer className="h-4 w-4 ml-2" />
            <span className="font-mono">{timeLeft}s</span>
          </>
        )}
      </div>
      <p className="text-xs text-muted-foreground max-w-md mx-auto">
        {description}
        {!isFlipped && mode !== "test" && " - Click the card to reveal the answer"}
        {mode === "test" && " - Answer quickly for bonus points!"}
      </p>
    </div>
  );
};
