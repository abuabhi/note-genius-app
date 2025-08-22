import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useActionableSubjectAnalytics } from "@/hooks/useActionableSubjectAnalytics";
import { 
  Clock, 
  Calendar, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Brain, 
  PlusCircle,
  Play,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "@/hooks/useRouter";

const ActionableSubjectDashboard = memo(() => {
  const { analytics, isLoading } = useActionableSubjectAnalytics();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const formatHours = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    return `${hours}h`;
  };

  const MetricCard = memo(({ title, value, icon: Icon, color = "muted-foreground", trend }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    color?: string;
    trend?: string;
  }) => (
    <Card className="bg-card border border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-2xl font-bold text-foreground">
          {value}
        </div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">{trend}</p>
        )}
      </CardContent>
    </Card>
  ));

  const SubjectCard = memo(({ subject }: { subject: any }) => {
    const handleStudyNow = () => {
      // Navigate to study session creation with pre-filled subject
      router.push('/sessions/new');
    };

    const handleCreateGoal = () => {
      // Navigate to goal creation with pre-filled subject
      router.push('/goals/new');
    };

    const handleReviewFlashcards = () => {
      // Navigate to flashcards filtered by subject
      router.push('/flashcards');
    };

    const getStatusColor = () => {
      if (subject.goalProgress) {
        return subject.goalProgress.isOnTrack ? 'text-emerald-600' : 'text-amber-600';
      }
      return 'text-muted-foreground';
    };

    const getStatusIcon = () => {
      if (subject.goalProgress) {
        return subject.goalProgress.isOnTrack ? CheckCircle2 : AlertTriangle;
      }
      return Clock;
    };

    const StatusIcon = getStatusIcon();

    return (
      <Card className="bg-card border border-border hover:shadow-sm transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground">{subject.name}</CardTitle>
            <StatusIcon className={`h-5 w-5 ${getStatusColor()}`} />
          </div>
          
          {/* Goal Progress */}
          {subject.goalProgress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Goal Progress</span>
                <span className="font-medium text-foreground">
                  {subject.goalProgress.currentHours}h / {subject.goalProgress.targetHours}h
                </span>
              </div>
              <Progress 
                value={subject.goalProgress.progressPercentage} 
                className="h-2"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{subject.goalProgress.progressPercentage}% complete</span>
                <span>{subject.goalProgress.daysRemaining} days remaining</span>
              </div>
              {!subject.goalProgress.isOnTrack && (
                <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                  {Math.abs(subject.goalProgress.hoursBehindAhead)}h behind schedule
                </Badge>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Study Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Study Time</p>
              <p className="font-semibold text-foreground">{formatTime(subject.totalStudyTimeMinutes)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">This Week</p>
              <p className="font-semibold text-foreground">{formatTime(subject.weeklyStudyMinutes)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Sessions</p>
              <p className="font-semibold text-foreground">{subject.sessionCount}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Avg Session</p>
              <p className="font-semibold text-foreground">{formatTime(subject.studyPattern.averageSessionMinutes)}</p>
            </div>
          </div>

          {/* Resources */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Brain className="h-4 w-4" />
              <span>{subject.resources.flashcardSets}</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>{subject.resources.quizzes}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{subject.resources.notes}</span>
            </div>
          </div>

          {/* Recommendations */}
          {subject.recommendations.length > 0 && (
            <div className="space-y-2">
              {subject.recommendations.map((rec: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2 p-2 bg-muted/50 rounded-md">
                  <Zap className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">{rec}</p>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              onClick={handleStudyNow}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Play className="h-3 w-3 mr-1" />
              Study Now
            </Button>
            
            {subject.resources.flashcardSets > 0 && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleReviewFlashcards}
              >
                <Brain className="h-3 w-3 mr-1" />
                Review Cards
              </Button>
            )}
            
            {!subject.goalProgress && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleCreateGoal}
              >
                <PlusCircle className="h-3 w-3 mr-1" />
                Set Goal
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  });

  const InsightCard = memo(({ insight }: { insight: any }) => {
    const getInsightIcon = () => {
      switch (insight.type) {
        case 'goal': return Target;
        case 'time': return Clock;
        case 'pattern': return TrendingUp;
        default: return BookOpen;
      }
    };

    const getInsightColor = () => {
      switch (insight.priority) {
        case 'high': return 'text-red-600 bg-red-50 border-red-200';
        case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
        case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
        default: return 'text-muted-foreground bg-muted border-border';
      }
    };

    const InsightIcon = getInsightIcon();

    return (
      <div className={`flex items-start gap-3 p-3 rounded-lg border ${getInsightColor()}`}>
        <InsightIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p className="text-sm font-medium">{insight.message}</p>
      </div>
    );
  });

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Study Time"
          value={formatHours(analytics.totalStudyTimeHours)}
          icon={Clock}
          trend="All time"
        />
        <MetricCard
          title="This Week"
          value={formatHours(analytics.weeklyStudyHours)}
          icon={Calendar}
          trend="Last 7 days"
        />
        <MetricCard
          title="Active Goals"
          value={analytics.activeGoalsCount}
          icon={Target}
          trend="In progress"
        />
        <MetricCard
          title="Study Streak"
          value={`${analytics.studyStreak} days`}
          icon={TrendingUp}
          trend="Current streak"
        />
      </div>

      {/* Actionable Insights */}
      {analytics.insights.length > 0 && (
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Actionable Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.insights.map((insight, idx) => (
              <InsightCard key={idx} insight={insight} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Subject Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Your Subjects</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/sessions/new')}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Start New Session
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {analytics.subjects.length === 0 ? (
            <Card className="col-span-full bg-muted/50 border border-border">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Study Data Yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start studying to see your subject analytics and personalized recommendations.
                </p>
                <Button onClick={() => router.push('/sessions/new')}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Your First Session
                </Button>
              </CardContent>
            </Card>
          ) : (
            analytics.subjects.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))
          )}
        </div>
      </div>
    </div>
  );
});

ActionableSubjectDashboard.displayName = 'ActionableSubjectDashboard';

export { ActionableSubjectDashboard };