import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { sentryService } from '@/services/sentry/sentryService';
import { 
  Bug, 
  Zap, 
  Activity, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  Clock
} from 'lucide-react';

export const SentryTestingDashboard = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize Sentry and load events
    const initSentry = async () => {
      await sentryService.initialize();
      setIsInitialized(true);
      loadEvents();
    };

    initSentry();
  }, []);

  const loadEvents = () => {
    const sentryEvents = sentryService.getSentryEvents();
    setEvents(sentryEvents);
  };

  const handleTestError = () => {
    try {
      sentryService.testError();
    } catch (error) {
      sentryService.captureException(error as Error, {
        testType: 'manual_error_test',
        source: 'sentry_testing_dashboard'
      });
    }
    setTimeout(loadEvents, 100);
  };

  const handleTestMessage = () => {
    sentryService.captureMessage('Test message from Sentry dashboard', 'info', {
      testType: 'manual_message_test',
      timestamp: new Date().toISOString()
    });
    setTimeout(loadEvents, 100);
  };

  const handleTestPerformance = () => {
    sentryService.testPerformance();
    sentryService.captureMessage('Performance test started', 'info');
    setTimeout(loadEvents, 100);
  };

  const handleTestBreadcrumb = () => {
    sentryService.addBreadcrumb({
      message: 'User clicked test breadcrumb button',
      category: 'ui',
      level: 'info',
      data: { component: 'SentryTestingDashboard' }
    });
    setTimeout(loadEvents, 100);
  };

  const clearEvents = () => {
    sentryService.clearSentryEvents();
    setEvents([]);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'message': return <Activity className="h-4 w-4 text-blue-500" />;
      case 'transaction': return <Zap className="h-4 w-4 text-green-500" />;
      case 'breadcrumb': return <Clock className="h-4 w-4 text-gray-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getEventBadgeVariant = (type: string) => {
    switch (type) {
      case 'error': return 'destructive';
      case 'message': return 'secondary';
      case 'transaction': return 'default';
      case 'breadcrumb': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bug className="h-5 w-5 mr-2" />
            Sentry Integration Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className={`h-5 w-5 ${isInitialized ? 'text-green-500' : 'text-gray-400'}`} />
            <span>Sentry Status: {isInitialized ? 'Initialized' : 'Not initialized'}</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button onClick={handleTestError} variant="destructive" size="sm">
              Test Error
            </Button>
            <Button onClick={handleTestMessage} variant="secondary" size="sm">
              Test Message
            </Button>
            <Button onClick={handleTestPerformance} variant="default" size="sm">
              Test Performance
            </Button>
            <Button onClick={handleTestBreadcrumb} variant="outline" size="sm">
              Test Breadcrumb
            </Button>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              These tests simulate different types of Sentry events. In production, 
              these would be sent to your Sentry project for monitoring.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Captured Events ({events.length})</CardTitle>
            <Button onClick={clearEvents} variant="outline" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Events
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {events.map((event, index) => (
              <div key={index} className="border rounded p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getEventIcon(event.type)}
                    <Badge variant={getEventBadgeVariant(event.type) as any}>
                      {event.type}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                <div className="text-sm">
                  {event.data.message && (
                    <div><strong>Message:</strong> {event.data.message}</div>
                  )}
                  {event.data.name && (
                    <div><strong>Transaction:</strong> {event.data.name}</div>
                  )}
                  {event.data.duration && (
                    <div><strong>Duration:</strong> {event.data.duration.toFixed(2)}ms</div>
                  )}
                  {event.data.level && (
                    <div><strong>Level:</strong> {event.data.level}</div>
                  )}
                </div>

                {event.data.context && (
                  <details className="text-xs">
                    <summary className="cursor-pointer">Context</summary>
                    <pre className="mt-1 bg-gray-50 p-2 rounded">
                      {JSON.stringify(event.data.context, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
            
            {events.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No events captured yet. Try the test buttons above.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};