
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Target, RotateCcw } from "lucide-react";
import { TestSession } from "@/hooks/useTestSession";

interface TestResultsProps {
  session: TestSession;
  onRetakeTest: () => void;
  onBackToStudy: () => void;
}

export const TestResults: React.FC<TestResultsProps> = ({
  session,
  onRetakeTest,
  onBackToStudy,
}) => {
  const percentage = Math.round((session.correct_answers / session.total_questions) * 100);
  const duration = session.end_time && session.start_time 
    ? Math.round((new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / 1000)
    : 0;

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getGradeLetter = (percentage: number) => {
    if (percentage >= 90) return "A";
    if (percentage >= 80) return "B";
    if (percentage >= 70) return "C";
    if (percentage >= 60) return "D";
    return "F";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Test Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Display */}
          <div className="text-center space-y-2">
            <div className={`text-6xl font-bold ${getGradeColor(percentage)}`}>
              {percentage}%
            </div>
            <div className="text-2xl font-semibold text-muted-foreground">
              Grade: {getGradeLetter(percentage)}
            </div>
            <p className="text-lg">
              {session.correct_answers} out of {session.total_questions} correct
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center space-y-1">
              <Target className="h-6 w-6 mx-auto text-blue-500" />
              <div className="font-semibold">{session.correct_answers}</div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>
            <div className="text-center space-y-1">
              <Clock className="h-6 w-6 mx-auto text-purple-500" />
              <div className="font-semibold">{Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}</div>
              <div className="text-sm text-muted-foreground">Time</div>
            </div>
            <div className="text-center space-y-1">
              <Trophy className="h-6 w-6 mx-auto text-yellow-500" />
              <div className="font-semibold">{session.total_questions - session.correct_answers}</div>
              <div className="text-sm text-muted-foreground">Incorrect</div>
            </div>
          </div>

          {/* Performance Badge */}
          <div className="text-center">
            {percentage >= 90 && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                Excellent Performance! 🌟
              </Badge>
            )}
            {percentage >= 80 && percentage < 90 && (
              <Badge variant="default" className="bg-blue-100 text-blue-800">
                Great Job! 👏
              </Badge>
            )}
            {percentage >= 70 && percentage < 80 && (
              <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                Good Work! 👍
              </Badge>
            )}
            {percentage < 70 && (
              <Badge variant="default" className="bg-red-100 text-red-800">
                Keep Practicing! 💪
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={onRetakeTest} variant="outline" className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake Test
            </Button>
            <Button onClick={onBackToStudy} className="flex-1">
              Back to Study
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
