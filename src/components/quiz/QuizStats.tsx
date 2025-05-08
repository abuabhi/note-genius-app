
import { useQuizzes, useQuizResults } from "@/hooks/useQuizzes";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpenCheck, Award, Clock, BrainCircuit } from "lucide-react";

const QuizStats = () => {
  const { quizzes, isLoading: loadingQuizzes } = useQuizzes();
  const { data: quizResults, isLoading: loadingResults } = useQuizResults();
  
  // Calculate stats
  const totalQuizzes = quizzes?.length || 0;
  const totalCompleted = quizResults?.length || 0;
  
  let avgScore = 0;
  let totalTimeTaken = 0;
  
  if (quizResults?.length) {
    // Calculate average score as percentage
    avgScore = Math.round(
      quizResults.reduce((acc, result) => {
        return acc + ((result.score / result.total_questions) * 100);
      }, 0) / quizResults.length
    );
    
    // Calculate total time spent on quizzes in minutes
    totalTimeTaken = Math.round(
      quizResults.reduce((acc, result) => {
        return acc + (result.duration_seconds || 0);
      }, 0) / 60
    );
  }
  
  const isLoading = loadingQuizzes || loadingResults;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<BookOpenCheck className="h-5 w-5" />}
        label="Available Quizzes"
        value={isLoading ? "-" : totalQuizzes.toString()}
        color="text-blue-600 bg-blue-100 dark:bg-blue-950 dark:text-blue-300"
      />
      
      <StatCard
        icon={<BrainCircuit className="h-5 w-5" />}
        label="Quizzes Completed"
        value={isLoading ? "-" : totalCompleted.toString()}
        color="text-purple-600 bg-purple-100 dark:bg-purple-950 dark:text-purple-300"
      />
      
      <StatCard
        icon={<Award className="h-5 w-5" />}
        label="Avg. Score"
        value={isLoading ? "-" : `${avgScore}%`}
        color="text-green-600 bg-green-100 dark:bg-green-950 dark:text-green-300"
      />
      
      <StatCard
        icon={<Clock className="h-5 w-5" />}
        label="Total Time"
        value={isLoading ? "-" : `${totalTimeTaken} min`}
        color="text-amber-600 bg-amber-100 dark:bg-amber-950 dark:text-amber-300"
      />
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

const StatCard = ({ icon, label, value, color }: StatCardProps) => {
  return (
    <Card>
      <CardContent className="p-6 flex items-start gap-4">
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizStats;
