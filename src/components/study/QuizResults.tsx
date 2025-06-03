
import { motion } from "framer-motion";
import { Trophy, Clock, Target, TrendingUp, Award, RotateCcw, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const percentage = Math.round((correctAnswers / totalCards) * 100);
  const incorrectAnswers = totalCards - correctAnswers;
  
  const formatTime = (seconds?: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getGradeColor = (grade?: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-50 border-green-200';
      case 'B': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'C': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'D': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'F': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-mint-600 bg-mint-50 border-mint-200';
    }
  };

  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 90) return "Excellent work! You've mastered this material.";
    if (percentage >= 80) return "Great job! You have a strong understanding.";
    if (percentage >= 70) return "Good effort! A little more practice will help.";
    if (percentage >= 60) return "Fair performance. Consider reviewing the material.";
    return "Keep practicing! Review the material and try again.";
  };

  return (
    <div className="text-center py-12 max-w-2xl mx-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="space-y-8"
      >
        {/* Header */}
        <div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Trophy className="h-16 w-16 text-mint-500 mx-auto mb-6" />
          </motion.div>
          <h2 className="text-3xl font-bold mb-2 text-mint-800">Quiz Complete!</h2>
          <p className="text-muted-foreground mb-4">{getPerformanceMessage(percentage)}</p>
        </div>

        {/* Grade Card */}
        {grade && (
          <Card className={`inline-block ${getGradeColor(grade)}`}>
            <CardContent className="p-6">
              <div className="text-4xl font-bold mb-2">{grade}</div>
              <div className="text-sm font-medium">Grade</div>
            </CardContent>
          </Card>
        )}

        {/* Score Overview */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white border-mint-100">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-mint-600 mb-2">{percentage}%</div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
              <div className="text-xs text-muted-foreground mt-1">
                {correctAnswers}/{totalCards} correct
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-mint-100">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-mint-600 mb-2">{totalScore}</div>
              <div className="text-sm text-muted-foreground">Total Score</div>
              <div className="text-xs text-muted-foreground mt-1">
                Including time bonuses
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
            <Target className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-green-700">{correctAnswers}</div>
            <div className="text-xs text-green-600">Correct</div>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
            <Target className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-red-700">{incorrectAnswers}</div>
            <div className="text-xs text-red-600">Incorrect</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
            <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-blue-700">{formatTime(durationSeconds)}</div>
            <div className="text-xs text-blue-600">Total Time</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
            <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-purple-700">
              {averageResponseTime ? `${averageResponseTime.toFixed(1)}s` : '--'}
            </div>
            <div className="text-xs text-purple-600">Avg. Time</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onRestart}
            size="lg"
            className="flex items-center gap-2 bg-mint-500 hover:bg-mint-600 text-white"
          >
            <RotateCcw className="h-5 w-5" />
            Take Quiz Again
          </Button>
          
          <Button
            onClick={() => navigate('/quiz/history')}
            variant="outline"
            size="lg"
            className="flex items-center gap-2 border-mint-200 text-mint-700 hover:bg-mint-50"
          >
            <History className="h-5 w-5" />
            View History
          </Button>
          
          <Button
            onClick={onBackToSets}
            variant="outline"
            size="lg"
            className="flex items-center gap-2 border-mint-200 text-mint-700 hover:bg-mint-50"
          >
            <Award className="h-5 w-5" />
            Back to Sets
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
