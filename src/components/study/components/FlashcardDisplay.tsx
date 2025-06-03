
import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Flashcard } from "@/types/flashcard";

interface FlashcardDisplayProps {
  currentCard: Flashcard;
  currentIndex: number;
  isFlipped: boolean;
  direction: "left" | "right";
  forceUpdate: number;
  onFlip: () => void;
}

export const FlashcardDisplay = ({
  currentCard,
  currentIndex,
  isFlipped,
  direction,
  forceUpdate,
  onFlip
}: FlashcardDisplayProps) => {
  const cardContainerRef = useRef<HTMLDivElement>(null);
  
  // Add debugging logs
  console.log("FlashcardDisplay - Rendering with:", {
    cardId: currentCard?.id,
    currentIndex,
    isFlipped,
    forceUpdate,
    frontContent: currentCard?.front_content || currentCard?.front,
    backContent: currentCard?.back_content || currentCard?.back
  });

  // Safety check - if no current card, show error state
  if (!currentCard) {
    console.error("FlashcardDisplay - No current card provided");
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

  const frontContent = currentCard?.front_content || currentCard?.front;
  const backContent = currentCard?.back_content || currentCard?.back;
  
  // Create a unique animation key that includes all relevant state
  const animationKey = `card-${currentCard.id}-${currentIndex}-${forceUpdate}`;
  const displayContent = isFlipped ? (backContent || "No back content") : (frontContent || "No front content");

  console.log("FlashcardDisplay - Final display content:", displayContent);

  return (
    <div ref={cardContainerRef} className="mb-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={animationKey}
          initial={{ 
            x: direction === "right" ? 100 : -100,
            opacity: 0
          }}
          animate={{ 
            x: 0,
            opacity: 1
          }}
          exit={{ 
            x: direction === "right" ? -100 : 100,
            opacity: 0
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full cursor-pointer"
          onClick={onFlip}
        >
          <Card 
            className="min-h-[300px] w-full shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <div className="min-h-[250px] w-full flex items-center justify-center text-center p-4">
                <div 
                  className="text-lg md:text-xl" 
                  key={`content-${currentCard.id}-${currentIndex}-${isFlipped}-${forceUpdate}`}
                >
                  {displayContent}
                </div>
              </div>
              <div className="text-sm text-muted-foreground mt-4">
                {isFlipped ? "Click to see front" : "Click to see back"}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Card {currentIndex + 1} (ID: {currentCard.id.slice(0, 8)})
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
