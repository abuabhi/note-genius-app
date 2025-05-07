
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent
} from "@/components/ui/chart";
import { 
  Bar, 
  BarChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Tooltip,
  Legend,
  Line,
  LineChart 
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { isPremiumTier } from "@/utils/premiumFeatures";

// Mock data - in a real app, this would come from an API
const mockProgressData = [
  { date: 'Mon', score: 65, avgTime: 45, quizzesCompleted: 1 },
  { date: 'Tue', score: 70, avgTime: 42, quizzesCompleted: 2 },
  { date: 'Wed', score: 0, avgTime: 0, quizzesCompleted: 0 }, // No quizzes taken
  { date: 'Thu', score: 75, avgTime: 38, quizzesCompleted: 1 },
  { date: 'Fri', score: 85, avgTime: 35, quizzesCompleted: 2 },
  { date: 'Sat', score: 90, avgTime: 30, quizzesCompleted: 3 },
  { date: 'Sun', score: 80, avgTime: 33, quizzesCompleted: 2 },
];

// Mock data for subject performance
const mockSubjectData = [
  { subject: 'Math', score: 85, quizzesCompleted: 5, strength: 'high' },
  { subject: 'Geography', score: 70, quizzesCompleted: 3, strength: 'medium' },
  { subject: 'History', score: 60, quizzesCompleted: 2, strength: 'medium' },
  { subject: 'Science', score: 90, quizzesCompleted: 4, strength: 'high' },
];

const QuizProgressChart = () => {
  const { userProfile } = useRequireAuth();
  const isPremium = isPremiumTier(userProfile?.user_tier);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly">
          <TabsList>
            <TabsTrigger value="weekly">Weekly Progress</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            {isPremium && <TabsTrigger value="learning">Learning Curve</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="weekly" className="pt-4">
            <ChartContainer 
              config={{
                score: {
                  label: 'Score',
                  theme: { light: '#10b981', dark: '#10b981' }
                },
                quizzesCompleted: {
                  label: 'Quizzes Completed',
                  theme: { light: '#6366f1', dark: '#818cf8' }
                }
              }}
              className="h-[300px]"
            >
              <BarChart data={mockProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" orientation="left" stroke="#10b981" />
                <YAxis yAxisId="right" orientation="right" stroke="#6366f1" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="score" name="Score" yAxisId="left" fill="#10b981" />
                <Bar dataKey="quizzesCompleted" name="Quizzes Completed" yAxisId="right" fill="#6366f1" />
              </BarChart>
            </ChartContainer>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Your quiz scores and activity throughout the week
            </p>
          </TabsContent>
          
          <TabsContent value="subjects" className="pt-4">
            <ChartContainer 
              config={{
                score: {
                  label: 'Score',
                  theme: { light: '#f59e0b', dark: '#fbbf24' }
                },
                quizzesCompleted: {
                  label: 'Quizzes Completed',
                  theme: { light: '#8b5cf6', dark: '#a78bfa' }
                }
              }}
              className="h-[300px]"
            >
              <BarChart data={mockSubjectData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="score" name="Average Score" fill="#f59e0b" />
                <Bar dataKey="quizzesCompleted" name="Quizzes Completed" fill="#8b5cf6" />
              </BarChart>
            </ChartContainer>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Your performance across different subjects
            </p>
          </TabsContent>
          
          {isPremium && (
            <TabsContent value="learning" className="pt-4">
              <ChartContainer 
                config={{
                  avgTime: {
                    label: 'Avg. Time (sec)',
                    theme: { light: '#ec4899', dark: '#f472b6' }
                  },
                  score: {
                    label: 'Score',
                    theme: { light: '#06b6d4', dark: '#22d3ee' }
                  }
                }}
                className="h-[300px]"
              >
                <LineChart data={mockProgressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" orientation="left" stroke="#06b6d4" />
                  <YAxis yAxisId="right" orientation="right" stroke="#ec4899" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line type="monotone" yAxisId="left" dataKey="score" name="Score Trend" stroke="#06b6d4" activeDot={{ r: 8 }} />
                  <Line type="monotone" yAxisId="right" dataKey="avgTime" name="Response Time" stroke="#ec4899" />
                </LineChart>
              </ChartContainer>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Your learning curve shows improving scores and decreasing response times
              </p>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default QuizProgressChart;
