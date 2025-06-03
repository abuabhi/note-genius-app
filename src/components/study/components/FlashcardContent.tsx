
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCcw } from "lucide-react";
import { ProgressIndicator } from "./ProgressIndicator";

interface FlashcardContentProps {
  currentCard: any;
  isFlipped: boolean;
  currentIndex: number;
  totalCards: number;
  onFlip: () => void;
}

export const FlashcardContent = ({
  currentCard,
  isFlipped,
  currentIndex,
  totalCards,
  onFlip
}: FlashcardContentProps) => {
  return (
    <div className="relative min-h-[400px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentCard.id}-${isFlipped}`}
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          exit={{ rotateY: -90, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="cursor-pointer"
          onClick={onFlip}
        >
          <Card className="min-h-[400px] shadow-md hover:shadow-lg transition-shadow duration-200 bg-white border-mint-100 relative">
            {/* Donut progress in top right corner */}
            <div className="absolute top-4 right-4 z-10">
              <ProgressIndicator current={currentIndex + 1} total={totalCards} />
            </div>
            
            <CardContent className="p-8 h-full min-h-[400px] flex items-center justify-center">
              <div className="text-center max-w-2xl w-full">
                <div className="text-lg md:text-xl leading-relaxed text-mint-800 mb-6">
                  {isFlipped ? currentCard.back_content : currentCard.front_content}
                </div>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <div className={`w-2 h-2 rounded-full ${isFlipped ? 'bg-mint-400' : 'bg-mint-300'}`}></div>
                  <span className="text-sm font-medium">
                    {isFlipped ? "Back" : "Front"} • Click to flip
                  </span>
                  <RotateCcw className="h-4 w-4 opacity-60" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
