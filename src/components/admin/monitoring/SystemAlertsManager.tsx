
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, Bell, X } from 'lucide-react';

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
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all');

  // Mock alerts for demonstration - in production these would come from monitoring systems
  useEffect(() => {
    const mockAlerts: SystemAlert[] = [
      {
        id: '1',
        type: 'error',
        title: 'Database Connection Error',
        message: 'Failed to connect to primary database. Falling back to replica.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        acknowledged: false,
        source: 'Database Monitor'
      },
      {
        id: '2',
        type: 'warning',
        title: 'High Memory Usage',
        message: 'Memory usage has exceeded 85% threshold.',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        acknowledged: false,
        source: 'Performance Monitor'
      },
      {
        id: '3',
        type: 'info',
        title: 'Cache Cleared',
        message: 'Application cache was manually cleared by administrator.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        acknowledged: true,
        source: 'Cache Manager'
      }
    ];
    
    setAlerts(mockAlerts);
  }, []);

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const acknowledgeAll = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, acknowledged: true })));
  };

  const clearAcknowledged = () => {
    setAlerts(prev => prev.filter(alert => !alert.acknowledged));
  };

  const filteredAlerts = alerts.filter(alert => 
    filter === 'all' || alert.type === filter
  );

  const unacknowledgedCount = alerts.filter(alert => !alert.acknowledged).length;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Alerts</h2>
          <p className="text-muted-foreground">
            {unacknowledgedCount} unacknowledged alerts
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={acknowledgeAll} variant="outline" size="sm" disabled={unacknowledgedCount === 0}>
            Acknowledge All
          </Button>
          <Button onClick={clearAcknowledged} variant="outline" size="sm">
            Clear Acknowledged
          </Button>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Alerts</p>
                <p className="text-2xl font-bold">{alerts.length}</p>
              </div>
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Errors</p>
                <p className="text-2xl font-bold text-red-600">
                  {alerts.filter(a => a.type === 'error').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {alerts.filter(a => a.type === 'warning').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unacknowledged</p>
                <p className="text-2xl font-bold">{unacknowledgedCount}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        {(['all', 'error', 'warning', 'info'] as const).map((filterType) => (
          <Button
            key={filterType}
            variant={filter === filterType ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(filterType)}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            {filterType !== 'all' && (
              <Badge variant="secondary" className="ml-2">
                {alerts.filter(a => a.type === filterType).length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No alerts match the current filter
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border rounded-lg ${getAlertColor(alert.type)} ${
                    alert.acknowledged ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{alert.title}</h4>
                          <Badge variant={getBadgeVariant(alert.type)}>
                            {alert.type}
                          </Badge>
                          {alert.acknowledged && (
                            <Badge variant="outline">Acknowledged</Badge>
                          )}
                        </div>
                        <p className="text-sm mb-2">{alert.message}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{alert.source}</span>
                          <span>{alert.timestamp.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-4">
                      {!alert.acknowledged && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          Acknowledge
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissAlert(alert.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
