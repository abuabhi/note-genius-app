
import { Progress } from "@/components/ui/progress";
import { ProgressCard } from "../shared/ProgressCard";
import { Award } from "lucide-react";
import { useProgressAnalytics } from "@/hooks/progress/useProgressAnalytics";

export const FlashcardMasteryLevels = () => {
  const { gradeProgression, isLoading } = useProgressAnalytics();

  if (isLoading) {
    return (
      <ProgressCard title="Mastery Levels" icon={Award}>
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </ProgressCard>
    );
  }

  if (gradeProgression.length === 0) {
    return (
      <ProgressCard title="Mastery Levels" icon={Award}>
        <div className="h-60 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Create flashcard sets to track mastery levels</p>
          </div>
        </div>
      </ProgressCard>
    );
  }

  const getMasteryColor = (level: number) => {
    if (level >= 80) return 'bg-green-500';
    if (level >= 60) return 'bg-yellow-500';
    if (level >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getMasteryLabel = (level: number) => {
    if (level >= 80) return 'Mastered';
    if (level >= 60) return 'Good';
    if (level >= 40) return 'Learning';
    return 'Beginner';
  };

  return (
    <ProgressCard title="Subject Mastery Levels" icon={Award}>
      <div className="space-y-6">
        {gradeProgression.map((subject) => (
          <div key={subject.subject} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">
                {subject.subject}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {getMasteryLabel(subject.masteryLevel)}
                </span>
                <span className="text-sm font-semibold">
                  {subject.masteryLevel}%
                </span>
              </div>
            </div>
            
            <div className="relative">
              <Progress 
                value={subject.masteryLevel} 
                className="h-3"
              />
              <div 
                className={`absolute top-0 left-0 h-3 rounded-full transition-all ${getMasteryColor(subject.masteryLevel)}`}
                style={{ width: `${subject.masteryLevel}%` }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>{subject.cardCount} cards</span>
              <span>
                {subject.averageTimeToMaster > 0 
                  ? `${subject.averageTimeToMaster} days avg to master`
                  : 'No mastery data yet'
                }
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-mint-50 rounded-lg">
        <p className="text-sm text-mint-700">
          <strong>Tip:</strong> Focus on subjects below 60% mastery level for optimal learning efficiency.
        </p>
      </div>
    </ProgressCard>
  );
};
