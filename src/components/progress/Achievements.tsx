
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Star, BookOpen, Target, Calendar, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAchievements } from "@/hooks/useAchievements";

export const Achievements = () => {
  const { user } = useAuth();
  const { achievements, loading } = useAchievements();

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
      default:
        return <Award className="h-5 w-5" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "study":
        return "bg-blue-100 text-blue-800";
      case "flashcard":
        return "bg-green-100 text-green-800";
      case "goal":
        return "bg-purple-100 text-purple-800";
      case "streak":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span>Achievements</span>
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
                className="flex items-start gap-3 border-b pb-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
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
                  <p className="text-sm text-muted-foreground">
                    {achievement.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className={`${getBadgeColor(achievement.type)}`}
                    >
                      {achievement.type}
                    </Badge>
                    <Badge variant="outline" className="bg-orange-100 text-orange-800">
                      {achievement.points} pts
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Award className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-2 font-semibold">No achievements yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Start studying to earn achievements
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Achievements;
