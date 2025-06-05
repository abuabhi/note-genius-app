
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Star, Trophy } from "lucide-react";
import { getIcon, getBadgeColor } from "./achievementUtils";

interface AchievementProgress {
  id: string;
  title: string;
  description: string;
  type: string;
  points: number;
  badge_image: string;
  progress: number;
  current: number;
  target: number;
}

interface AchievementProgressSectionProps {
  achievementProgress: AchievementProgress[];
  loading: boolean;
  progressLoading: boolean;
  onCheckProgress: () => Promise<void>;
}

export const AchievementProgressSection = ({ 
  achievementProgress, 
  loading, 
  progressLoading, 
  onCheckProgress 
}: AchievementProgressSectionProps) => {
  console.log('=== AchievementProgressSection RENDER ===');
  console.log('Props received:', { 
    achievementProgressLength: achievementProgress?.length || 0, 
    loading, 
    progressLoading,
    achievementProgress: achievementProgress?.slice(0, 2) // Show first 2 for debugging
  });

  const hasAchievements = achievementProgress && achievementProgress.length > 0;
  console.log('hasAchievements:', hasAchievements);
  console.log('Will show loading:', progressLoading);
  console.log('Will show achievements:', !progressLoading && hasAchievements);
  console.log('Will show empty state:', !progressLoading && !hasAchievements);

  return (
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
            onClick={onCheckProgress}
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
        ) : hasAchievements ? (
          <>
            {console.log('Rendering', achievementProgress.length, 'achievements')}
            {achievementProgress.map((achievement) => (
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
                        {achievement.progress === 100 && (
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            ✓ Completed
                          </Badge>
                        )}
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
            ))}
          </>
        ) : (
          <div className="text-center py-4">
            <Trophy className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No achievement templates found in the database. Check if achievement templates are properly set up.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
