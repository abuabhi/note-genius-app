
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { useState } from "react";

// Mock data - in a real app, this would come from an API
const mockFlashcards = [
  { id: 1, front: "What is React?", back: "A JavaScript library for building user interfaces" },
  { id: 2, front: "What is JSX?", back: "A syntax extension for JavaScript that allows you to write HTML-like code in JavaScript" },
  { id: 3, front: "What is a component?", back: "A reusable piece of UI that can contain its own logic and styling" },
];

const FlashcardsList = () => {
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentCard((prev) => (prev + 1) % mockFlashcards.length);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="mb-6">
        <CardContent className="p-6">
          <div 
            className="min-h-[200px] flex items-center justify-center text-center cursor-pointer"
            onClick={handleFlip}
          >
            <p className="text-lg">
              {isFlipped ? mockFlashcards[currentCard].back : mockFlashcards[currentCard].front}
            </p>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Card {currentCard + 1} of {mockFlashcards.length}
        </p>
        <Button onClick={handleNext}>
          <BookOpen className="mr-2 h-4 w-4" />
          Next Card
        </Button>
      </div>
    </div>
  );
};

export default FlashcardsList;

