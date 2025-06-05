
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Star, BookOpen, Target, Calendar, Zap, Gift } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAchievements } from "@/hooks/useAchievements";
import { useAchievementProgress } from "@/hooks/useAchievementProgress";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Achievements = () => {
  const { user } = useAuth();
  const { achievements, loading, checkAndAwardAchievements } = useAchievements();
  const { achievementProgress, loading: progressLoading, refreshProgress } = useAchievementProgress();

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

  const handleCheckProgress = async () => {
    await checkAndAwardAchievements();
    await refreshProgress();
  };

  const totalPoints = achievements.reduce((sum, achievement) => sum + achievement.points, 0);
  const recentAchievements = achievements.filter(a => a.achieved_at).slice(0, 3);

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
                <p className="text-sm font-medium text-green-800">Available</p>
                <p className="text-2xl font-bold text-green-900">{achievementProgress.length}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Available Achievements with Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Achievement Progress
            </CardTitle>
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleCheckProgress}
              disabled={loading || progressLoading}
            >
              Check Progress
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {progressLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : achievementProgress.length > 0 ? (
            achievementProgress.map((achievement) => (
              <div key={achievement.id} className="space-y-3 p-4 rounded-lg border bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                      {getIcon(achievement.badge_image)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
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
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{Math.round(achievement.progress)}%</div>
                    <div className="text-xs text-muted-foreground">
                      {achievement.current}/{achievement.target}
                    </div>
                  </div>
                </div>
                <Progress value={achievement.progress} className="h-2" />
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <Trophy className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                All available achievements completed! Great job!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Earned Achievements */}
      {achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Your Achievements ({achievements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-start gap-3 p-4 rounded-lg border-2 bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-200">
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
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        ✓ Earned
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State for New Users */}
      {achievements.length === 0 && achievementProgress.length === 0 && !loading && !progressLoading && (
        <div className="text-center py-8">
          <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Start Your Journey!</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Begin studying to unlock achievements and track your progress!
          </p>
          <Button onClick={checkAndAwardAchievements}>
            Check for Achievements
          </Button>
        </div>
      )}
    </div>
  );
};

export default Achievements;
