
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
import { useManagedInterval } from '@/utils/performance';
import { useQuizDraft } from '@/hooks/useQuizDraft';

interface QuizTakingCardProps {
  questions: (QuizQuestion & { options: QuizOption[] })[];
  /** Optional quiz id — when provided, in-progress answers are persisted server-side. */
  quizId?: string;
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

export const QuizTakingCard = ({ questions, quizId, onQuizComplete }: QuizTakingCardProps) => {
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
  const [draftAnswers, setDraftAnswers] = useState<Record<string, string>>({});

  // Server-side draft persistence (no-op if quizId omitted)
  const { draft, loaded: draftLoaded, saveDraft, clearDraft } = useQuizDraft(quizId);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + (showAnswer ? 1 : 0)) / questions.length) * 100;

  // Restore draft on first load
  useEffect(() => {
    if (!draftLoaded || !draft || !quizId) return;
    if (draft.current_question > 0 || Object.keys(draft.answers || {}).length > 0) {
      setCurrentQuestionIndex(Math.min(draft.current_question, questions.length - 1));
      setDraftAnswers(draft.answers || {});
      setQuizStarted(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftLoaded]);

  // Reset timer when moving to a new question
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);
  
  // Track total quiz time with managed interval
  const updateTotalTime = () => {
    setTotalTime(Date.now() - startTime);
  };
  
  useManagedInterval('quiz-timer', updateTotalTime, quizStarted ? 1000 : null);
  
  const handleOptionSelect = (optionId: string) => {
    if (!quizStarted) setQuizStarted(true);
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

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const newResponses = [...responses, {
      questionId: currentQuestion.id,
      selectedOptionId,
      isCorrect: selectedOption.is_correct,
      timeSpent
    }];
    setResponses(newResponses);

    // Persist draft (server-side) after each answer
    const nextAnswers = { ...draftAnswers, [currentQuestion.id]: selectedOptionId };
    setDraftAnswers(nextAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      setSelectedOptionId(null);
      setShowAnswer(false);
      saveDraft({ answers: nextAnswers, current_question: nextIdx });
    } else {
      // Quiz complete — clear the draft
      const score = newResponses.filter(r => r.isCorrect).length;
      void clearDraft();
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
      <Card className="bg-white/60 backdrop-blur-sm border-mint-100">
        <CardHeader className="relative pb-4 px-4 sm:px-6">
          <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
            <CardTitle className="text-mint-800 text-base sm:text-lg">
              Question {currentQuestionIndex + 1} of {questions.length}
            </CardTitle>
            <div className="text-xs sm:text-sm font-medium text-mint-600 bg-mint-50 px-3 py-1 rounded-full">
              {formatTime(totalTime)}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent className="pt-4 px-4 sm:px-6">
          <div className="space-y-6">
            <div className="text-base sm:text-lg font-medium text-mint-800 leading-relaxed max-h-[30vh] overflow-y-auto break-words pr-1">
              {currentQuestion.question}
            </div>
            
            <RadioGroup 
              value={selectedOptionId || ""} 
              onValueChange={handleOptionSelect}
              className="space-y-3"
              disabled={showAnswer}
            >
              {currentQuestion.options.map((option) => (
                <label
                  key={option.id}
                  htmlFor={option.id}
                  className={`flex items-start space-x-3 border rounded-lg p-4 min-h-[56px] max-h-[8rem] overflow-y-auto cursor-pointer transition-all ${
                    showAnswer && option.is_correct
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : showAnswer && selectedOptionId === option.id && !option.is_correct
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : selectedOptionId === option.id
                      ? "border-mint-400 bg-mint-50"
                      : "border-mint-200 hover:border-mint-300 hover:bg-mint-25"
                  }`}
                >
                  <RadioGroupItem value={option.id} id={option.id} className="mt-1 flex-shrink-0" />
                  <span className="flex-grow text-mint-700 text-sm sm:text-base break-words">
                    {option.content}
                  </span>
                  {showAnswer && option.is_correct && (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  )}
                  {showAnswer && !option.is_correct && selectedOptionId === option.id && (
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                </label>
              ))}
            </RadioGroup>
            
            {showAnswer && currentQuestion.explanation && isUserPremium && (
              <div className="mt-6">
                <Separator className="my-4" />
                <div className="bg-mint-50 rounded-lg p-4 border border-mint-100 max-h-[20vh] overflow-y-auto">
                  <div className="text-sm font-medium text-mint-800 mb-2">Explanation:</div>
                  <p className="text-sm text-mint-700 leading-relaxed break-words">{currentQuestion.explanation}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 pt-6 px-4 sm:px-6">
          {!showAnswer ? (
            <Button 
              onClick={handleCheckAnswer}
              disabled={!selectedOptionId}
              className="bg-mint-600 hover:bg-mint-700 w-full sm:w-auto min-h-[44px]"
            >
              Check Answer
            </Button>
          ) : (
            <Button 
              onClick={handleNextQuestion}
              className="bg-mint-600 hover:bg-mint-700 w-full sm:w-auto min-h-[44px]"
            >
              {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
