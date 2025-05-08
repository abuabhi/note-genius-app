
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { useQuizResults } from "@/hooks/useQuizzes";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const QuizProgressChart = () => {
  const { data: quizResults, isLoading } = useQuizResults();
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (!quizResults?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz Progress</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">
            You haven't completed any quizzes yet. Take some quizzes to see your progress!
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Process data for score over time chart
  const scoreData = quizResults.map((result) => {
    const date = new Date(result.completed_at);
    return {
      name: `${date.getMonth() + 1}/${date.getDate()}`,
      score: Math.round((result.score / result.total_questions) * 100),
      quiz: result.quiz?.title || 'Untitled Quiz',
    };
  }).reverse();
  
  // Process data for subjects performance
  const subjectPerformance: Record<string, { total: number; correct: number }> = {};
  quizResults.forEach((result) => {
    const quizTitle = result.quiz?.title || 'Other';
    if (!subjectPerformance[quizTitle]) {
      subjectPerformance[quizTitle] = { total: 0, correct: 0 };
    }
    subjectPerformance[quizTitle].total += result.total_questions;
    subjectPerformance[quizTitle].correct += result.score;
  });
  
  const subjectData = Object.entries(subjectPerformance).map(([subject, data]) => ({
    name: subject,
    percentage: Math.round((data.correct / data.total) * 100),
    correct: data.correct,
    total: data.total,
  }));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="scores">
          <TabsList className="mb-4">
            <TabsTrigger value="scores">Progress Over Time</TabsTrigger>
            <TabsTrigger value="subjects">Performance by Quiz</TabsTrigger>
          </TabsList>
          
          <TabsContent value="scores">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Score']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    activeDot={{ r: 8 }}
                    name="Quiz Score (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Chart shows your quiz scores over time. Hover for details.
            </p>
          </TabsContent>
          
          <TabsContent value="subjects">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'percentage') return [`${value}%`, 'Score'];
                      return [value, name];
                    }}
                    labelFormatter={(label) => `Quiz: ${label}`}
                  />
                  <Legend />
                  <Bar
                    dataKey="percentage"
                    fill="#3b82f6"
                    name="Score (%)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Chart shows your performance across different quizzes.
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default QuizProgressChart;
