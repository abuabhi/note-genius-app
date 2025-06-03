
import { Clock } from "lucide-react";
import { StudyMode } from "@/pages/study/types";

interface ModeHintProps {
  mode: StudyMode;
  isFlipped: boolean;
  timeLeft?: number;
}

export const ModeHint = ({ mode, isFlipped, timeLeft }: ModeHintProps) => {
  if (isFlipped) return null;

  const getHintText = () => {
    switch (mode) {
      case "learn":
        return "Study each card carefully, then flip to see the answer";
      case "review":
        return "Review cards you need to practice";
      case "test":
        return timeLeft ? `Quiz Mode - ${timeLeft}s remaining per card` : "Quiz Mode";
      default:
        return "";
    }
  };

  return (
    <div className="text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-mint-50 rounded-full text-mint-700 border border-mint-100">
        <Clock className="h-3 w-3" />
        <span className="text-sm">{getHintText()}</span>
      </div>
    </div>
  );
};
