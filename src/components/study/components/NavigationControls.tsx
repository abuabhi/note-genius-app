
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

interface NavigationControlsProps {
  currentIndex: number;
  totalCards: number;
  onPrevious: () => void;
  onNext: () => void;
  onFlip: () => void;
  isQuizMode?: boolean;
}

export const NavigationControls = ({
  currentIndex,
  totalCards,
  onPrevious,
  onNext,
  onFlip,
  isQuizMode = false
}: NavigationControlsProps) => {
  if (isQuizMode) return null;

  return (
    <div className="flex justify-between items-center">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentIndex === 0}
        className="flex items-center gap-2 border-mint-200 text-mint-700 hover:bg-mint-50 disabled:opacity-50"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>

      <Button
        variant="outline"
        onClick={onFlip}
        className="flex items-center gap-2 bg-mint-50 border-mint-200 text-mint-700 hover:bg-mint-100"
      >
        <RotateCcw className="h-4 w-4" />
        Flip Card
      </Button>

      <Button
        variant="outline"
        onClick={onNext}
        disabled={currentIndex >= totalCards - 1}
        className="flex items-center gap-2 border-mint-200 text-mint-700 hover:bg-mint-50 disabled:opacity-50"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
