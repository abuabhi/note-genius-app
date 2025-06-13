import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizQuestion, QuizOption } from '@/types/quiz';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle } from "lucide-react";
import { Progress } from '@/components/ui/progress';
import { useUserTier } from '@/hooks/useUserTier';
import { Separator } from '@/components/ui/separator';
import { CompactFloatingTimer } from '@/components/study/CompactFloatingTimer';

interface QuizTakingCardProps {
  questions: (QuizQuestion & { options: QuizOption[] })[];
  onQuizComplete: (results: {
    score: number;
    totalQuestions: number;
    responses: {
      questionId: string;
      selectedOptionId?: string;
      isCorrect: boolean;
      timeSpent?: number;
    }[];
    duration?: number;
  }) => void;
}

export const QuizTakingCard = ({ questions, onQuizComplete }: QuizTakingCardProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [responses, setResponses] = useState<{
    questionId: string;
    selectedOptionId?: string;
    isCorrect: boolean;
    timeSpent?: number;
  }[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [totalTime, setTotalTime] = useState(0);
  const { isUserPremium } = useUserTier();
  const [quizStarted, setQuizStarted] = useState(false);
  
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + (showAnswer ? 1 : 0)) / questions.length) * 100;
  
  // Reset timer when moving to a new question
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);
  
  // Track total quiz time
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalTime(Date.now() - startTime);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [startTime]);
  
  const handleOptionSelect = (optionId: string) => {
    // Start quiz timer on first interaction
    if (!quizStarted) {
      setQuizStarted(true);
    }
    
    setSelectedOptionId(optionId);
  };
  
  const handleCheckAnswer = () => {
    if (!selectedOptionId) return;
    
    const selectedOption = currentQuestion.options.find(opt => opt.id === selectedOptionId);
    if (!selectedOption) return;
    
    setShowAnswer(true);
  };
  
  const handleNextQuestion = () => {
    if (!selectedOptionId) return;
    
    const selectedOption = currentQuestion.options.find(opt => opt.id === selectedOptionId);
    if (!selectedOption) return;
    
    // Calculate time spent on this question
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    
    // Save this response
    const newResponses = [...responses, {
      questionId: currentQuestion.id,
      selectedOptionId,
      isCorrect: selectedOption.is_correct,
      timeSpent
    }];
    
    setResponses(newResponses);
    
    // Move to next question or finish quiz
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOptionId(null);
      setShowAnswer(false);
    } else {
      // Quiz complete
      const score = newResponses.filter(r => r.isCorrect).length;
      onQuizComplete({
        score,
        totalQuestions: questions.length,
        responses: newResponses,
        duration: Math.floor(totalTime / 1000)
      });
    }
  };
  
  // Format time as mm:ss
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  if (!currentQuestion) return null;
  
  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Compact Floating Timer */}
      {quizStarted && (
        <CompactFloatingTimer
          activityType="quiz"
          isActive={true}
        />
      )}

      <Card className="bg-white/60 backdrop-blur-sm border-mint-100">
        <CardHeader className="relative pb-4">
          <div className="flex justify-between items-center mb-3">
            <CardTitle className="text-mint-800">
              Question {currentQuestionIndex + 1} of {questions.length}
            </CardTitle>
            <div className="text-sm font-medium text-mint-600 bg-mint-50 px-3 py-1 rounded-full">
              Time: {formatTime(totalTime)}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-6">
            <div className="text-lg font-medium text-mint-800 leading-relaxed">
              {currentQuestion.question}
            </div>
            
            <RadioGroup 
              value={selectedOptionId || ""} 
              onValueChange={handleOptionSelect}
              className="space-y-3"
              disabled={showAnswer}
            >
              {currentQuestion.options.map((option) => (
                <div
                  key={option.id}
                  className={`flex items-center space-x-3 border rounded-lg p-4 transition-all ${
                    showAnswer && option.is_correct
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : showAnswer && selectedOptionId === option.id && !option.is_correct
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : selectedOptionId === option.id
                      ? "border-mint-400 bg-mint-50"
                      : "border-mint-200 hover:border-mint-300 hover:bg-mint-25"
                  }`}
                >
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex-grow cursor-pointer text-mint-700">
                    {option.content}
                  </Label>
                  {showAnswer && option.is_correct && (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  )}
                  {showAnswer && !option.is_correct && selectedOptionId === option.id && (
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  )}
                </div>
              ))}
            </RadioGroup>
            
            {showAnswer && currentQuestion.explanation && isUserPremium && (
              <div className="mt-6">
                <Separator className="my-4" />
                <div className="bg-mint-50 rounded-lg p-4 border border-mint-100">
                  <div className="text-sm font-medium text-mint-800 mb-2">Explanation:</div>
                  <p className="text-sm text-mint-700 leading-relaxed">{currentQuestion.explanation}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 pt-6">
          {!showAnswer ? (
            <Button 
              onClick={handleCheckAnswer}
              disabled={!selectedOptionId}
              className="bg-mint-600 hover:bg-mint-700"
            >
              Check Answer
            </Button>
          ) : (
            <Button 
              onClick={handleNextQuestion}
              className="bg-mint-600 hover:bg-mint-700"
            >
              {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
