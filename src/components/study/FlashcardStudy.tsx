
import { useState, useEffect, useRef } from "react";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { Flashcard } from "@/types/flashcard";
import { StudyMode } from "@/pages/StudyPage";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence, motion } from "framer-motion";
import { StudyControls } from "./StudyControls";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface FlashcardStudyProps {
  setId: string;
  mode: StudyMode;
}

export const FlashcardStudy = ({ setId, mode }: FlashcardStudyProps) => {
  const { fetchFlashcardsInSet, recordFlashcardReview } = useFlashcards();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [streak, setStreak] = useState(0);
  const { user } = useAuth();
  const cardContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadFlashcards = async () => {
      setIsLoading(true);
      try {
        const cards = await fetchFlashcardsInSet(setId);
        
        // If we're in review mode, sort cards by next review date
        // If we're in test mode, shuffle the cards
        let sortedCards = [...cards];
        
        if (mode === "review") {
          sortedCards.sort((a, b) => {
            if (!a.next_review_at) return -1;
            if (!b.next_review_at) return 1;
            return new Date(a.next_review_at).getTime() - new Date(b.next_review_at).getTime();
          });
        } else if (mode === "test") {
          // Fisher-Yates shuffle
          for (let i = sortedCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [sortedCards[i], sortedCards[j]] = [sortedCards[j], sortedCards[i]];
          }
        }
        
        setFlashcards(sortedCards);
      } catch (error) {
        console.error("Error loading flashcards:", error);
        toast("Failed to load flashcards");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFlashcards();
    // Reset state when set ID or mode changes
    setCurrentIndex(0);
    setIsFlipped(false);
    setStreak(0);
  }, [setId, fetchFlashcardsInSet, mode]);
  
  const handleNext = () => {
    if (flashcards.length === 0) return;
    
    setDirection("right");
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 200);
  };
  
  const handlePrevious = () => {
    if (flashcards.length === 0) return;
    
    setDirection("left");
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }, 200);
  };
  
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  
  const handleScoreCard = async (score: number) => {
    if (!user || flashcards.length === 0) return;
    
    const flashcard = flashcards[currentIndex];
    
    // Record review with score
    try {
      await recordFlashcardReview(flashcard.id, score as 0 | 1 | 2 | 3 | 4 | 5);
      
      // Update streak if score is good
      if (score >= 3) {
        setStreak(prev => {
          const newStreak = prev + 1;
          if (newStreak % 5 === 0) {
            toast.success(`Streak of ${newStreak}! Keep going!`);
          }
          return newStreak;
        });
      } else {
        setStreak(0);
      }
      
      // Move to next card
      handleNext();
    } catch (error) {
      console.error("Error recording review:", error);
      toast("Failed to save your progress");
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div>
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="min-h-[300px] flex flex-col items-center justify-center space-y-4">
              <Skeleton className="h-8 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-4 w-2/5" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // No flashcards state
  if (flashcards.length === 0) {
    return (
      <div>
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="min-h-[300px] flex flex-col items-center justify-center text-center">
              <h3 className="text-lg font-semibold">No flashcards in this set</h3>
              <p className="text-muted-foreground mt-2">
                Add some flashcards to this set to start studying.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const currentCard = flashcards[currentIndex];
  
  return (
    <div>
      <div ref={cardContainerRef} className="mb-6 perspective-1000">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex + (isFlipped ? "-flipped" : "")}
            initial={{ 
              rotateY: isFlipped ? 0 : 180,
              x: direction === "right" ? 100 : -100,
              opacity: 0
            }}
            animate={{ 
              rotateY: isFlipped ? 180 : 0,
              x: 0,
              opacity: 1
            }}
            exit={{ 
              x: direction === "right" ? -100 : 100,
              opacity: 0
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ transformStyle: "preserve-3d" }}
            className="w-full cursor-pointer"
            onClick={handleFlip}
          >
            <Card 
              className="min-h-[300px] w-full shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <CardContent className="p-6 flex flex-col items-center justify-center">
                <div className="min-h-[250px] w-full flex items-center justify-center text-center p-4">
                  <div className="text-lg md:text-xl">
                    {isFlipped ? currentCard.back_content : currentCard.front_content}
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
      
      <Progress value={(currentIndex + 1) / flashcards.length * 100} className="mb-6" />
      
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Card {currentIndex + 1} of {flashcards.length}
          {streak > 0 && <span className="ml-2">• Streak: {streak}</span>}
        </p>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handlePrevious} size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setIsFlipped(!isFlipped)} size="sm">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button onClick={handleNext} size="sm">
            <span className="mr-1">Next</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Score controls for review mode */}
      {mode === "review" && isFlipped && (
        <StudyControls onScore={handleScoreCard} />
      )}
    </div>
  );
};
