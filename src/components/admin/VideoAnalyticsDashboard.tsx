import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useVideoAnalytics } from '@/hooks/admin/useVideoAnalytics';
import { Play, Eye, Clock, TrendingUp, BarChart3 } from 'lucide-react';

export const VideoAnalyticsDashboard = () => {
  const { data: analytics = [], isLoading } = useVideoAnalytics();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-8 bg-muted rounded w-1/2"></div>
                <div className="h-2 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalViews = analytics.reduce((sum, video) => sum + video.total_views, 0);
  const avgCompletionRate = analytics.length > 0 
    ? analytics.reduce((sum, video) => sum + video.completion_rate, 0) / analytics.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all videos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCompletionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Video completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Videos</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.length}</div>
            <p className="text-xs text-muted-foreground">
              Videos with data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Performer</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.length > 0 
                ? Math.max(...analytics.map(v => v.completion_rate)).toFixed(1) + '%'
                : 'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Highest completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Individual Video Performance */}
      <div className="grid gap-4 md:grid-cols-2">
        {analytics.map((video) => (
          <Card key={video.video_key}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {video.video_key.replace('video_', '').replace('_url', '').replace(/_/g, ' ')}
                </CardTitle>
                {video.completion_rate > 70 && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    High Performance
                  </Badge>
                )}
                {video.completion_rate < 30 && (
                  <Badge variant="destructive">
                    Needs Attention  
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Views</p>
                  <p className="text-xl font-semibold">{video.total_views}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Avg Watch Time</p>
                  <p className="text-xl font-semibold">{Math.round(video.avg_watch_time)}s</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Completion Rate</span>
                  <span className="text-sm font-medium">{video.completion_rate.toFixed(1)}%</span>
                </div>
                <Progress value={video.completion_rate} className="h-2" />
              </div>

              {video.top_events.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Top Events</p>
                  <div className="flex flex-wrap gap-1">
                    {video.top_events.slice(0, 3).map((event, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {event.event_type}: {event.count}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {analytics.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Analytics Data Yet</h3>
            <p className="text-muted-foreground">
              Video analytics will appear here once users start watching your videos.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};