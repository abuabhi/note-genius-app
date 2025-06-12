
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { StudyMode } from '@/pages/study/types';

interface StudyControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  onFlip: () => void;
  onChoice: (choice: 'mastered' | 'needs_practice' | 'difficult') => void;
  isFlipped: boolean;
  currentIndex: number;
  totalCards: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  mode: StudyMode;
}

export const StudyControls: React.FC<StudyControlsProps> = ({
  onPrevious,
  onNext,
  onFlip,
  onChoice,
  isFlipped,
  currentIndex,
  totalCards,
  canGoPrevious,
  canGoNext,
  mode
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Navigation Controls */}
      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={!canGoPrevious}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <Button
          variant="outline"
          onClick={onFlip}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Flip Card
        </Button>
        
        <Button
          variant="outline"
          onClick={onNext}
          disabled={!canGoNext}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Study Choice Controls - Only show when flipped */}
      {isFlipped && (
        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => onChoice('difficult')}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Difficult
          </Button>
          
          <Button
            variant="outline"
            onClick={() => onChoice('needs_practice')}
            className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Needs Practice
          </Button>
          
          <Button
            variant="outline"
            onClick={() => onChoice('mastered')}
            className="text-green-600 border-green-200 hover:bg-green-50"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mastered
          </Button>
        </div>
      )}
      
      {/* Progress Indicator */}
      <div className="text-center text-sm text-muted-foreground">
        Card {currentIndex + 1} of {totalCards}
      </div>
    </div>
  );
};
