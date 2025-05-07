
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award } from "lucide-react";

// Mock data - in a real app, this would come from an API
const achievements = [
  {
    id: 1,
    title: "Quiz Master",
    description: "Complete 10 quizzes with a score of 90% or higher",
    progress: 70,
    current: 7,
    target: 10,
    icon: "🏆"
  },
  {
    id: 2,
    title: "Speed Demon",
    description: "Complete a quiz in under 60 seconds",
    progress: 100,
    current: 1,
    target: 1,
    completed: true,
    icon: "⚡"
  },
  {
    id: 3,
    title: "Perfect Score",
    description: "Get a perfect score on any quiz",
    progress: 0,
    current: 0,
    target: 1,
    icon: "🎯"
  },
  {
    id: 4,
    title: "Weekly Warrior",
    description: "Complete at least one quiz every day for a week",
    progress: 71,
    current: 5,
    target: 7,
    icon: "🗓️"
  }
];

const QuizAchievements = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Award className="h-5 w-5 mr-2" />
          Achievements
        </CardTitle>
        <CardDescription>
          Track your progress and earn badges
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="flex items-center">
              <div className="mr-4 text-2xl">{achievement.icon}</div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center">
                  <p className="text-sm font-medium leading-none">
                    {achievement.title}
                  </p>
                  {achievement.completed && (
                    <span className="ml-2 inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      Completed
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {achievement.description}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <Progress value={achievement.progress} className="h-2" />
                  <span className="ml-2 text-xs text-muted-foreground">
                    {achievement.current}/{achievement.target}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizAchievements;
