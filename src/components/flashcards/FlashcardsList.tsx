import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowLeft, ArrowRight, AlertCircle } from "lucide-react";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { motion, AnimatePresence } from "framer-motion";
import { StudyTimeDonutCounter } from "@/components/study/StudyTimeDonutCounter";

const FlashcardsList = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [studyStarted, setStudyStarted] = useState(false);
  
  const { flashcards, fetchFlashcards, loading } = useFlashcards();
  const { userProfile } = useRequireAuth();

  useEffect(() => {
    const loadFlashcards = async () => {
      setIsLoading(true);
      try {
        await fetchFlashcards({});
      } catch (error) {
        console.error('Error loading flashcards:', error);
        toast('Failed to load flashcards. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadFlashcards();
  }, [fetchFlashcards]);

  const handleNext = () => {
    if (flashcards.length === 0) return;
    
    // Start study session on first card interaction
    if (!studyStarted) {
      setStudyStarted(true);
    }
    
    setDirection("right");
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 200);
  };

  const handlePrevious = () => {
    if (flashcards.length === 0) return;
    
    // Start study session on first card interaction
    if (!studyStarted) {
      setStudyStarted(true);
    }
    
    setDirection("left");
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }, 200);
  };

  const handleFlip = () => {
    // Start study session on first card flip
    if (!studyStarted) {
      setStudyStarted(true);
    }
    
    setIsFlipped(!isFlipped);
  };

  // Loading state
  if (isLoading || (loading && loading.flashcards)) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="min-h-[200px] flex flex-col items-center justify-center space-y-4">
              <Skeleton className="h-8 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-4 w-2/5" />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

  // No flashcards state
  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="min-h-[200px] flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No flashcards found</h3>
              <p className="text-muted-foreground mt-2">
                Create your first flashcard to get started with your study session.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const frontContent = currentCard.front_content || currentCard.front;
  const backContent = currentCard.back_content || currentCard.back;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Study Time Tracker */}
      {studyStarted && (
        <div className="mb-6">
          <StudyTimeDonutCounter
            activityType="flashcard"
            isActive={true}
            size="small"
            className="w-fit mx-auto"
          />
        </div>
      )}

      <div className="perspective-1000 mb-6">
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
          >
            <Card onClick={handleFlip}>
              <CardContent className="p-6">
                <div className="min-h-[200px] flex items-center justify-center text-center">
                  <p className="text-lg">
                    {isFlipped ? backContent : frontContent}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
      
      <Progress value={(currentIndex + 1) / flashcards.length * 100} className="mb-4" />
      
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Card {currentIndex + 1} of {flashcards.length}
        </p>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handlePrevious}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <Button onClick={handleNext}>
            <BookOpen className="mr-2 h-4 w-4" />
            Next Card
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardsList;
