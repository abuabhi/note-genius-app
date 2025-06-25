
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Flashcard } from "@/types/flashcard";
import { DonutProgress } from "@/components/study/DonutProgress";

interface FlashcardWithProgressProps {
  flashcard: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
  currentIndex: number;
  totalCards: number;
  className?: string;
}

export const FlashcardWithProgress = ({
  flashcard,
  isFlipped,
  onFlip,
  currentIndex,
  totalCards,
  className = ""
}: FlashcardWithProgressProps) => {
  if (!flashcard) {
    return (
      <div className={`mb-6 ${className}`}>
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

  const frontContent = flashcard?.front_content || flashcard?.front;
  const backContent = flashcard?.back_content || flashcard?.back;
  const displayContent = isFlipped ? (backContent || "No back content") : (frontContent || "No front content");
  const animationKey = `card-${flashcard.id}-${currentIndex}-${isFlipped ? 'back' : 'front'}`;

  return (
    <div className={`mb-6 ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={animationKey}
          initial={{ rotateY: 180, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          exit={{ rotateY: -180, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full cursor-pointer relative"
          onClick={onFlip}
        >
          <Card className="min-h-[300px] w-full shadow-lg hover:shadow-xl transition-shadow duration-300">
            {/* Donut Progress in top-right corner */}
            <div className="absolute top-4 right-4 z-10">
              <DonutProgress 
                current={currentIndex + 1} 
                total={totalCards} 
                size="small"
                className="bg-white/80 backdrop-blur-sm rounded-full p-1"
              />
            </div>
            
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <div className="min-h-[250px] w-full flex items-center justify-center text-center p-4 pr-16">
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
