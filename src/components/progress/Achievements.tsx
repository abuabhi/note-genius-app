
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Star, Clock, Zap, Calendar, BookOpen, Trophy } from "lucide-react";

export const Achievements = () => {
  // This would be fetched from the API in a real app
  const achievementsList = [
    {
      id: "first-set",
      name: "First Flashcard Set",
      description: "Created your first flashcard set",
      icon: BookOpen,
      earned: true,
      earnedDate: "2023-11-15",
    },
    {
      id: "first-quiz",
      name: "Quiz Master",
      description: "Complete your first quiz with 100% accuracy",
      icon: Star,
      earned: true,
      earnedDate: "2023-11-16",
    },
    {
      id: "streak-3",
      name: "3-Day Streak",
      description: "Study flashcards for 3 days in a row",
      icon: Zap,
      earned: true,
      earnedDate: "2023-11-18",
    },
    {
      id: "streak-7",
      name: "Weekly Warrior",
      description: "Study flashcards for 7 days in a row",
      icon: Zap,
      earned: true,
      earnedDate: "2023-11-22",
    },
    {
      id: "streak-30",
      name: "Monthly Master",
      description: "Study flashcards for 30 days in a row",
      icon: Calendar,
      earned: false,
      progress: 22,
    },
    {
      id: "cards-50",
      name: "Card Collector",
      description: "Create 50 flashcards",
      icon: BookOpen,
      earned: true,
      earnedDate: "2023-12-01",
    },
    {
      id: "cards-100",
      name: "Flashcard Century",
      description: "Create 100 flashcards",
      icon: BookOpen,
      earned: false,
      progress: 68,
    },
    {
      id: "study-1h",
      name: "Focus Time",
      description: "Study for 1 hour in a single session",
      icon: Clock,
      earned: false,
      progress: 42,
    },
    {
      id: "perfect-recall",
      name: "Perfect Recall",
      description: "Review 20 cards with perfect recall",
      icon: Trophy,
      earned: false,
      progress: 12,
    },
  ];

  // Separate earned from unearned achievements
  const earnedAchievements = achievementsList.filter(a => a.earned);
  const unearnedAchievements = achievementsList.filter(a => !a.earned);
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Your Achievements</h2>
        <p className="text-muted-foreground">
          You've earned {earnedAchievements.length} out of {achievementsList.length} achievements
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Earned Achievements</CardTitle>
          <CardDescription>
            Achievements you've already unlocked
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {earnedAchievements.map(achievement => (
              <Card key={achievement.id} className="border-green-200 bg-green-50 dark:bg-green-900/20">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 dark:bg-green-700 p-2 rounded-full">
                      <achievement.icon className="h-6 w-6 text-green-700 dark:text-green-300" />
                    </div>
                    <div>
                      <h3 className="font-medium">{achievement.name}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      <div className="mt-2 flex items-center">
                        <Badge variant="outline" className="text-xs bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                          <Award className="mr-1 h-3 w-3" />
                          Earned
                        </Badge>
                        <span className="text-xs ml-2 text-muted-foreground">
                          {new Date(achievement.earnedDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Achievements In Progress</CardTitle>
          <CardDescription>
            Keep studying to unlock these achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {unearnedAchievements.map(achievement => (
              <Card key={achievement.id} className="border-muted">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-muted p-2 rounded-full">
                      <achievement.icon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium">{achievement.name}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      <div className="mt-2 space-y-1">
                        <div className="text-xs text-muted-foreground flex justify-between">
                          <span>Progress</span>
                          <span>{achievement.progress}%</span>
                        </div>
                        <Progress value={achievement.progress} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
