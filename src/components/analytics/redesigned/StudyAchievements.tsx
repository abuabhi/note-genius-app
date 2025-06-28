
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Flame, Star, Award, BookOpen, Brain, Zap } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useUltraSimpleAnalytics } from "@/hooks/useUltraSimpleAnalytics";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  target: number;
  unlocked: boolean;
  category: 'streak' | 'study_time' | 'mastery' | 'consistency';
  color: string;
}

export const StudyAchievements = () => {
  const { user } = useAuth();
  const { analytics } = useUltraSimpleAnalytics();

  // Calculate achievements based on real analytics data
  const achievements: Achievement[] = [
    // Streak Achievements
    {
      id: 'streak_3',
      title: 'Getting Started',
      description: 'Study for 3 days in a row',
      icon: <Flame className="h-5 w-5" />,
      progress: Math.min(analytics.streakDays, 3),
      target: 3,
      unlocked: analytics.streakDays >= 3,
      category: 'streak',
      color: 'text-orange-600'
    },
    {
      id: 'streak_7',
      title: 'Week Warrior',
      description: 'Maintain a 7-day study streak',
      icon: <Flame className="h-5 w-5" />,
      progress: Math.min(analytics.streakDays, 7),
      target: 7,
      unlocked: analytics.streakDays >= 7,
      category: 'streak',
      color: 'text-orange-600'
    },
    {
      id: 'streak_30',
      title: 'Monthly Master',
      description: 'Study every day for a month',
      icon: <Flame className="h-5 w-5" />,
      progress: Math.min(analytics.streakDays, 30),
      target: 30,
      unlocked: analytics.streakDays >= 30,
      category: 'streak',
      color: 'text-orange-600'
    },

    // Study Time Achievements
    {
      id: 'time_10',
      title: 'Time Keeper',
      description: 'Study for 10 total hours',
      icon: <Clock className="h-5 w-5" />,
      progress: Math.min(analytics.totalStudyTime, 10),
      target: 10,
      unlocked: analytics.totalStudyTime >= 10,
      category: 'study_time',
      color: 'text-blue-600'
    },
    {
      id: 'time_50',
      title: 'Dedicated Scholar',
      description: 'Accumulate 50 hours of study time',
      icon: <Clock className="h-5 w-5" />,
      progress: Math.min(analytics.totalStudyTime, 50),
      target: 50,
      unlocked: analytics.totalStudyTime >= 50,
      category: 'study_time',
      color: 'text-blue-600'
    },
    {
      id: 'time_100',
      title: 'Century Scholar',
      description: 'Reach 100 hours of total study time',
      icon: <Award className="h-5 w-5" />,
      progress: Math.min(analytics.totalStudyTime, 100),
      target: 100,
      unlocked: analytics.totalStudyTime >= 100,
      category: 'study_time',
      color: 'text-purple-600'
    },

    // Mastery Achievements
    {
      id: 'cards_100',
      title: 'Card Collector',
      description: 'Master 100 flashcards',
      icon: <Brain className="h-5 w-5" />,
      progress: Math.min(analytics.totalCardsMastered, 100),
      target: 100,
      unlocked: analytics.totalCardsMastered >= 100,
      category: 'mastery',
      color: 'text-mint-600'
    },
    {
      id: 'accuracy_90',
      title: 'Precision Master',
      description: 'Achieve 90%+ accuracy',
      icon: <Target className="h-5 w-5" />,
      progress: Math.min(analytics.flashcardAccuracy, 90),
      target: 90,
      unlocked: analytics.flashcardAccuracy >= 90,
      category: 'mastery',
      color: 'text-green-600'
    },

    // Consistency Achievements
    {
      id: 'sessions_20',
      title: 'Session Starter',
      description: 'Complete 20 study sessions',
      icon: <BookOpen className="h-5 w-5" />,
      progress: Math.min(analytics.totalSessions, 20),
      target: 20,
      unlocked: analytics.totalSessions >= 20,
      category: 'consistency',
      color: 'text-indigo-600'
    }
  ];

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const nextAchievements = achievements.filter(a => !a.unlocked).slice(0, 3);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'streak': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'study_time': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'mastery': return 'bg-mint-100 text-mint-800 border-mint-200';
      case 'consistency': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Achievement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-800">{unlockedAchievements.length}</div>
            <p className="text-sm text-yellow-600">Unlocked</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-mint-50 to-mint-100 border-mint-200">
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 text-mint-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-mint-800">{achievements.length - unlockedAchievements.length}</div>
            <p className="text-sm text-mint-600">In Progress</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4 text-center">
            <Flame className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-800">{analytics.streakDays}</div>
            <p className="text-sm text-orange-600">Current Streak</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-800">
              {Math.round((unlockedAchievements.length / achievements.length) * 100)}%
            </div>
            <p className="text-sm text-purple-600">Complete</p>
          </CardContent>
        </Card>
      </div>

      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <Card className="border-mint-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-mint-800 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Unlocked Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unlockedAchievements.map((achievement) => (
                <div key={achievement.id} className="relative p-4 bg-gradient-to-br from-yellow-50 to-gold-50 rounded-lg border border-yellow-200 shadow-sm">
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-yellow-500 text-white text-xs">
                      ✓ Unlocked
                    </Badge>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-white ${achievement.color}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{achievement.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                      <Badge variant="outline" className={getCategoryColor(achievement.category)}>
                        {achievement.category.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Achievements */}
      <Card className="border-mint-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-mint-800 flex items-center gap-2">
            <Target className="h-5 w-5 text-mint-600" />
            Next Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {nextAchievements.map((achievement) => (
              <div key={achievement.id} className="p-4 bg-mint-50 rounded-lg border border-mint-200">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg bg-white ${achievement.color}`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                      <Badge variant="outline" className={getCategoryColor(achievement.category)}>
                        {achievement.category.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium text-mint-700">
                          {achievement.progress} / {achievement.target}
                        </span>
                      </div>
                      <Progress 
                        value={(achievement.progress / achievement.target) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {nextAchievements.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>All achievements unlocked! 🎉</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
