
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Clock, BookOpen, Brain, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

interface DateRange {
  start: Date;
  end: Date;
}

interface EngagementMetricsProps {
  dateRange: DateRange;
}

export const EngagementMetrics = ({ dateRange }: EngagementMetricsProps) => {
  const { data: engagementData, isLoading } = useQuery({
    queryKey: ['engagement-metrics', dateRange],
    queryFn: async () => {
      // Get average session length
      const { data: avgSessionLength, error: sessionError } = await supabase.rpc('calculate_avg_session_length');
      
      // Get feature usage stats
      const { data: studySessions, error: studyError } = await supabase
        .from('study_sessions')
        .select('activity_type, duration')
        .gte('start_time', dateRange.start.toISOString())
        .lte('start_time', dateRange.end.toISOString());

      const { data: flashcardSets, error: flashcardError } = await supabase
        .from('flashcard_sets')
        .select('id', { count: 'exact' })
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());

      const { data: quizzes, error: quizError } = await supabase
        .from('quizzes')
        .select('id', { count: 'exact' })
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());

      const { data: notes, error: notesError } = await supabase
        .from('notes')
        .select('id', { count: 'exact' })
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());

      if (sessionError || studyError || flashcardError || quizError || notesError) {
        console.error('Engagement metrics error:', { sessionError, studyError, flashcardError, quizError, notesError });
        throw new Error('Failed to fetch engagement metrics');
      }

      // Process feature usage
      const featureUsage = [
        { feature: 'Flashcards', usage: flashcardSets?.length || 0 },
        { feature: 'Quizzes', usage: quizzes?.length || 0 },
        { feature: 'Notes', usage: notes?.length || 0 },
        { feature: 'Study Sessions', usage: studySessions?.length || 0 }
      ];

      // Mock session frequency data
      const sessionFrequency = Array.from({ length: 7 }, (_, i) => ({
        day: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
        sessions: Math.floor(Math.random() * 50) + 10
      }));

      return {
        avgSessionLength: (avgSessionLength || 0) / 60, // Convert to minutes
        totalSessions: studySessions?.length || 0,
        featureUsage,
        sessionFrequency
      };
    }
  });

  if (isLoading) {
    return <div>Loading engagement metrics...</div>;
  }

  const formatTime = (minutes: number) => `${minutes.toFixed(1)} min`;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session Length</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(engagementData?.avgSessionLength || 0)}</div>
            <p className="text-xs text-green-600 font-medium">✓ Live Data</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagementData?.totalSessions || 0}</div>
            <p className="text-xs text-green-600 font-medium">✓ Live Data</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Used Feature</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {engagementData?.featureUsage?.reduce((prev, current) => 
                (prev.usage > current.usage) ? prev : current
              )?.feature || 'N/A'}
            </div>
            <p className="text-xs text-green-600 font-medium">✓ Live Data</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feature Adoption</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {engagementData?.featureUsage?.filter(f => f.usage > 0).length || 0}/4
            </div>
            <p className="text-xs text-green-600 font-medium">✓ Live Data</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Feature Usage</CardTitle>
            <CardDescription>
              Usage count by feature in selected period
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">✓ Live Data</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={engagementData?.featureUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="feature" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="usage" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Session Frequency</CardTitle>
            <CardDescription>
              Number of study sessions per day
              <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Mock Data</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engagementData?.sessionFrequency}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sessions" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
