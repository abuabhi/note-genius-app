
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChartPie, ChartBar } from "lucide-react";

const ProgressOverview = () => {
  // Mock data - in a real app, this would come from an API
  const progressData = {
    completedCourses: 8,
    totalCourses: 12,
    completedQuizzes: 24,
    totalQuizzes: 30,
    flashcardAccuracy: 85,
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Course Progress</CardTitle>
          <ChartPie className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-2xl font-bold">
              {progressData.completedCourses}/{progressData.totalCourses}
            </p>
            <Progress value={(progressData.completedCourses / progressData.totalCourses) * 100} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Quiz Performance</CardTitle>
          <ChartBar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-2xl font-bold">
              {progressData.completedQuizzes}/{progressData.totalQuizzes}
            </p>
            <Progress value={(progressData.completedQuizzes / progressData.totalQuizzes) * 100} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Flashcard Accuracy</CardTitle>
          <ChartPie className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-2xl font-bold">{progressData.flashcardAccuracy}%</p>
            <Progress value={progressData.flashcardAccuracy} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressOverview;
