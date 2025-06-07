
import { lazy, Suspense } from 'react';
import Layout from '@/components/layout/Layout';
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';
import { Clock } from 'lucide-react';
import { useOptimizedStudySessions } from '@/hooks/performance/useOptimizedStudySessions';
import { ProgressiveLoader } from '@/components/performance/ProgressiveLoader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Lazy load heavy components
const SessionCharts = lazy(() => import('@/components/dashboard/LearningAnalyticsDashboard'));

const OptimizedStudySessionsPage = () => {
  const {
    data,
    isLoading,
    isPartiallyLoaded,
    loadingStates,
    dateFilter,
    handlePageChange,
    handleDateFilterChange,
    prefetchNextPage
  } = useOptimizedStudySessions();

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getQualityColor = (quality: string) => {
    const colors = {
      excellent: 'bg-green-500',
      good: 'bg-blue-500',
      needs_improvement: 'bg-yellow-500',
      poor: 'bg-red-500'
    };
    return colors[quality as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-6">
        <PageBreadcrumb pageName="Study Sessions" pageIcon={<Clock className="h-3 w-3" />} />
        
        <ProgressiveLoader
          isLoading={isLoading}
          isPartiallyLoaded={isPartiallyLoaded}
          loadingStates={loadingStates}
          skeletonCount={5}
        >
          <div className="space-y-6">
            {/* Active Sessions */}
            {data.activeSessions.length > 0 && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800">Active Study Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.activeSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                        <div>
                          <h3 className="font-medium">{session.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Started: {new Date(session.start_time).toLocaleTimeString()}
                          </p>
                          {session.subject && (
                            <Badge variant="outline" className="mt-1">{session.subject}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-green-600">Active</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats Overview */}
            {!loadingStates.stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.stats.totalSessions}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatDuration(data.stats.totalDuration)}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatDuration(data.stats.averageDuration)}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.stats.accuracy}%</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Filters and Controls */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Session History</CardTitle>
                  <Select value={dateFilter} onValueChange={handleDateFilterChange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.sessionHistory.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{session.title}</h3>
                          {session.session_quality && (
                            <div 
                              className={`w-2 h-2 rounded-full ${getQualityColor(session.session_quality)}`}
                              title={`Quality: ${session.session_quality}`}
                            />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.start_time).toLocaleDateString()} • {formatDuration(session.duration || 0)}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {session.subject && (
                            <Badge variant="outline">{session.subject}</Badge>
                          )}
                          {session.activity_type && (
                            <Badge variant="secondary">{session.activity_type}</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right text-sm">
                        {session.cards_reviewed > 0 && (
                          <div>
                            {session.cards_correct}/{session.cards_reviewed} cards
                            <div className="text-muted-foreground">
                              {Math.round((session.cards_correct / session.cards_reviewed) * 100)}% accuracy
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {data.pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(data.pagination.currentPage - 1)}
                      disabled={data.pagination.currentPage === 1}
                    >
                      Previous
                    </Button>
                    
                    <span className="flex items-center px-4 text-sm text-muted-foreground">
                      Page {data.pagination.currentPage} of {data.pagination.totalPages}
                    </span>
                    
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(data.pagination.currentPage + 1)}
                      disabled={data.pagination.currentPage === data.pagination.totalPages}
                      onMouseEnter={prefetchNextPage}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Charts */}
            {!loadingStates.stats && data.stats.totalSessions > 0 && (
              <Suspense fallback={<div className="h-64 bg-gray-200 rounded animate-pulse" />}>
                <SessionCharts />
              </Suspense>
            )}
          </div>
        </ProgressiveLoader>
      </div>
    </Layout>
  );
};

export default OptimizedStudySessionsPage;
