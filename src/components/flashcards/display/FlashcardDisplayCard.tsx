
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sanitizeHTML } from '@/utils/sanitize';

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
  const safeFront = sanitizeHTML(frontContent);
  const safeBack = sanitizeHTML(backContent);

  return (
    <Card
      className={cn(
        "p-6 sm:p-8 min-h-[300px] max-h-[60vh] cursor-pointer relative flex flex-col",
        className
      )}
      onClick={onFlip}
    >
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="text-center">
          {isFlipped ? (
            <div
              className="prose prose-sm max-w-none break-words"
              style={{ fontSize: 'clamp(0.875rem, 2vw, 1.125rem)' }}
            >
              <div dangerouslySetInnerHTML={{ __html: safeBack }} />
            </div>
          ) : (
            <div
              className="prose prose-sm max-w-none break-words"
              style={{ fontSize: 'clamp(0.875rem, 2vw, 1.125rem)' }}
            >
              <div dangerouslySetInnerHTML={{ __html: safeFront }} />
            </div>
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onFlip();
        }}
        className="absolute bottom-3 right-3"
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        Flip
      </Button>
    </Card>
  );
};
