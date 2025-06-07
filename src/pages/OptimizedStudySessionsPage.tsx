
import { lazy } from 'react';
import Layout from '@/components/layout/Layout';
import { LazyLoadWrapper } from '@/components/performance/LazyLoadWrapper';
import { ProgressiveLoader } from '@/components/performance/ProgressiveLoader';
import { useOptimizedStudySessions } from '@/hooks/performance/useOptimizedStudySessions';
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';
import { Clock, Play, Pause, BarChart3 } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

// Lazy load heavy components
const LearningAnalyticsDashboard = lazy(() => import('@/components/dashboard/LearningAnalyticsDashboard'));

const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="container mx-auto p-4 md:p-6">
    <Alert variant="destructive">
      <AlertTitle>Study Sessions Page Error</AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p><strong>Error:</strong> {error.message}</p>
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
            Try again
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Refresh page
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  </div>
);

// Quick session overview (loads first)
const SessionOverview = ({ data }: { data: any }) => {
  const recentSessions = data.basic.recentSessions || [];
  const sessionStats = data.basic.sessionStats;

  return (
    <div className="space-y-6">
      {/* Session Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
              <p className="text-2xl font-bold">{sessionStats?.total_sessions || 0}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Time</p>
              <p className="text-2xl font-bold">{sessionStats?.total_time || '0h'}</p>
            </div>
            <Play className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Session</p>
              <p className="text-2xl font-bold">{sessionStats?.avg_session || '0m'}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">This Week</p>
              <p className="text-2xl font-bold">{sessionStats?.week_sessions || 0}</p>
            </div>
            <Pause className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Sessions</h3>
        {recentSessions.length > 0 ? (
          <div className="space-y-3">
            {recentSessions.map((session: any) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{session.subject || 'General Study'}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(session.started_at).toLocaleDateString()} • {session.session_type}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{session.duration}</p>
                  <p className="text-xs text-muted-foreground">
                    {session.cards_studied} cards
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h4 className="text-lg font-medium mb-2">No study sessions yet</h4>
            <p className="text-muted-foreground mb-4">
              Start your first study session to track your progress
            </p>
            <Button>
              <Play className="h-4 w-4 mr-2" />
              Start Studying
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Detailed analytics (loads after basic data)
const DetailedAnalytics = ({ data, loadingStates }: { data: any; loadingStates: any }) => {
  return (
    <ProgressiveLoader
      isLoading={loadingStates.analytics}
      isPartiallyLoaded={data.analytics.monthlyData.length > 0}
      skeletonCount={2}
    >
      <div className="space-y-6">
        {/* Weekly Trends */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Weekly Study Trends</h3>
          {data.analytics.weeklyData.length > 0 ? (
            <div className="grid grid-cols-7 gap-2">
              {data.analytics.weeklyData.map((day: any, index: number) => (
                <div key={index} className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                  </p>
                  <div className="bg-blue-100 rounded p-2">
                    <p className="text-sm font-medium">{day.study_time || '0m'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No study data for this week yet.</p>
          )}
        </div>

        {/* Subject Performance */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Subject Performance</h3>
          {data.analytics.subjectStats.length > 0 ? (
            <div className="space-y-3">
              {data.analytics.subjectStats.map((subject: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{subject.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {subject.session_count} sessions
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{subject.total_time}</p>
                    <p className="text-xs text-muted-foreground">
                      Avg: {subject.avg_accuracy}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Study different subjects to see performance breakdown.</p>
          )}
        </div>
      </div>
    </ProgressiveLoader>
  );
};

const OptimizedStudySessionsContent = () => {
  const { data, isLoading, isPartiallyLoaded, loadingStates } = useOptimizedStudySessions();

  return (
    <div className="space-y-8">
      {/* Session Overview - Load First */}
      <ProgressiveLoader
        isLoading={!isPartiallyLoaded}
        isPartiallyLoaded={isPartiallyLoaded}
        skeletonCount={4}
      >
        <SessionOverview data={data} />
      </ProgressiveLoader>

      {/* Detailed Analytics - Load Second */}
      <DetailedAnalytics data={data} loadingStates={loadingStates} />

      {/* Advanced Dashboard - Load Last */}
      <ProgressiveLoader
        isLoading={loadingStates.analytics}
        isPartiallyLoaded={!loadingStates.analytics}
        skeletonCount={1}
      >
        <LazyLoadWrapper>
          <LearningAnalyticsDashboard />
        </LazyLoadWrapper>
      </ProgressiveLoader>
    </div>
  );
};

const OptimizedStudySessionsPage = () => {
  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-6">
        <PageBreadcrumb pageName="Study Sessions" pageIcon={<Clock className="h-3 w-3" />} />
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => console.log('Resetting study sessions page error boundary')}
        >
          <OptimizedStudySessionsContent />
        </ErrorBoundary>
      </div>
    </Layout>
  );
};

export default OptimizedStudySessionsPage;
