
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Clock, CheckCircle } from "lucide-react";

interface TestModeControlsProps {
  questionType: 'flashcard' | 'multiple_choice' | 'fill_blank';
  frontContent: string;
  backContent: string;
  isAnswered: boolean;
  userAnswer?: string;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  timeSpent?: number;
}

export const TestModeControls: React.FC<TestModeControlsProps> = ({
  questionType,
  frontContent,
  backContent,
  isAnswered,
  userAnswer,
  onAnswer,
  timeSpent,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [fillBlankAnswer, setFillBlankAnswer] = useState<string>("");

  const generateMultipleChoiceOptions = (correctAnswer: string): string[] => {
    // Simple option generation - in a real app, this would be more sophisticated
    const options = [correctAnswer];
    
    // Generate some fake options based on the correct answer
    const words = correctAnswer.split(' ');
    if (words.length > 1) {
      // Mix up word order
      options.push([...words].reverse().join(' '));
      // Take first half + random word
      options.push(words.slice(0, Math.ceil(words.length / 2)).join(' ') + ' option');
      // Random similar option
      options.push('Alternative ' + words[words.length - 1]);
    } else {
      options.push(correctAnswer + ' alternative');
      options.push('Different ' + correctAnswer);
      options.push(correctAnswer.toUpperCase());
    }

    // Shuffle options
    return options.sort(() => Math.random() - 0.5);
  };

  const handleSubmitAnswer = () => {
    let answer = "";
    let isCorrect = false;

    switch (questionType) {
      case 'multiple_choice':
        answer = selectedAnswer;
        isCorrect = selectedAnswer.toLowerCase().trim() === backContent.toLowerCase().trim();
        break;
      case 'fill_blank':
        answer = fillBlankAnswer;
        isCorrect = fillBlankAnswer.toLowerCase().trim() === backContent.toLowerCase().trim();
        break;
      default:
        // For flashcard mode, we'll handle this in the parent component
        return;
    }

    onAnswer(answer, isCorrect);
  };

  if (questionType === 'flashcard') {
    return (
      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Think about your answer, then reveal to check
            </p>
            {timeSpent && (
              <div className="flex items-center justify-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                {timeSpent}s
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isAnswered) {
    return (
      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <CheckCircle className="h-8 w-8 mx-auto text-green-500" />
            <p className="font-medium">Answer submitted!</p>
            <p className="text-sm text-muted-foreground">Your answer: {userAnswer}</p>
            {timeSpent && (
              <div className="flex items-center justify-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                {timeSpent}s
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const options = questionType === 'multiple_choice' ? generateMultipleChoiceOptions(backContent) : [];

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {questionType === 'multiple_choice' ? 'Choose the correct answer:' : 'Fill in the blank:'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {questionType === 'multiple_choice' ? (
          <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <Input
            placeholder="Type your answer here..."
            value={fillBlankAnswer}
            onChange={(e) => setFillBlankAnswer(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
          />
        )}

        <Button 
          onClick={handleSubmitAnswer}
          disabled={
            (questionType === 'multiple_choice' && !selectedAnswer) ||
            (questionType === 'fill_blank' && !fillBlankAnswer.trim())
          }
          className="w-full"
        >
          Submit Answer
        </Button>

        {timeSpent && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {timeSpent}s elapsed
          </div>
        )}
      </CardContent>
    </Card>
  );
};
