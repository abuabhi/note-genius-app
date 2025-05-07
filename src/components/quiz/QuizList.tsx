import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { ListCheck, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { isPremiumTier } from "@/utils/premiumFeatures";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

// Mock data - in a real app, this would come from an API
const mockQuizzes = [
  {
    id: 1,
    title: "Basic Math Quiz",
    description: "Test your basic math knowledge",
    questions: [
      {
        id: 1,
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correctAnswer: "4",
        explanation: "2 + 2 equals 4"
      },
      {
        id: 2,
        question: "What is 5 x 5?",
        options: ["15", "20", "25", "30"],
        correctAnswer: "25",
        explanation: "5 x 5 equals 25"
      },
      {
        id: 3,
        question: "What is 10 - 7?",
        options: ["1", "2", "3", "4"],
        correctAnswer: "3",
        explanation: "10 - 7 equals 3"
      }
    ],
    category: "Mathematics"
  },
  {
    id: 2,
    title: "World Geography",
    description: "Test your geography knowledge",
    questions: [
      {
        id: 1,
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correctAnswer: "Paris",
        explanation: "Paris is the capital of France"
      },
      {
        id: 2,
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctAnswer: "Mars",
        explanation: "Mars is known as the Red Planet due to its reddish appearance"
      }
    ],
    category: "Geography"
  }
];

const QuizList = () => {
  const [activeQuizId, setActiveQuizId] = useState<number | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const { toast } = useToast();
  const { userProfile } = useRequireAuth();
  const isPremium = isPremiumTier(userProfile?.user_tier);

  const activeQuiz = activeQuizId !== null ? mockQuizzes.find(q => q.id === activeQuizId) : null;
  const currentQuizQuestion = activeQuiz && quizStarted ? activeQuiz.questions[currentQuestion] : null;

  const handleStartQuiz = (quizId: number) => {
    setActiveQuizId(quizId);
    setQuizStarted(true);
    setCurrentQuestion(0);
    setUserAnswers({});
    setQuizCompleted(false);
    setShowExplanation(false);
    setTimerSeconds(0);
    setTimerActive(true);
  };

  const handleNextQuestion = () => {
    if (activeQuiz && currentQuestion < activeQuiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer("");
      setShowResult(false);
      setShowExplanation(false);
    } else {
      // Quiz completed
      setQuizCompleted(true);
      setTimerActive(false);
    }
  };

  const handleCheck = () => {
    if (!selectedAnswer) return;
    
    setShowResult(true);
    setUserAnswers(prev => ({
      ...prev,
      [currentQuizQuestion?.id || 0]: selectedAnswer
    }));
  };

  const calculateScore = () => {
    if (!activeQuiz) return 0;
    
    let correct = 0;
    activeQuiz.questions.forEach(question => {
      if (userAnswers[question.id] === question.correctAnswer) {
        correct += 1;
      }
    });
    
    return (correct / activeQuiz.questions.length) * 100;
  };

  const handleToggleExplanation = () => {
    if (!isPremium && !showExplanation) {
      toast({
        title: "Premium Feature",
        description: "Explanations are available for Master and Dean tier users.",
        variant: "destructive",
      });
      return;
    }
    
    setShowExplanation(prev => !prev);
  };

  const handleBackToQuizzes = () => {
    setActiveQuizId(null);
    setQuizStarted(false);
    setTimerActive(false);
  };

  // Render quiz selection
  if (!quizStarted) {
    return (
      <div className="space-y-4">
        {mockQuizzes.map(quiz => (
          <Card key={quiz.id}>
            <CardHeader>
              <CardTitle>{quiz.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{quiz.description}</p>
              <div className="flex items-center mt-2">
                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md">
                  {quiz.category}
                </span>
                <span className="text-xs ml-2 text-muted-foreground">
                  {quiz.questions.length} questions
                </span>
              </div>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => handleStartQuiz(quiz.id)}>Start Quiz</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  // Render quiz completed screen
  if (quizCompleted) {
    const score = calculateScore();
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    
    return (
      <Card className="text-center">
        <CardHeader>
          <CardTitle>Quiz Completed!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative py-8">
            <div className="text-5xl font-bold">{score.toFixed(0)}%</div>
            <Progress 
              value={score} 
              className="h-4 mt-4" 
              indicatorClassName={score >= 70 ? "bg-green-500" : score >= 40 ? "bg-yellow-500" : "bg-red-500"} 
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-muted rounded-lg">
              <Clock className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <div className="font-medium">Time Taken</div>
              <div className="text-lg">{minutes}m {seconds}s</div>
            </div>
            
            <div className="text-center p-4 bg-muted rounded-lg">
              <CheckCircle2 className="h-5 w-5 mx-auto mb-2 text-green-500" />
              <div className="font-medium">Correct</div>
              <div className="text-lg">
                {activeQuiz?.questions.filter(q => userAnswers[q.id] === q.correctAnswer).length || 0}
              </div>
            </div>
            
            <div className="text-center p-4 bg-muted rounded-lg">
              <XCircle className="h-5 w-5 mx-auto mb-2 text-red-500" />
              <div className="font-medium">Incorrect</div>
              <div className="text-lg">
                {activeQuiz?.questions.filter(q => 
                  userAnswers[q.id] && userAnswers[q.id] !== q.correctAnswer
                ).length || 0}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-center space-x-2">
          {/* Review answers button would show detailed review in a real app */}
          <Button variant="outline" onClick={handleBackToQuizzes}>Back to Quizzes</Button>
          <Button onClick={() => handleStartQuiz(activeQuizId!)}>Retry Quiz</Button>
        </CardFooter>
      </Card>
    );
  }

  // Render active question
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">{activeQuiz?.title}</CardTitle>
            <div className="text-sm text-muted-foreground">
              <Clock className="h-4 w-4 inline-block mr-1" />
              {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
            </div>
          </div>
          <Progress 
            value={((currentQuestion + 1) / (activeQuiz?.questions.length || 1)) * 100} 
            className="h-2" 
          />
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">
              {currentQuizQuestion?.question}
            </h2>
            
            <RadioGroup 
              value={selectedAnswer}
              onValueChange={setSelectedAnswer}
              className="space-y-3"
            >
              {currentQuizQuestion?.options.map((option) => (
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
                selectedAnswer === currentQuizQuestion?.correctAnswer
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}>
                {selectedAnswer === currentQuizQuestion?.correctAnswer
                  ? "Correct!"
                  : `Incorrect. The correct answer is ${currentQuizQuestion?.correctAnswer}`}
              </div>
            )}
            
            {showExplanation && currentQuizQuestion?.explanation && (
              <div className="p-4 bg-blue-50 text-blue-800 rounded-md mt-2">
                <h3 className="font-medium">Explanation:</h3>
                <p>{currentQuizQuestion.explanation}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleToggleExplanation}
              disabled={!showResult}
            >
              {showExplanation ? "Hide Explanation" : "Show Explanation"}
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleCheck} 
              disabled={!selectedAnswer || showResult}
            >
              <ListCheck className="mr-2 h-4 w-4" />
              Check Answer
            </Button>
            <Button 
              onClick={handleNextQuestion}
              disabled={!showResult}
            >
              {currentQuestion < (activeQuiz?.questions.length || 0) - 1 ? "Next Question" : "Finish Quiz"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuizList;
