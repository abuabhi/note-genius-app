
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, AlertTriangle, Info, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  source: string;
}

export const SystemAlertsManager = () => {
  const [alerts, setAlerts] = useState<SystemAlert[]>([
    {
      id: '1',
      type: 'warning',
      title: 'High Response Time',
      message: 'Average response time exceeded 2 seconds for /api/notes endpoint',
      timestamp: new Date(Date.now() - 300000),
      acknowledged: false,
      source: 'Performance Monitor'
    },
    {
      id: '2',
      type: 'error',
      title: 'Edge Function Failures',
      message: 'process-document function has 12.5% error rate in the last hour',
      timestamp: new Date(Date.now() - 600000),
      acknowledged: false,
      source: 'Edge Function Monitor'
    },
    {
      id: '3',
      type: 'info',
      title: 'Load Test Completed',
      message: 'Artillery load test completed successfully with 1,250 requests',
      timestamp: new Date(Date.now() - 900000),
      acknowledged: true,
      source: 'Load Testing'
    }
  ]);

  const [alertStats, setAlertStats] = useState({
    total: 0,
    unacknowledged: 0,
    errors: 0,
    warnings: 0
  });

  useEffect(() => {
    const stats = {
      total: alerts.length,
      unacknowledged: alerts.filter(a => !a.acknowledged).length,
      errors: alerts.filter(a => a.type === 'error').length,
      warnings: alerts.filter(a => a.type === 'warning').length
    };
    setAlertStats(stats);
  }, [alerts]);

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, acknowledged: true }
        : alert
    ));
    toast.success('Alert acknowledged');
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    toast.success('Alert dismissed');
  };

  const acknowledgeAll = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, acknowledged: true })));
    toast.success('All alerts acknowledged');
  };

  const getAlertIcon = (type: SystemAlert['type']) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getAlertColor = (type: SystemAlert['type']) => {
    switch (type) {
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getBadgeColor = (type: SystemAlert['type']) => {
    switch (type) {
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {alertStats.total}
              </div>
              <div className="text-sm text-gray-600">Total Alerts</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {alertStats.unacknowledged}
              </div>
              <div className="text-sm text-gray-600">Unacknowledged</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {alertStats.errors}
              </div>
              <div className="text-sm text-gray-600">Errors</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {alertStats.warnings}
              </div>
              <div className="text-sm text-gray-600">Warnings</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              System Alerts
            </CardTitle>
            {alertStats.unacknowledged > 0 && (
              <Button onClick={acknowledgeAll} size="sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                Acknowledge All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No system alerts. Everything is running smoothly!</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <Alert 
                  key={alert.id} 
                  className={`${getAlertColor(alert.type)} ${alert.acknowledged ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold">{alert.title}</h4>
                          <Badge className={getBadgeColor(alert.type)}>
                            {alert.type.toUpperCase()}
                          </Badge>
                          {alert.acknowledged && (
                            <Badge variant="outline" className="text-green-700">
                              ACKNOWLEDGED
                            </Badge>
                          )}
                        </div>
                        <AlertDescription className="mb-2">
                          {alert.message}
                        </AlertDescription>
                        <div className="text-xs text-gray-500">
                          {alert.source} • {alert.timestamp.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!alert.acknowledged && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => dismissAlert(alert.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Alert>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
