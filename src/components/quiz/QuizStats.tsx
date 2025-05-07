
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Clock, BookOpen, BrainCircuit } from "lucide-react";

// Mock data - in a real app, this would come from an API
const stats = {
  totalQuizzesTaken: 24,
  avgScore: 78,
  totalTimeMins: 145,
  streak: 5
};

const QuizStats = () => {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Quizzes
          </CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalQuizzesTaken}</div>
          <p className="text-xs text-muted-foreground">
            Quizzes completed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Average Score
          </CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.avgScore}%</div>
          <p className="text-xs text-muted-foreground">
            Across all quizzes
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Study Time
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalTimeMins} mins</div>
          <p className="text-xs text-muted-foreground">
            Total quiz time
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Current Streak
          </CardTitle>
          <BrainCircuit className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.streak} days</div>
          <p className="text-xs text-muted-foreground">
            Keep it going!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizStats;
