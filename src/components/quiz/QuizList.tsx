
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ListCheck } from "lucide-react";

// Mock data - in a real app, this would come from an API
const mockQuizQuestions = [
  {
    id: 1,
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: "Paris"
  },
  {
    id: 2,
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: "Mars"
  },
  {
    id: 3,
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correctAnswer: "4"
  }
];

const QuizList = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState(false);

  const handleNext = () => {
    if (currentQuestion < mockQuizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer("");
      setShowResult(false);
    }
  };

  const handleCheck = () => {
    setShowResult(true);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">
              {mockQuizQuestions[currentQuestion].question}
            </h2>
            
            <RadioGroup 
              value={selectedAnswer}
              onValueChange={setSelectedAnswer}
              className="space-y-3"
            >
              {mockQuizQuestions[currentQuestion].options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={option} />
                  <label htmlFor={option} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {option}
                  </label>
                </div>
              ))}
            </RadioGroup>

            {showResult && (
              <div className={`p-4 rounded-md ${
                selectedAnswer === mockQuizQuestions[currentQuestion].correctAnswer
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}>
                {selectedAnswer === mockQuizQuestions[currentQuestion].correctAnswer
                  ? "Correct!"
                  : `Incorrect. The correct answer is ${mockQuizQuestions[currentQuestion].correctAnswer}`}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Question {currentQuestion + 1} of {mockQuizQuestions.length}
        </p>
        <div className="space-x-4">
          <Button 
            variant="outline" 
            onClick={handleCheck} 
            disabled={!selectedAnswer || showResult}
          >
            <ListCheck className="mr-2 h-4 w-4" />
            Check Answer
          </Button>
          <Button 
            onClick={handleNext}
            disabled={currentQuestion === mockQuizQuestions.length - 1}
          >
            Next Question
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizList;
