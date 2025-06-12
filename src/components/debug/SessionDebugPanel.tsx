
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSessionAnalytics } from '@/hooks/useSessionAnalytics';
import { useUnifiedSessionTracker } from '@/hooks/useUnifiedSessionTracker';
import { Activity, Download, Trash2, Bug, Clock, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SessionDebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { metrics, debugInfo, eventHistory, exportAnalytics, clearAnalytics } = useSessionAnalytics();
  const sessionTracker = useUnifiedSessionTracker();

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionStatus = () => {
    if (!sessionTracker.isActive) return { label: 'Inactive', color: 'bg-gray-500' };
    if (sessionTracker.isPaused) return { label: 'Paused', color: 'bg-orange-500' };
    return { label: 'Active', color: 'bg-green-500' };
  };

  const status = getSessionStatus();

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 h-12 w-12 rounded-full p-0 shadow-lg"
        variant="outline"
        title="Open Session Debug Panel"
      >
        <Bug className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 left-4 z-50 w-96 max-h-[80vh] shadow-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Session Debug
          </CardTitle>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            ×
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="status" className="text-xs">Status</TabsTrigger>
            <TabsTrigger value="metrics" className="text-xs">Metrics</TabsTrigger>
            <TabsTrigger value="events" className="text-xs">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", status.color)} />
                <span className="font-medium">{status.label}</span>
              </div>
              <div className="text-right">
                {sessionTracker.isActive && (
                  <Badge variant="outline" className="text-xs">
                    {formatTime(sessionTracker.elapsedSeconds)}
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Session ID:</span>
                <span className="font-mono text-xs">
                  {sessionTracker.sessionId?.slice(-8) || 'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Activity:</span>
                <span>{sessionTracker.currentActivity || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span>Study Page:</span>
                <Badge variant={sessionTracker.isOnStudyPage ? "default" : "secondary"} className="text-xs">
                  {sessionTracker.isOnStudyPage ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Last Activity:</span>
                <span>
                  {sessionTracker.lastActivityTime 
                    ? new Date(sessionTracker.lastActivityTime).toLocaleTimeString()
                    : 'Never'
                  }
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={sessionTracker.togglePause}
                disabled={!sessionTracker.isActive}
                size="sm"
                variant="outline"
                className="flex-1 text-xs"
              >
                {sessionTracker.isPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button
                onClick={sessionTracker.endSession}
                disabled={!sessionTracker.isActive}
                size="sm"
                variant="destructive"
                className="flex-1 text-xs"
              >
                End
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-muted p-2 rounded">
                <div className="font-medium">Total Events</div>
                <div className="text-lg font-bold">{metrics.totalEvents}</div>
              </div>
              <div className="bg-muted p-2 rounded">
                <div className="font-medium">Sessions</div>
                <div className="text-lg font-bold">{metrics.sessionStartCount}</div>
              </div>
              <div className="bg-muted p-2 rounded">
                <div className="font-medium">Avg Duration</div>
                <div className="text-lg font-bold">{formatTime(metrics.averageSessionDuration)}</div>
              </div>
              <div className="bg-muted p-2 rounded">
                <div className="font-medium">Idle Warnings</div>
                <div className="text-lg font-bold">{metrics.idleWarnings}</div>
              </div>
            </div>

            {Object.keys(metrics.activityDistribution).length > 0 && (
              <div>
                <div className="text-xs font-medium mb-2">Activity Distribution</div>
                <div className="space-y-1">
                  {Object.entries(metrics.activityDistribution).map(([activity, count]) => (
                    <div key={activity} className="flex justify-between text-xs">
                      <span className="capitalize">{activity.replace('_', ' ')}</span>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={exportAnalytics}
                size="sm"
                variant="outline"
                className="flex-1 text-xs"
              >
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
              <Button
                onClick={clearAnalytics}
                size="sm"
                variant="destructive"
                className="flex-1 text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="events">
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {eventHistory.slice(-10).reverse().map((event, index) => (
                  <div key={index} className="text-xs p-2 bg-muted rounded">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="text-xs">
                        {event.type.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {event.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    {event.data && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {JSON.stringify(event.data, null, 2)}
                      </div>
                    )}
                  </div>
                ))}
                {eventHistory.length === 0 && (
                  <div className="text-center text-muted-foreground text-xs py-4">
                    No events recorded yet
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
