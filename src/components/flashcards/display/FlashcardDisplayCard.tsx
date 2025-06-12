
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlashcardDisplayCardProps {
  flashcard: {
    id: string;
    front_content: string;
    back_content: string;
    front?: string;
    back?: string;
  } | null;
  isFlipped: boolean;
  onFlip: () => void;
  className?: string;
}

export const FlashcardDisplayCard: React.FC<FlashcardDisplayCardProps> = ({
  flashcard,
  isFlipped,
  onFlip,
  className
}) => {
  if (!flashcard) {
    return (
      <Card className={cn("p-8 text-center", className)}>
        <p className="text-muted-foreground">No flashcard available</p>
      </Card>
    );
  }

  const frontContent = flashcard.front_content || flashcard.front || '';
  const backContent = flashcard.back_content || flashcard.back || '';

  return (
    <Card className={cn("p-8 min-h-[300px] cursor-pointer relative", className)} onClick={onFlip}>
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center mb-4">
          {isFlipped ? (
            <div className="prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: backContent }} />
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: frontContent }} />
            </div>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onFlip();
          }}
          className="absolute bottom-4 right-4"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Flip
        </Button>
      </div>
    </Card>
  );
};
