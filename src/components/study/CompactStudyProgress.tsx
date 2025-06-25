
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Target, Trophy } from "lucide-react";

interface CompactStudyProgressProps {
  currentIndex: number;
  totalCards: number;
  studiedToday: number;
  masteredCount: number;
}

export const CompactStudyProgress = ({
  currentIndex,
  totalCards,
  studiedToday,
  masteredCount
}: CompactStudyProgressProps) => {
  const progressPercentage = totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0;
  const masteryPercentage = totalCards > 0 ? (masteredCount / totalCards) * 100 : 0;

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        {/* Main Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Progress</span>
            <span className="text-muted-foreground">{currentIndex + 1}/{totalCards}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        {/* Compact Stats Row */}
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-1 text-blue-600">
            <BookOpen className="h-4 w-4" />
            <span>{totalCards} total</span>
          </div>
          
          <div className="flex items-center gap-1 text-orange-600">
            <Target className="h-4 w-4" />
            <span>{studiedToday} today</span>
          </div>
          
          <div className="flex items-center gap-1 text-green-600">
            <Trophy className="h-4 w-4" />
            <span>{masteredCount} mastered</span>
          </div>
          
          <div className="text-purple-600 font-medium">
            {masteryPercentage.toFixed(0)}% mastery
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
