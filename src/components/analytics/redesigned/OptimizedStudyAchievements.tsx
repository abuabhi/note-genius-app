
import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Flame, BookOpen, Brain, Clock } from "lucide-react";
import { useOptimizedAchievementProgress } from "@/hooks/useOptimizedAchievementProgress";

const OptimizedStudyAchievements = memo(() => {
  const { achievementProgress, loading } = useOptimizedAchievementProgress();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }, (_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const studyMilestones = achievementProgress.filter(achievement => 
    ['Study Streak', 'Week Warrior', 'Study Session Champion'].includes(achievement.title)
  );
  
  const masteryAchievements = achievementProgress.filter(achievement => 
    ['First Steps', 'Century Club', 'Flashcard Master'].includes(achievement.title)
  );
  
  const contentCreation = achievementProgress.filter(achievement => 
    ['Getting Started', 'Goal Crusher'].includes(achievement.title)
  );

  const getAchievementIcon = (title: string) => {
    switch (title) {
      case 'Study Streak':
      case 'Week Warrior':
        return <Flame className="h-6 w-6 text-orange-500" />;
      case 'Study Session Champion':
        return <Clock className="h-6 w-6 text-blue-500" />;
      case 'First Steps':
      case 'Century Club':
        return <Target className="h-6 w-6 text-green-500" />;
      case 'Flashcard Master':
        return <Brain className="h-6 w-6 text-purple-500" />;
      case 'Getting Started':
        return <BookOpen className="h-6 w-6 text-mint-500" />;
      case 'Goal Crusher':
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      default:
        return <Trophy className="h-6 w-6 text-mint-500" />;
    }
  };

  const AchievementCard = memo(({ achievement }: { achievement: any }) => (
    <Card className={`border-2 transition-all hover:shadow-md ${
      achievement.progress === 100 
        ? 'border-mint-200 bg-gradient-to-br from-mint-50 to-mint-100' 
        : 'border-gray-200 hover:border-mint-200'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          {getAchievementIcon(achievement.title)}
          <div className="flex-1">
            <h3 className="font-semibold text-mint-900 mb-1">{achievement.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-mint-600" />
              <span className="text-sm text-mint-700">
                Progress: {achievement.current}/{achievement.target}
              </span>
            </div>
          </div>
          {achievement.progress === 100 && (
            <Badge className="bg-mint-500 text-white">Earned</Badge>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium text-mint-700">{Math.round(achievement.progress)}%</span>
          </div>
          <Progress value={achievement.progress} className="h-2" />
        </div>
        
        {achievement.points > 0 && (
          <div className="mt-3 text-center">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <Trophy className="h-3 w-3 mr-1" />
              {achievement.points} points
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  ));

  const AchievementSection = memo(({ title, achievements, description }: { 
    title: string; 
    achievements: any[]; 
    description: string; 
  }) => {
    if (achievements.length === 0) return null;
    
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-mint-900 mb-1">{title}</h3>
          <p className="text-sm text-mint-600">{description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map(achievement => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </div>
    );
  });

  return (
    <div className="space-y-8">
      {/* Achievement Summary */}
      <Card className="bg-gradient-to-r from-mint-50 to-blue-50 border-mint-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-mint-900">
            <Trophy className="h-6 w-6 text-mint-600" />
            Study Achievements Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-mint-800">
                {achievementProgress.filter(a => a.progress === 100).length}
              </div>
              <p className="text-sm text-mint-600">Earned</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-800">
                {achievementProgress.filter(a => a.progress > 50 && a.progress < 100).length}
              </div>
              <p className="text-sm text-blue-600">In Progress</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">
                {achievementProgress.filter(a => a.progress <= 50).length}
              </div>
              <p className="text-sm text-gray-600">To Start</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-800">
                {achievementProgress.reduce((sum, a) => sum + (a.progress === 100 ? a.points : 0), 0)}
              </div>
              <p className="text-sm text-yellow-600">Total Points</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Categories */}
      <AchievementSection
        title="Study Consistency"
        achievements={studyMilestones}
        description="Achievements for maintaining regular study habits and building streaks"
      />

      <AchievementSection
        title="Content Mastery"
        achievements={masteryAchievements}
        description="Achievements for mastering flashcards and reaching learning milestones"
      />

      <AchievementSection
        title="Content Creation"
        achievements={contentCreation}
        description="Achievements for creating and organizing study materials"
      />

      {achievementProgress.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Achievements Yet</h3>
          <p className="text-gray-600">Start studying to unlock your first achievements!</p>
        </div>
      )}
    </div>
  );
});

OptimizedStudyAchievements.displayName = 'OptimizedStudyAchievements';

export { OptimizedStudyAchievements };
