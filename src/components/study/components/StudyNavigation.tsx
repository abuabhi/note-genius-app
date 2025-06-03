
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";

interface StudyNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  onFlip: () => void;
}

export const StudyNavigation = ({ onPrevious, onNext, onFlip }: StudyNavigationProps) => {
  return (
    <div className="flex space-x-2">
      <Button variant="outline" onClick={onPrevious} size="sm">
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <Button variant="outline" onClick={onFlip} size="sm">
        <RotateCcw className="h-4 w-4" />
      </Button>
      <Button onClick={onNext} size="sm">
        <span className="mr-1">Next</span>
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
