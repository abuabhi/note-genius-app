
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Clock, Target, TrendingUp, RotateCcw, ArrowLeft, Timer } from "lucide-react";

interface QuizResultsProps {
  totalCards: number;
  correctAnswers: number;
  totalScore: number;
  durationSeconds?: number;
  averageResponseTime?: number;
  grade?: string;
  onRestart: () => void;
  onBackToSets: () => void;
}

export const QuizResults = ({
  totalCards,
  correctAnswers,
  totalScore,
  durationSeconds,
  averageResponseTime,
  grade,
  onRestart,
  onBackToSets
}: QuizResultsProps) => {
  const percentage = Math.round((correctAnswers / totalCards) * 100);
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getGradeColor = (grade?: string) => {
    switch (grade) {
      case 'A': return 'text-green-600';
      case 'B': return 'text-blue-600';
      case 'C': return 'text-yellow-600';
      case 'D': return 'text-orange-600';
      case 'F': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-6"
        >
          <Trophy className="h-20 w-20 text-yellow-500 mx-auto mb-4" />
        </motion.div>
        
        <h1 className="text-3xl font-bold mb-2">Timed Review Complete!</h1>
        <p className="text-muted-foreground mb-6">
          Here's how you performed on this flashcard assessment
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{correctAnswers}/{totalCards}</div>
            <p className="text-xs text-muted-foreground">
              {percentage}% correct
            </p>
            {grade && (
              <div className={`text-lg font-bold mt-1 ${getGradeColor(grade)}`}>
                Grade: {grade}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-mint-600">{totalScore}</div>
            <p className="text-xs text-muted-foreground">
              Including time bonuses
            </p>
          </CardContent>
        </Card>

        {durationSeconds && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(durationSeconds)}</div>
              <p className="text-xs text-muted-foreground">
                Duration
              </p>
            </CardContent>
          </Card>
        )}

        {averageResponseTime && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Response</CardTitle>
              <Timer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageResponseTime.toFixed(1)}s</div>
              <p className="text-xs text-muted-foreground">
                Per card
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={onRestart} size="lg" className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          Try Again
        </Button>
        <Button 
          onClick={onBackToSets} 
          variant="outline" 
          size="lg"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Flashcards
        </Button>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>Want structured multiple-choice tests? Try our <strong>Formal Quizzes</strong> section!</p>
      </div>
    </div>
  );
};
