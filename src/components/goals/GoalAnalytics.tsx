
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar, 
  BarChart3,
  PieChart,
  Clock,
  Award
} from 'lucide-react';
import { StudyGoal } from '@/hooks/useStudyGoals';
import { differenceInDays, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

interface GoalAnalyticsProps {
  goals: StudyGoal[];
}

interface GoalAnalytics {
  totalGoals: number;
  completedGoals: number;
  completionRate: number;
  averageCompletionTime: number;
  overdueGoals: number;
  onTimeCompletions: number;
  subjectBreakdown: Record<string, { total: number; completed: number; rate: number }>;
  monthlyTrends: Array<{ month: string; completed: number; created: number }>;
  timelineAnalysis: {
    underEstimated: number;
    overEstimated: number;
    accurate: number;
  };
  patterns: {
    mostSuccessfulSubject: string;
    averageGoalDuration: number;
    peakCompletionTime: string;
    recommendedDuration: number;
  };
}

export const GoalAnalytics: React.FC<GoalAnalyticsProps> = ({ goals }) => {
  const [analytics, setAnalytics] = useState<GoalAnalytics | null>(null);

  const calculateAnalytics = useMemo(() => {
    if (goals.length === 0) return null;

    const now = new Date();
    const completedGoals = goals.filter(goal => goal.is_completed);
    const totalGoals = goals.length;
    const completionRate = (completedGoals.length / totalGoals) * 100;

    // Calculate average completion time for completed goals
    const completionTimes = completedGoals
      .map(goal => {
        const startDate = parseISO(goal.start_date);
        const endDate = parseISO(goal.end_date);
        const plannedDuration = differenceInDays(endDate, startDate);
        return plannedDuration;
      })
      .filter(time => time > 0);

    const averageCompletionTime = completionTimes.length > 0 
      ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length 
      : 0;

    // Count overdue goals
    const overdueGoals = goals.filter(goal => {
      if (goal.is_completed || goal.status === 'archived') return false;
      const endDate = parseISO(goal.end_date);
      return now > endDate;
    }).length;

    // Count on-time completions
    const onTimeCompletions = completedGoals.filter(goal => {
      const endDate = parseISO(goal.end_date);
      // Assuming completion happened on end_date for completed goals
      return true; // We'd need a completion_date field for accurate calculation
    }).length;

    // Subject breakdown - using 'subject' instead of 'academic_subject'
    const subjectBreakdown: Record<string, { total: number; completed: number; rate: number }> = {};
    goals.forEach(goal => {
      const subject = goal.subject || 'Unspecified';
      if (!subjectBreakdown[subject]) {
        subjectBreakdown[subject] = { total: 0, completed: 0, rate: 0 };
      }
      subjectBreakdown[subject].total++;
      if (goal.is_completed) {
        subjectBreakdown[subject].completed++;
      }
    });

    // Calculate completion rates for each subject
    Object.keys(subjectBreakdown).forEach(subject => {
      const data = subjectBreakdown[subject];
      data.rate = (data.completed / data.total) * 100;
    });

    // Monthly trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - i, 1));
      const monthEnd = endOfMonth(monthStart);
      
      const monthlyCompleted = completedGoals.filter(goal => {
        const endDate = parseISO(goal.end_date);
        return isWithinInterval(endDate, { start: monthStart, end: monthEnd });
      }).length;

      const monthlyCreated = goals.filter(goal => {
        const createdDate = parseISO(goal.created_at);
        return isWithinInterval(createdDate, { start: monthStart, end: monthEnd });
      }).length;

      monthlyTrends.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        completed: monthlyCompleted,
        created: monthlyCreated
      });
    }

    // Timeline analysis
    const timelineAnalysis = {
      underEstimated: 0, // Goals that took longer than planned
      overEstimated: 0,  // Goals completed early
      accurate: 0        // Goals completed on time
    };

    // Patterns analysis
    const mostSuccessfulSubject = Object.entries(subjectBreakdown)
      .filter(([_, data]) => data.total >= 2) // At least 2 goals
      .sort((a, b) => b[1].rate - a[1].rate)[0]?.[0] || 'None';

    const goalDurations = goals.map(goal => {
      const startDate = parseISO(goal.start_date);
      const endDate = parseISO(goal.end_date);
      return differenceInDays(endDate, startDate);
    }).filter(duration => duration > 0);

    const averageGoalDuration = goalDurations.length > 0
      ? goalDurations.reduce((sum, duration) => sum + duration, 0) / goalDurations.length
      : 0;

    // Recommend duration based on successful goals
    const successfulDurations = completedGoals.map(goal => {
      const startDate = parseISO(goal.start_date);
      const endDate = parseISO(goal.end_date);
      return differenceInDays(endDate, startDate);
    }).filter(duration => duration > 0);

    const recommendedDuration = successfulDurations.length > 0
      ? Math.round(successfulDurations.reduce((sum, duration) => sum + duration, 0) / successfulDurations.length)
      : Math.round(averageGoalDuration);

    return {
      totalGoals,
      completedGoals: completedGoals.length,
      completionRate,
      averageCompletionTime,
      overdueGoals,
      onTimeCompletions,
      subjectBreakdown,
      monthlyTrends,
      timelineAnalysis,
      patterns: {
        mostSuccessfulSubject,
        averageGoalDuration,
        peakCompletionTime: 'Weekends', // This would need more detailed analysis
        recommendedDuration
      }
    };
  }, [goals]);

  useEffect(() => {
    setAnalytics(calculateAnalytics);
  }, [calculateAnalytics]);

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Goal Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No goal data available for analysis.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Overview Stats */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.completionRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            {analytics.completedGoals} out of {analytics.totalGoals} goals completed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(analytics.averageCompletionTime)} days</div>
          <p className="text-xs text-muted-foreground">
            Recommended: {analytics.patterns.recommendedDuration} days
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overdue Goals</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{analytics.overdueGoals}</div>
          <p className="text-xs text-muted-foreground">
            {((analytics.overdueGoals / analytics.totalGoals) * 100).toFixed(1)}% of total goals
          </p>
        </CardContent>
      </Card>

      {/* Subject Performance */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Subject Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(analytics.subjectBreakdown)
              .sort((a, b) => b[1].rate - a[1].rate)
              .slice(0, 5)
              .map(([subject, data]) => (
                <div key={subject} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{subject}</span>
                    {subject === analytics.patterns.mostSuccessfulSubject && (
                      <Badge variant="secondary" className="text-xs">
                        <Award className="h-3 w-3 mr-1" />
                        Best
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {data.completed}/{data.total}
                    </span>
                    <Badge variant={data.rate >= 70 ? 'default' : data.rate >= 50 ? 'secondary' : 'destructive'}>
                      {data.rate.toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Recent Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.monthlyTrends.slice(-3).map((trend, index) => (
              <div key={trend.month} className="flex items-center justify-between text-sm">
                <span>{trend.month}</span>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">+{trend.completed}</span>
                  <span className="text-muted-foreground">/{trend.created} created</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights & Recommendations */}
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Key Insights</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Most successful subject: <strong>{analytics.patterns.mostSuccessfulSubject}</strong></li>
                <li>• Average goal duration: <strong>{Math.round(analytics.patterns.averageGoalDuration)} days</strong></li>
                <li>• Current completion rate: <strong>{analytics.completionRate.toFixed(1)}%</strong></li>
                {analytics.overdueGoals > 0 && (
                  <li className="text-orange-600">• {analytics.overdueGoals} goals need attention</li>
                )}
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Recommendations</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Set goals for <strong>{analytics.patterns.recommendedDuration} days</strong> duration</li>
                {analytics.completionRate < 70 && (
                  <li>• Consider setting smaller, more achievable goals</li>
                )}
                {analytics.overdueGoals > 2 && (
                  <li className="text-amber-600">• Review and adjust overdue goals</li>
                )}
                <li>• Focus on <strong>{analytics.patterns.mostSuccessfulSubject}</strong> for quick wins</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
