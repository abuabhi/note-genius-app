
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, RotateCcw, CheckCircle } from "lucide-react";
import { StudySessionTracker } from "@/components/study/StudySessionTracker";

const StudyPage = () => {
  useRequireAuth();
  const { setId } = useParams<{ setId: string }>();
  const { currentSet, fetchFlashcardsInSet } = useFlashcards();
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studiedCards, setStudiedCards] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFlashcards = async () => {
      if (!setId) return;
      
      try {
        setLoading(true);
        const cards = await fetchFlashcardsInSet(setId);
        setFlashcards(cards || []);
      } catch (error) {
        console.error("Error loading flashcards:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFlashcards();
  }, [setId, fetchFlashcardsInSet]);

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      
      // Mark current card as studied
      if (currentCard) {
        setStudiedCards(prev => new Set([...prev, currentCard.id]));
      }
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  const handleFlip = () => {
    setShowAnswer(!showAnswer);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setStudiedCards(new Set());
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <p>Loading flashcards...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!flashcards.length) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <p>No flashcards found in this set.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Study Session Tracker */}
        {setId && currentSet && (
          <div className="mb-6">
            <StudySessionTracker
              flashcardSetId={setId}
              flashcardSetName={currentSet.name}
              cardsStudied={studiedCards.size}
            />
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-mint-900 mb-2">
            {currentSet?.name || "Study Session"}
          </h1>
          <div className="flex items-center justify-between">
            <p className="text-mint-700">
              Card {currentIndex + 1} of {flashcards.length}
            </p>
            <p className="text-sm text-mint-600">
              {studiedCards.size} cards studied
            </p>
          </div>
          <Progress value={progress} className="mt-2" />
        </div>

        {/* Flashcard */}
        <Card className="mb-6 min-h-[400px] cursor-pointer" onClick={handleFlip}>
          <CardHeader>
            <CardTitle className="text-center text-mint-800">
              {showAnswer ? "Answer" : "Question"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center min-h-[300px]">
            <div className="text-center space-y-4">
              <div className="text-lg leading-relaxed">
                {showAnswer 
                  ? (currentCard?.back_content || currentCard?.back)
                  : (currentCard?.front_content || currentCard?.front)
                }
              </div>
              {!showAnswer && (
                <p className="text-sm text-gray-500">Click to reveal answer</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleFlip}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Flip Card
            </Button>
            
            <Button variant="outline" onClick={handleRestart}>
              Restart
            </Button>
          </div>

          <Button
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1}
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Completion Message */}
        {currentIndex === flashcards.length - 1 && studiedCards.has(currentCard?.id) && (
          <Card className="mt-6 bg-green-50 border-green-200">
            <CardContent className="text-center py-6">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Congratulations!
              </h3>
              <p className="text-green-700">
                You've completed studying this flashcard set. Great job!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default StudyPage;
