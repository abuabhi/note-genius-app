
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Quiz } from "@/types/quiz";
import { CircleCheckIcon, CircleXIcon, FileTextIcon, TimerIcon, TrophyIcon, PercentIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

interface QuizResultsProps {
  quiz: Quiz;
  score: number;
  totalQuestions: number;
  duration?: number;
  onRetry?: () => void;
}

export const QuizResults = ({
  quiz,
  score,
  totalQuestions,
  duration,
  onRetry
}: QuizResultsProps) => {
  const navigate = useNavigate();
  const percentage = Math.round((score / totalQuestions) * 100);
  
  // Format time as mm:ss
  const formatTime = (seconds: number = 0) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Determine performance message based on score percentage
  const getMessage = () => {
    if (percentage >= 90) return "Excellent job! You've mastered this subject!";
    if (percentage >= 75) return "Great work! You know this material well.";
    if (percentage >= 60) return "Good effort! Keep practicing to improve.";
    if (percentage >= 40) return "You're on the right track. More practice will help.";
    return "Keep studying! You'll improve with more practice.";
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Quiz Results: {quiz.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-4">
          <div className="text-5xl font-bold mb-2">{percentage}%</div>
          <p className="text-lg">{getMessage()}</p>
        </div>
        
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <TrophyIcon className="h-5 w-5 text-primary" />
                <span>Score</span>
              </div>
              <span className="font-medium">{score} / {totalQuestions}</span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-2">
                <CircleCheckIcon className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-sm text-muted-foreground">Correct</div>
                  <div className="font-medium">{score}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center gap-2">
                <CircleXIcon className="h-5 w-5 text-red-600" />
                <div>
                  <div className="text-sm text-muted-foreground">Incorrect</div>
                  <div className="font-medium">{totalQuestions - score}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center gap-2">
                <TimerIcon className="h-5 w-5 text-amber-600" />
                <div>
                  <div className="text-sm text-muted-foreground">Time</div>
                  <div className="font-medium">{formatTime(duration)}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate("/quiz")}>
          <FileTextIcon className="mr-2 h-4 w-4" />
          All Quizzes
        </Button>
        {onRetry && (
          <Button onClick={onRetry}>
            <PercentIcon className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
