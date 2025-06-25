
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Target, Trophy, TrendingUp } from "lucide-react";

interface CompactStudyStatsProps {
  totalCards: number;
  studiedToday: number;
  masteredCount: number;
}

export const CompactStudyStats = ({
  totalCards,
  studiedToday,
  masteredCount
}: CompactStudyStatsProps) => {
  const masteryPercentage = totalCards > 0 ? (masteredCount / totalCards) * 100 : 0;

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Session Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <BookOpen className="h-4 w-4 text-blue-500 mx-auto mb-1" />
            <div className="text-lg font-semibold">{totalCards}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          
          <div>
            <Target className="h-4 w-4 text-orange-500 mx-auto mb-1" />
            <div className="text-lg font-semibold">{studiedToday}</div>
            <div className="text-xs text-muted-foreground">Studied</div>
          </div>
          
          <div>
            <Trophy className="h-4 w-4 text-green-500 mx-auto mb-1" />
            <div className="text-lg font-semibold">{masteredCount}</div>
            <div className="text-xs text-muted-foreground">Mastered</div>
          </div>
          
          <div>
            <TrendingUp className="h-4 w-4 text-purple-500 mx-auto mb-1" />
            <div className="text-lg font-semibold">{masteryPercentage.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">Mastery</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
