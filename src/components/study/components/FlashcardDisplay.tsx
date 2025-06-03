
import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Flashcard } from "@/types/flashcard";

interface FlashcardDisplayProps {
  currentCard: Flashcard;
  currentIndex: number;
  isFlipped: boolean;
  direction: "left" | "right";
  onFlip: () => void;
}

export const FlashcardDisplay = ({
  currentCard,
  currentIndex,
  isFlipped,
  direction,
  onFlip
}: FlashcardDisplayProps) => {
  const cardContainerRef = useRef<HTMLDivElement>(null);
  
  const frontContent = currentCard.front_content || currentCard.front;
  const backContent = currentCard.back_content || currentCard.back;

  return (
    <div ref={cardContainerRef} className="mb-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex + (isFlipped ? "-flipped" : "")}
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
                <div className="text-lg md:text-xl">
                  {isFlipped ? backContent : frontContent}
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
