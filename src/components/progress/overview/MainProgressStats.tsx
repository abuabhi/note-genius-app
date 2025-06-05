
import { ChartPie, ChartBar, Zap } from "lucide-react";
import StatsCard from "./StatsCard";
import { useAuth } from "@/contexts/auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  const { user } = useAuth();

  // Get real quiz data
  const { data: quizStats = { completed: 0, total: 0 } } = useQuery({
    queryKey: ['quiz-stats', user?.id],
    queryFn: async () => {
      if (!user) return { completed: 0, total: 0 };

      const [{ data: results }, { data: quizzes }] = await Promise.all([
        supabase
          .from('quiz_results')
          .select('id')
          .eq('user_id', user.id),
        supabase
          .from('quizzes')
          .select('id')
      ]);

      return {
        completed: results?.length || 0,
        total: quizzes?.length || 0
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Course Progress"
        value={`${stats.completedCourses}/${stats.totalCourses}`}
        progress={stats.totalCourses > 0 ? (stats.completedCourses / stats.totalCourses) * 100 : 0}
        icon={ChartPie}
        subtitle="Feature coming soon"
      />

      <StatsCard
        title="Quiz Performance"
        value={`${quizStats.completed}/${quizStats.total}`}
        progress={quizStats.total > 0 ? (quizStats.completed / quizStats.total) * 100 : 0}
        icon={ChartBar}
        subtitle={quizStats.total === 0 ? "No quizzes available yet" : undefined}
      />

      <StatsCard
        title="Flashcard Accuracy"
        value={`${stats.flashcardAccuracy}%`}
        progress={stats.flashcardAccuracy}
        icon={ChartPie}
        subtitle="Based on recent reviews"
      />

      <StatsCard
        title="Current Streak"
        value={`${stats.streakDays} days`}
        progress={Math.min((stats.streakDays / 30) * 100, 100)}
        icon={Zap}
        subtitle="Consecutive study days"
      />
    </div>
  );
};

export default MainProgressStats;
