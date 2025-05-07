
import { ChartPie, ChartBar, Zap } from "lucide-react";
import StatsCard from "./StatsCard";

interface ProgressStats {
  completedCourses: number;
  totalCourses: number;
  completedQuizzes: number;
  totalQuizzes: number;
  flashcardAccuracy: number;
  streakDays: number;
}

interface MainProgressStatsProps {
  stats: ProgressStats;
}

const MainProgressStats = ({ stats }: MainProgressStatsProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Course Progress"
        value={`${stats.completedCourses}/${stats.totalCourses}`}
        progress={(stats.completedCourses / stats.totalCourses) * 100}
        icon={ChartPie}
      />

      <StatsCard
        title="Quiz Performance"
        value={`${stats.completedQuizzes}/${stats.totalQuizzes}`}
        progress={(stats.completedQuizzes / stats.totalQuizzes) * 100}
        icon={ChartBar}
      />

      <StatsCard
        title="Flashcard Accuracy"
        value={`${stats.flashcardAccuracy}%`}
        progress={stats.flashcardAccuracy}
        icon={ChartPie}
      />

      <StatsCard
        title="Current Streak"
        value={`${stats.streakDays} days`}
        progress={(stats.streakDays / 30) * 100}
        icon={Zap}
      />
    </div>
  );
};

export default MainProgressStats;
