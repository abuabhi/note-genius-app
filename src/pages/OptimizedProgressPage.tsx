
import { lazy } from 'react';
import Layout from '@/components/layout/Layout';
import { LazyLoadWrapper } from '@/components/performance/LazyLoadWrapper';
import { ProgressiveLoader } from '@/components/performance/ProgressiveLoader';
import { useOptimizedProgress } from '@/hooks/performance/useOptimizedProgress';
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';
import { TrendingUp, Target, Award } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

// Lazy load heavy components
const AnalyticsSection = lazy(() => import('@/components/dashboard/AnalyticsSection'));
const GoalsGrid = lazy(() => import('@/components/goals/GoalsGrid'));

const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="container mx-auto p-4 md:p-6">
    <Alert variant="destructive">
      <AlertTitle>Progress Page Error</AlertTitle>
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

// Basic stats component to show immediately
const BasicProgressStats = ({ data }: { data: any }) => {
  const todayStats = data.basic.todayStats;
  const activeGoals = data.basic.activeGoals;

  return (
    <div className="space-y-6">
      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Study Time Today</p>
              <p className="text-2xl font-bold">{todayStats?.total_study_time || '0m'}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Accuracy</p>
              <p className="text-2xl font-bold">{todayStats?.flashcard_accuracy || '0'}%</p>
            </div>
            <Target className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Consistency</p>
              <p className="text-2xl font-bold">{todayStats?.consistency_score || '0'}%</p>
            </div>
            <Award className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Active Goals</h3>
          <div className="space-y-3">
            {activeGoals.map((goal: any) => (
              <div key={goal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{goal.title}</p>
                  <p className="text-sm text-muted-foreground">
                    Target: {goal.target_hours}h by {new Date(goal.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{goal.progress}%</p>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Advanced analytics component (loads after basic data)
const AdvancedAnalytics = ({ data, loadingStates }: { data: any; loadingStates: any }) => {
  return (
    <div className="space-y-6">
      {/* Weekly Progress Chart */}
      <ProgressiveLoader
        isLoading={loadingStates.analytics}
        isPartiallyLoaded={data.analytics.weeklyProgress.length > 0}
        skeletonCount={1}
      >
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Weekly Progress</h3>
          {data.analytics.weeklyProgress.length > 0 ? (
            <div className="space-y-2">
              {data.analytics.weeklyProgress.map((day: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{new Date(day.date).toLocaleDateString()}</span>
                  <span className="text-sm font-medium">{day.total_study_time}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No study data for this week yet.</p>
          )}
        </div>
      </ProgressiveLoader>

      {/* Recent Achievements */}
      <ProgressiveLoader
        isLoading={loadingStates.analytics}
        isPartiallyLoaded={data.analytics.recentAchievements.length > 0}
        skeletonCount={1}
      >
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Achievements</h3>
          {data.analytics.recentAchievements.length > 0 ? (
            <div className="space-y-3">
              {data.analytics.recentAchievements.map((achievement: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 rounded">
                  <Award className="h-6 w-6 text-yellow-500" />
                  <div>
                    <p className="font-medium">{achievement.title}</p>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(achievement.achieved_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <span className="text-sm font-medium">{achievement.points} pts</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Complete your first study session to earn achievements!</p>
          )}
        </div>
      </ProgressiveLoader>
    </div>
  );
};

// Flashcard progress component (loads last)
const FlashcardProgress = ({ data, loadingStates }: { data: any; loadingStates: any }) => {
  return (
    <ProgressiveLoader
      isLoading={loadingStates.flashcards}
      isPartiallyLoaded={data.flashcards.length > 0}
      skeletonCount={1}
    >
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Flashcard Mastery</h3>
        {data.flashcards.length > 0 ? (
          <div className="space-y-3">
            {data.flashcards.slice(0, 5).map((progress: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-sm">
                    {progress.flashcards.front_content.substring(0, 50)}...
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {progress.flashcards.flashcard_set_cards[0]?.flashcard_sets.name} • 
                    {progress.flashcards.flashcard_set_cards[0]?.flashcard_sets.subject}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Level {progress.mastery_level}</p>
                  <p className="text-xs text-muted-foreground">
                    Last: {progress.last_score}% ({progress.grade})
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Start studying flashcards to track your progress!</p>
        )}
      </div>
    </ProgressiveLoader>
  );
};

const OptimizedProgressContent = () => {
  const { data, isLoading, isPartiallyLoaded, loadingStates } = useOptimizedProgress();

  return (
    <div className="space-y-8">
      {/* Basic Progress Stats - Load First */}
      <ProgressiveLoader
        isLoading={!isPartiallyLoaded}
        isPartiallyLoaded={isPartiallyLoaded}
        skeletonCount={3}
      >
        <BasicProgressStats data={data} />
      </ProgressiveLoader>

      {/* Advanced Analytics - Load Second */}
      <AdvancedAnalytics data={data} loadingStates={loadingStates} />

      {/* Flashcard Progress - Load Last */}
      <FlashcardProgress data={data} loadingStates={loadingStates} />
    </div>
  );
};

const OptimizedProgressPage = () => {
  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-6">
        <PageBreadcrumb pageName="Progress" pageIcon={<TrendingUp className="h-3 w-3" />} />
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => console.log('Resetting progress page error boundary')}
        >
          <OptimizedProgressContent />
        </ErrorBoundary>
      </div>
    </Layout>
  );
};

export default OptimizedProgressPage;
