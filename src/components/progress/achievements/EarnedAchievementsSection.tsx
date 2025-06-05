
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getIcon, getBadgeColor } from "./achievementUtils";

interface Achievement {
  id: string;
  title: string;
  description: string;
  type: string;
  achieved_at: string | null;
  points: number;
  badge_image: string;
}

interface EarnedAchievementsSectionProps {
  achievements: Achievement[];
}

export const EarnedAchievementsSection = ({ achievements }: EarnedAchievementsSectionProps) => {
  if (achievements.length === 0) return null;

  return (
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
  );
};
