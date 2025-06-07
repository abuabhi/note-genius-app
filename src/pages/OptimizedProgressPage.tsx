
import { lazy, Suspense } from 'react';
import Layout from '@/components/layout/Layout';
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';
import { TrendingUp } from 'lucide-react';
import { useOptimizedProgress } from '@/hooks/performance/useOptimizedProgress';
import { ProgressiveLoader } from '@/components/performance/ProgressiveLoader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Lazy load heavy chart components
const ProgressCharts = lazy(() => import('@/components/dashboard/AnalyticsSection'));
const AchievementsList = lazy(() => import('@/components/goals/GoalsGrid'));

const OptimizedProgressPage = () => {
  const { data, isLoading, isPartiallyLoaded, loadingStates } = useOptimizedProgress();

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-6">
        <PageBreadcrumb pageName="Progress" pageIcon={<TrendingUp className="h-3 w-3" />} />
        
        <ProgressiveLoader
          isLoading={isLoading}
          isPartiallyLoaded={isPartiallyLoaded}
          loadingStates={loadingStates}
          skeletonCount={4}
        >
          <div className="space-y-6">
            {/* Today's Stats - Always show first */}
            {data.basic.todayStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Study Time Today</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round((data.basic.todayStats.total_study_time || 0) / 60)} min
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(data.basic.todayStats.flashcard_accuracy || 0)}%
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Consistency</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(data.basic.todayStats.consistency_score || 0)}%
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Active Goals */}
            {data.basic.activeGoals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Active Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.basic.activeGoals.map((goal) => (
                      <div key={goal.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{goal.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Target: {goal.target_hours} hours by {new Date(goal.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {goal.progress}% Complete
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Charts - Load progressively */}
            {!loadingStates.analytics && data.analytics.weeklyProgress.length > 0 && (
              <Suspense fallback={<div className="h-64 bg-gray-200 rounded animate-pulse" />}>
                <Card>
                  <CardHeader>
                    <CardTitle>Progress Charts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProgressCharts />
                  </CardContent>
                </Card>
              </Suspense>
            )}

            {/* Recent Achievements */}
            {data.analytics.recentAchievements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {data.analytics.recentAchievements.map((achievement, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                        {achievement.badge_image && (
                          <img 
                            src={achievement.badge_image} 
                            alt={achievement.title}
                            className="w-12 h-12 rounded-full"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium">{achievement.title}</h3>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(achievement.achieved_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge>{achievement.points} pts</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Flashcard Progress - Load last */}
            {!loadingStates.flashcards && data.flashcards.length > 0 && (
              <Suspense fallback={<div className="h-32 bg-gray-200 rounded animate-pulse" />}>
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Flashcard Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {data.flashcards.slice(0, 10).map((progress) => (
                        <div key={progress.id} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm truncate flex-1">
                            {progress.flashcard?.front_content || 'Unknown Card'}
                          </span>
                          <div className="flex gap-2">
                            <Badge variant="outline">Level {progress.mastery_level}</Badge>
                            <Badge variant={progress.grade === 'A' ? 'default' : 'secondary'}>
                              {progress.grade}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Suspense>
            )}
          </div>
        </ProgressiveLoader>
      </div>
    </Layout>
  );
};

export default OptimizedProgressPage;
