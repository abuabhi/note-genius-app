
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Target, Trophy } from 'lucide-react';

interface StudyProgressProps {
  currentIndex: number;
  totalCards: number;
  studiedToday: number;
  masteredCount: number;
}

export const StudyProgress: React.FC<StudyProgressProps> = ({
  currentIndex,
  totalCards,
  studiedToday,
  masteredCount
}) => {
  const progressPercentage = totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0;

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span>{currentIndex + 1}/{totalCards}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center">
            <BookOpen className="h-5 w-5 text-blue-500 mb-1" />
            <span className="text-sm font-medium">{totalCards}</span>
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
          
          <div className="flex flex-col items-center">
            <Target className="h-5 w-5 text-orange-500 mb-1" />
            <span className="text-sm font-medium">{studiedToday}</span>
            <span className="text-xs text-muted-foreground">Today</span>
          </div>
          
          <div className="flex flex-col items-center">
            <Trophy className="h-5 w-5 text-green-500 mb-1" />
            <span className="text-sm font-medium">{masteredCount}</span>
            <span className="text-xs text-muted-foreground">Mastered</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
