
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Target, Trophy, TrendingUp } from 'lucide-react';

interface StudyStatsProps {
  totalCards: number;
  studiedToday: number;
  masteredCount: number;
  showProgress?: boolean;
}

export const StudyStats: React.FC<StudyStatsProps> = ({
  totalCards,
  studiedToday,
  masteredCount,
  showProgress = true
}) => {
  const masteryPercentage = totalCards > 0 ? (masteredCount / totalCards) * 100 : 0;
  const todayPercentage = totalCards > 0 ? (studiedToday / totalCards) * 100 : 0;

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <h3 className="font-semibold text-sm">Study Statistics</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <BookOpen className="h-5 w-5 text-blue-500 mx-auto mb-2" />
            <div className="text-lg font-semibold">{totalCards}</div>
            <div className="text-xs text-muted-foreground">Total Cards</div>
          </div>
          
          <div className="text-center">
            <Target className="h-5 w-5 text-orange-500 mx-auto mb-2" />
            <div className="text-lg font-semibold">{studiedToday}</div>
            <div className="text-xs text-muted-foreground">Studied Today</div>
          </div>
          
          <div className="text-center">
            <Trophy className="h-5 w-5 text-green-500 mx-auto mb-2" />
            <div className="text-lg font-semibold">{masteredCount}</div>
            <div className="text-xs text-muted-foreground">Mastered</div>
          </div>
          
          <div className="text-center">
            <TrendingUp className="h-5 w-5 text-purple-500 mx-auto mb-2" />
            <div className="text-lg font-semibold">{masteryPercentage.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">Mastery Rate</div>
          </div>
        </div>
        
        {showProgress && (
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Today's Progress</span>
                <span>{todayPercentage.toFixed(0)}%</span>
              </div>
              <Progress value={todayPercentage} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Overall Mastery</span>
                <span>{masteryPercentage.toFixed(0)}%</span>
              </div>
              <Progress value={masteryPercentage} className="h-2 [&>div]:bg-green-500" />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
