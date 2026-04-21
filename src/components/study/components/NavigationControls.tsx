
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
    <div className="flex justify-between items-center gap-2">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentIndex === 0}
        className="flex items-center gap-1 sm:gap-2 border-mint-200 text-mint-700 hover:bg-mint-50 disabled:opacity-50 min-h-[44px] px-2 sm:px-4"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Previous</span>
      </Button>

      <Button
        variant="outline"
        onClick={onFlip}
        className="flex items-center gap-1 sm:gap-2 bg-mint-50 border-mint-200 text-mint-700 hover:bg-mint-100 min-h-[44px] px-3 sm:px-4"
      >
        <RotateCcw className="h-4 w-4" />
        <span>Flip</span>
      </Button>

      <Button
        variant="outline"
        onClick={onNext}
        disabled={currentIndex >= totalCards - 1}
        className="flex items-center gap-1 sm:gap-2 border-mint-200 text-mint-700 hover:bg-mint-50 disabled:opacity-50 min-h-[44px] px-2 sm:px-4"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
