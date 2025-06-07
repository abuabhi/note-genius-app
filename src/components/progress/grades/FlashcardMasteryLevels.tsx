
import { Progress } from "@/components/ui/progress";
import { ProgressCard } from "../shared/ProgressCard";
import { Award } from "lucide-react";
import { useProgressAnalytics } from "@/hooks/progress/useProgressAnalytics";

export const FlashcardMasteryLevels = () => {
  const { gradeProgression, isLoading } = useProgressAnalytics();

  if (isLoading) {
    return (
      <ProgressCard 
        title="Subject Mastery Levels" 
        icon={Award}
        description="Track mastery progress across all subjects"
      >
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-mint-200 rounded w-24 mb-2"></div>
              <div className="h-2 bg-mint-200 rounded"></div>
            </div>
          ))}
        </div>
      </ProgressCard>
    );
  }

  if (gradeProgression.length === 0) {
    return (
      <ProgressCard 
        title="Subject Mastery Levels" 
        icon={Award}
        description="Track mastery progress across all subjects"
      >
        <div className="h-60 flex items-center justify-center">
          <div className="text-center">
            <Award className="h-12 w-12 mx-auto mb-4 text-mint-300" />
            <p className="text-mint-600 font-medium">Create flashcard sets to track mastery</p>
            <p className="text-sm text-mint-500 mt-2">Study regularly to build subject expertise</p>
          </div>
        </div>
      </ProgressCard>
    );
  }

  const getMasteryColor = (level: number) => {
    if (level >= 80) return 'bg-green-500';
    if (level >= 60) return 'bg-mint-500';
    if (level >= 40) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getMasteryLabel = (level: number) => {
    if (level >= 80) return 'Mastered';
    if (level >= 60) return 'Good';
    if (level >= 40) return 'Learning';
    return 'Beginner';
  };

  const getMasteryTextColor = (level: number) => {
    if (level >= 80) return 'text-green-700';
    if (level >= 60) return 'text-mint-700';
    if (level >= 40) return 'text-yellow-700';
    return 'text-orange-700';
  };

  return (
    <ProgressCard 
      title="Subject Mastery Levels" 
      icon={Award}
      description="Track mastery progress across all subjects"
    >
      <div className="space-y-6">
        {gradeProgression.map((subject) => (
          <div key={subject.subject} className="space-y-3 p-4 bg-mint-50 rounded-lg border border-mint-100">
            <div className="flex items-center justify-between">
              <span className="font-medium text-mint-800">
                {subject.subject}
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${getMasteryTextColor(subject.masteryLevel)}`}>
                  {getMasteryLabel(subject.masteryLevel)}
                </span>
                <span className="text-sm font-semibold text-mint-800">
                  {subject.masteryLevel}%
                </span>
              </div>
            </div>
            
            <div className="relative">
              <Progress 
                value={subject.masteryLevel} 
                className="h-3 bg-mint-100"
              />
              <div 
                className={`absolute top-0 left-0 h-3 rounded-full transition-all ${getMasteryColor(subject.masteryLevel)}`}
                style={{ width: `${subject.masteryLevel}%` }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-mint-600">
              <span>{subject.cardCount} cards total</span>
              <span>
                {subject.averageTimeToMaster > 0 
                  ? `${subject.averageTimeToMaster} days avg to master`
                  : 'Building mastery data'
                }
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-mint-50 rounded-lg border border-mint-200">
        <p className="text-sm text-mint-700">
          <strong>Study Tip:</strong> Focus on subjects below 60% mastery level for optimal learning efficiency.
        </p>
      </div>
    </ProgressCard>
  );
};
