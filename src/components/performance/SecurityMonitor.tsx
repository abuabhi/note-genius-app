
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSecurityValidation } from '@/hooks/performance/useSecurityValidation';
import { Shield, AlertTriangle, Activity, Lock, Eye, EyeOff } from 'lucide-react';

export const SecurityMonitor = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { getSecurityMetrics, resetMetrics } = useSecurityValidation();
  const [metrics, setMetrics] = useState(getSecurityMetrics());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(getSecurityMetrics());
    }, 5000);

    return () => clearInterval(interval);
  }, [getSecurityMetrics]);

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        <Shield className="h-4 w-4 mr-2" />
        Security Monitor
      </Button>
    );
  }

  const getSecurityStatus = () => {
    if (metrics.blockedRequests > 0) return 'warning';
    if (metrics.suspiciousActivity.length > 0) return 'alert';
    return 'secure';
  };

  const status = getSecurityStatus();

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Security Monitor
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
            >
              ×
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Status:</span>
          <Badge variant={status === 'secure' ? 'default' : status === 'warning' ? 'secondary' : 'destructive'}>
            {status === 'secure' && <Lock className="h-3 w-3 mr-1" />}
            {status === 'warning' && <AlertTriangle className="h-3 w-3 mr-1" />}
            {status === 'alert' && <AlertTriangle className="h-3 w-3 mr-1" />}
            {status.toUpperCase()}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span>Requests:</span>
            <span>{metrics.requestCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Blocked:</span>
            <span className="text-red-600">{metrics.blockedRequests}</span>
          </div>
        </div>

        {showDetails && (
          <div className="space-y-2">
            <div className="text-xs">
              <div className="flex justify-between mb-1">
                <span>Suspicious Activity:</span>
                <Badge variant="outline" className="text-xs">
                  {metrics.suspiciousActivity.length}
                </Badge>
              </div>
              
              {metrics.suspiciousActivity.length > 0 && (
                <div className="max-h-20 overflow-y-auto bg-muted p-2 rounded text-xs">
                  {metrics.suspiciousActivity.slice(-3).map((activity, index) => (
                    <div key={index} className="text-xs text-muted-foreground">
                      {activity}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground">
              Last Reset: {new Date(metrics.lastReset).toLocaleTimeString()}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetMetrics}
            className="flex-1 text-xs"
          >
            <Activity className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
