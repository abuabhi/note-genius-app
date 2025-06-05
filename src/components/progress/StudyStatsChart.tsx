
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { useUnifiedStudyStats } from "@/hooks/useUnifiedStudyStats";

export const StudyStatsChart = () => {
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90">("7");
  const { user } = useAuth();
  const { stats } = useUnifiedStudyStats();
  
  const { data: chartData = [], isLoading } = useQuery({
    queryKey: ['study-stats-chart', user?.id, timeRange],
    queryFn: async () => {
      if (!user) return [];

      const days = parseInt(timeRange);
      const data = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const currentDate = subDays(new Date(), i);
        const startOfCurrentDay = startOfDay(currentDate);
        const endOfCurrentDay = endOfDay(currentDate);
        
        // Get flashcard reviews for this day
        const { data: dayReviews } = await supabase
          .from('user_flashcard_progress')
          .select('last_score')
          .eq('user_id', user.id)
          .gte('last_reviewed_at', startOfCurrentDay.toISOString())
          .lte('last_reviewed_at', endOfCurrentDay.toISOString());

        const cardsStudied = dayReviews?.length || 0;
        const cardsLearned = dayReviews?.filter(review => (review.last_score || 0) >= 4).length || 0;
        
        // Calculate accuracy rate for the day
        let accuracyRate = 0;
        if (dayReviews && dayReviews.length > 0) {
          const totalScore = dayReviews.reduce((sum, review) => sum + (review.last_score || 0), 0);
          accuracyRate = Math.round((totalScore / (dayReviews.length * 5)) * 100);
        }
        
        data.push({
          date: format(currentDate, "MMM d"),
          cardsStudied,
          cardsLearned,
          accuracyRate
        });
      }
      
      return data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: periodStats = {
    totalStudyTime: 0,
    accuracyRate: 0,
    cardsMastered: 0
  } } = useQuery({
    queryKey: ['period-stats', user?.id, timeRange],
    queryFn: async () => {
      if (!user) return { totalStudyTime: 0, accuracyRate: 0, cardsMastered: 0 };

      const days = parseInt(timeRange);
      const startDate = subDays(new Date(), days);

      // Get study sessions for the period
      const { data: sessions } = await supabase
        .from('study_sessions')
        .select('duration')
        .eq('user_id', user.id)
        .gte('start_time', startDate.toISOString())
        .not('duration', 'is', null);

      // Get flashcard progress for the period
      const { data: progress } = await supabase
        .from('user_flashcard_progress')
        .select('last_score, ease_factor, interval')
        .eq('user_id', user.id)
        .gte('last_reviewed_at', startDate.toISOString());

      const totalMinutes = sessions?.reduce((sum, session) => sum + (session.duration || 0), 0) || 0;
      const totalStudyTime = Math.round(totalMinutes / 60 * 10) / 10;

      let accuracyRate = 0;
      if (progress && progress.length > 0) {
        const totalScore = progress.reduce((sum, p) => sum + (p.last_score || 0), 0);
        accuracyRate = Math.round((totalScore / (progress.length * 5)) * 100);
      }

      const cardsMastered = progress?.filter(p => 
        p.ease_factor && p.ease_factor >= 2.5 && 
        p.interval && p.interval >= 7
      ).length || 0;

      return {
        totalStudyTime,
        accuracyRate,
        cardsMastered
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">Study Statistics</h2>
            <p className="text-muted-foreground">Loading your daily flashcard activity...</p>
          </div>
        </div>
        <Card>
          <CardContent className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading chart data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Study Statistics</h2>
          <p className="text-muted-foreground">Track your daily flashcard activity</p>
        </div>
        
        <div className="w-full sm:w-[200px]">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as "7" | "30" | "90")}>
            <SelectTrigger>
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Daily Activity</CardTitle>
          <CardDescription>Cards studied, cards learned, and accuracy over time</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">No study activity found for this period</p>
                <p className="text-sm text-muted-foreground">Start reviewing flashcards to see your progress here</p>
              </div>
            </div>
          ) : (
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="cardsStudied" name="Cards Studied" fill="#8884d8" />
                  <Bar yAxisId="left" dataKey="cardsLearned" name="Cards Learned" fill="#82ca9d" />
                  <Bar yAxisId="right" dataKey="accuracyRate" name="Accuracy %" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Study Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {periodStats.totalStudyTime} hours
            </div>
            <p className="text-xs text-muted-foreground">
              In the last {timeRange} days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {periodStats.accuracyRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average for the period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cards Mastered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {periodStats.cardsMastered}
            </div>
            <p className="text-xs text-muted-foreground">
              Well-learned cards in period
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
