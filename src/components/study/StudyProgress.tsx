
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, Calendar, Zap, Star } from "lucide-react";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { useAuth } from "@/contexts/auth";
import { useStreakCalculation } from "@/hooks/useStreakCalculation";
import { useProgressStats } from "@/hooks/useProgressStats";
import { useAchievements } from "@/hooks/useAchievements";

export const StudyProgress = () => {
  const { currentSet } = useFlashcards();
  const { user } = useAuth();
  const { streak, loading: streakLoading } = useStreakCalculation();
  const { stats, isLoading: statsLoading } = useProgressStats();
  const { achievements, loading: achievementsLoading, checkAndAwardAchievements } = useAchievements();

  // Check for new achievements when component loads or stats change
  useEffect(() => {
    if (user && !statsLoading) {
      checkAndAwardAchievements();
    }
  }, [user, statsLoading, checkAndAwardAchievements]);

  // Show loading state only on initial load
  if (streakLoading || statsLoading || achievementsLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Study Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate mastery percentage based on current set
  const masteryPercent = currentSet?.card_count ? 
    Math.min(100, (stats.totalCardsMastered / currentSet.card_count) * 100) : 0;

  // Get recent achievements for display (last 3)
  const recentAchievements = achievements.slice(0, 3);
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-500" />
            <span className="text-2xl font-bold">{streak} days</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Cards Mastered</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>{stats.totalCardsMastered} cards</span>
              <span>{Math.round(masteryPercent)}%</span>
            </div>
            <Progress value={masteryPercent} />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Recent Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          {recentAchievements.length > 0 ? (
            <div className="space-y-2">
              {recentAchievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-2 text-sm">
                  <div className="rounded-full bg-primary/20 p-1">
                    {achievement.badge_image === 'Award' && <Award className="h-3 w-3 text-primary" />}
                    {achievement.badge_image === 'Calendar' && <Calendar className="h-3 w-3 text-primary" />}
                    {achievement.badge_image === 'Star' && <Star className="h-3 w-3 text-primary" />}
                    {achievement.badge_image === 'Zap' && <Zap className="h-3 w-3 text-primary" />}
                    {!['Award', 'Calendar', 'Star', 'Zap'].includes(achievement.badge_image) && 
                      <Award className="h-3 w-3 text-primary" />}
                  </div>
                  <span className="text-xs font-medium">{achievement.title}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <Award className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">
                Start studying to earn achievements!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
