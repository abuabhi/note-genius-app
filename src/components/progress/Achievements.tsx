
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Star, BookOpen, Target, Calendar, Zap, Gift } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAchievements } from "@/hooks/useAchievements";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Achievements = () => {
  const { user } = useAuth();
  const { achievements, loading, checkAndAwardAchievements } = useAchievements();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Trophy":
        return <Trophy className="h-5 w-5" />;
      case "Award":
        return <Award className="h-5 w-5" />;
      case "Star":
        return <Star className="h-5 w-5" />;
      case "BookOpen":
        return <BookOpen className="h-5 w-5" />;
      case "Target":
        return <Target className="h-5 w-5" />;
      case "Calendar":
        return <Calendar className="h-5 w-5" />;
      case "Zap":
        return <Zap className="h-5 w-5" />;
      case "Gift":
        return <Gift className="h-5 w-5" />;
      default:
        return <Award className="h-5 w-5" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "study":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "flashcard":
        return "bg-green-100 text-green-800 border-green-300";
      case "goal":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "streak":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const totalPoints = achievements.reduce((sum, achievement) => sum + achievement.points, 0);
  const recentAchievements = achievements.filter(a => a.achieved_at).slice(0, 3);

  // Mock progress towards next achievements
  const nextAchievements = [
    { title: "Study Marathon", description: "Complete 50 study sessions", progress: 75, target: 50 },
    { title: "Flashcard Expert", description: "Master 500 flashcards", progress: 40, target: 500 },
    { title: "Goal Setter", description: "Create 10 study goals", progress: 60, target: 10 }
  ];

  return (
    <div className="space-y-6">
      {/* Achievement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-800">Total Points</p>
                <p className="text-2xl font-bold text-yellow-900">{totalPoints}</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">Achievements</p>
                <p className="text-2xl font-bold text-purple-900">{achievements.length}</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Recent</p>
                <p className="text-2xl font-bold text-green-900">{recentAchievements.length}</p>
              </div>
              <Star className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Towards Next Achievements */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Progress Towards Next Achievements
            </CardTitle>
            <Button 
              size="sm" 
              variant="outline"
              onClick={checkAndAwardAchievements}
            >
              Check Progress
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {nextAchievements.map((achievement, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{achievement.title}</h4>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{achievement.progress}%</div>
                  <div className="text-xs text-muted-foreground">
                    {Math.floor(achievement.target * achievement.progress / 100)}/{achievement.target}
                  </div>
                </div>
              </div>
              <Progress value={achievement.progress} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Earned Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Your Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <p>Loading achievements...</p>
            </div>
          ) : achievements.length > 0 ? (
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 ${
                    achievement.achieved_at 
                      ? "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200" 
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    achievement.achieved_at ? "bg-yellow-200" : "bg-gray-200"
                  }`}>
                    {getIcon(achievement.badge_image)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{achievement.title}</h3>
                      {achievement.achieved_at && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(achievement.achieved_at), {
                            addSuffix: true,
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {achievement.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="outline"
                        className={getBadgeColor(achievement.type)}
                      >
                        {achievement.type}
                      </Badge>
                      <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                        <Star className="h-3 w-3 mr-1" />
                        {achievement.points} pts
                      </Badge>
                      {achievement.achieved_at && (
                        <Badge className="bg-green-100 text-green-800 border-green-300">
                          ✓ Earned
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Start Your Journey!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Begin studying to unlock your first achievements and earn points!
              </p>
              <Button onClick={checkAndAwardAchievements}>
                Check for Achievements
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Achievements;
