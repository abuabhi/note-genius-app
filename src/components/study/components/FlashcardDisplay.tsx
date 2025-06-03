
import { useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Flashcard } from "@/types/flashcard";

interface FlashcardDisplayProps {
  currentCard: Flashcard;
  currentIndex: number;
  isFlipped: boolean;
  onFlip: () => void;
}

export const FlashcardDisplay = ({
  currentCard,
  currentIndex,
  isFlipped,
  onFlip
}: FlashcardDisplayProps) => {
  const cardContainerRef = useRef<HTMLDivElement>(null);
  
  // Use useCallback to ensure stable references for content
  const getCardContent = useCallback(() => {
    if (!currentCard) {
      console.error("FlashcardDisplay: No current card provided");
      return { front: "No card data", back: "No card data" };
    }
    
    const frontContent = currentCard?.front_content || currentCard?.front;
    const backContent = currentCard?.back_content || currentCard?.back;
    
    console.log("FlashcardDisplay: Card content:", {
      cardId: currentCard.id,
      currentIndex,
      isFlipped,
      frontContent,
      backContent,
      position: currentCard.position
    });
    
    return { front: frontContent, back: backContent };
  }, [currentCard, currentIndex, isFlipped]);

  // Safety check - if no current card, show error state
  if (!currentCard) {
    console.error("FlashcardDisplay: No current card provided");
    return (
      <div className="mb-6">
        <Card className="min-h-[300px] w-full shadow-lg">
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="min-h-[250px] w-full flex items-center justify-center text-center p-4">
              <div className="text-lg md:text-xl text-muted-foreground">
                No flashcard data available
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { front, back } = getCardContent();
  
  // Create a unique animation key that ensures proper re-rendering
  const animationKey = `card-${currentCard.id}-${currentIndex}-${isFlipped ? 'back' : 'front'}`;
  const displayContent = isFlipped ? (back || "No back content") : (front || "No front content");

  console.log("FlashcardDisplay: Rendering with key:", animationKey, "content:", displayContent);

  return (
    <div ref={cardContainerRef} className="mb-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={animationKey}
          initial={{ rotateY: 180, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          exit={{ rotateY: -180, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full cursor-pointer"
          onClick={onFlip}
        >
          <Card 
            className="min-h-[300px] w-full shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <div className="min-h-[250px] w-full flex items-center justify-center text-center p-4">
                <div className="text-lg md:text-xl">
                  {displayContent}
                </div>
              </div>
              <div className="text-sm text-muted-foreground mt-4">
                {isFlipped ? "Click to see front" : "Click to see back"}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
