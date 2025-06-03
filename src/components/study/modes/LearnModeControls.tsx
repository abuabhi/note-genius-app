
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, CheckCircle, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { LearningProgress } from "@/hooks/useLearningProgress";

interface LearnModeControlsProps {
  progress: LearningProgress | null;
  onMarkAsKnown: (isKnown: boolean) => void;
  onMarkAsDifficult: (isDifficult: boolean) => void;
  onConfidenceChange: (level: number) => void;
  isFirstTime: boolean;
}

export const LearnModeControls: React.FC<LearnModeControlsProps> = ({
  progress,
  onMarkAsKnown,
  onMarkAsDifficult,
  onConfidenceChange,
  isFirstTime,
}) => {
  const confidenceLevel = progress?.confidence_level || 1;
  const timesCorrect = progress?.times_correct || 0;
  const timesSeen = progress?.times_seen || 0;
  const accuracy = timesSeen > 0 ? Math.round((timesCorrect / timesSeen) * 100) : 0;

  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Progress Stats */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              <Brain className="h-3 w-3 mr-1" />
              {timesSeen} times seen
            </Badge>
            <Badge variant="outline">
              {accuracy}% accuracy
            </Badge>
            {isFirstTime && (
              <Badge variant="secondary">
                First time seeing this card
              </Badge>
            )}
          </div>

          {/* Confidence Level */}
          <div className="space-y-2">
            <label className="text-sm font-medium">How confident are you with this card?</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <Button
                  key={level}
                  variant={confidenceLevel === level ? "default" : "outline"}
                  size="sm"
                  onClick={() => onConfidenceChange(level)}
                  className="flex-1"
                >
                  {level}
                </Button>
              ))}
            </div>
            <div className="text-xs text-muted-foreground text-center">
              1 = Not confident • 5 = Very confident
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant={progress?.is_known ? "default" : "outline"}
              size="sm"
              onClick={() => onMarkAsKnown(!progress?.is_known)}
              className="flex-1"
            >
              {progress?.is_known ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Unmark Known
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Known
                </>
              )}
            </Button>
            <Button
              variant={progress?.is_difficult ? "destructive" : "outline"}
              size="sm"
              onClick={() => onMarkAsDifficult(!progress?.is_difficult)}
              className="flex-1"
            >
              {progress?.is_difficult ? (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Remove Difficulty
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Mark as Difficult
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
