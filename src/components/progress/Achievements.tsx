import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Star, BookOpen, Target, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: string;
}

interface UserAchievement {
  id: string;
  achievement_id: string;
  created_at: string;
  achievements: Achievement;
}

export const Achievements = () => {
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!user) return;
      
      setLoading(true);
      
      // For now, we'll use mock data instead of querying non-existent tables
      // This simulates what we would do with real data
      const mockAchievements: UserAchievement[] = [
        {
          id: "1",
          achievement_id: "a1",
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          achievements: {
            id: "a1",
            name: "First Steps",
            description: "Completed your first study session",
            icon: "BookOpen",
            type: "study",
          },
        },
        {
          id: "2",
          achievement_id: "a2",
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
          achievements: {
            id: "a2",
            name: "Flashcard Master",
            description: "Created 10 flashcard sets",
            icon: "Award",
            type: "flashcard",
          },
        },
        {
          id: "3",
          achievement_id: "a3",
          created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
          achievements: {
            id: "a3",
            name: "Goal Crusher",
            description: "Completed 5 study goals",
            icon: "Target",
            type: "goal",
          },
        },
      ];
      
      setAchievements(mockAchievements);
      setLoading(false);
    };

    fetchAchievements();
  }, [user]);

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
      case "note":
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
                  {getIcon(achievement.achievements.icon)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{achievement.achievements.name}</h3>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(achievement.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {achievement.achievements.description}
                  </p>
                  <Badge
                    variant="outline"
                    className={`mt-2 ${getBadgeColor(achievement.achievements.type)}`}
                  >
                    {achievement.achievements.type}
                  </Badge>
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

// Also keep the default export for backward compatibility
export default Achievements;
