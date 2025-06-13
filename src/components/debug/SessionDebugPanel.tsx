
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSessionAnalytics } from '@/hooks/useSessionAnalytics';
import { Bug, Download, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SessionDebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { analytics, sessions } = useSessionAnalytics();

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const exportAnalytics = () => {
    const data = {
      analytics,
      sessions: sessions.slice(0, 10), // Last 10 sessions
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
            Session Debug (Read-Only)
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
        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="grid grid-cols-1 mb-4">
            <TabsTrigger value="metrics" className="text-xs">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-muted p-2 rounded">
                <div className="font-medium">Total Sessions</div>
                <div className="text-lg font-bold">{analytics.totalSessions}</div>
              </div>
              <div className="bg-muted p-2 rounded">
                <div className="font-medium">Active Sessions</div>
                <div className="text-lg font-bold">{analytics.activeSessions}</div>
              </div>
              <div className="bg-muted p-2 rounded">
                <div className="font-medium">Total Time</div>
                <div className="text-lg font-bold">{analytics.totalStudyTime}h</div>
              </div>
              <div className="bg-muted p-2 rounded">
                <div className="font-medium">Avg Session</div>
                <div className="text-lg font-bold">{analytics.averageSessionTime}m</div>
              </div>
            </div>

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
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
