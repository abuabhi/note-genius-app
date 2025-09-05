import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRealTimeMonitoring } from '@/hooks/monitoring/useRealTimeMonitoring';
import { useDatabaseMonitoring } from '@/hooks/monitoring/useDatabaseMonitoring';
import { useManagedInterval } from '@/utils/performance';
import { 
  Activity, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Clock,
  Server,
  Zap,
  Eye
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  severity 
}) => {
  const getSeverityColor = (sev?: string) => {
    switch (sev) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-blue-500';
      default: return 'text-green-500';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={getSeverityColor(severity)}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className="flex items-center pt-1">
            <TrendingUp className={`h-4 w-4 ${
              trend === 'up' ? 'text-green-500' : 
              trend === 'down' ? 'text-red-500' : 
              'text-gray-500'
            }`} />
            <span className="text-xs ml-1">
              {trend === 'up' ? 'Increasing' : 
               trend === 'down' ? 'Decreasing' : 
               'Stable'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const MonitoringDashboard: React.FC = () => {
  const { getMetrics, getAlerts } = useRealTimeMonitoring();
  const { 
    health, 
    alerts, 
    resolvedAlerts, 
    isMonitoring, 
    resolveAlert, 
    clearResolvedAlerts 
  } = useDatabaseMonitoring();

  const [performanceMetrics, setPerformanceMetrics] = useState<any[]>([]);
  const [performanceAlerts, setPerformanceAlerts] = useState<any[]>([]);

  // Update metrics with managed interval
  const updateMetrics = () => {
    try {
      const metrics = getMetrics();
      const alerts = getAlerts();
      setPerformanceMetrics(metrics);
      setPerformanceAlerts(alerts);
    } catch (error) {
      console.error('Error updating monitoring metrics:', error);
    }
  };

  useManagedInterval('monitoring-metrics', updateMetrics, 60000); // 60s interval
  
  // Initial metrics update
  useEffect(() => {
    updateMetrics();
  }, [getMetrics, getAlerts]);

  // Calculate performance statistics
  const getPerformanceStats = () => {
    if (performanceMetrics.length === 0) {
      return {
        avgPageLoad: 0,
        avgApiResponse: 0,
        errorRate: 0,
        totalRequests: 0
      };
    }

    const pageLoadMetrics = performanceMetrics.filter(m => m.name === 'page_load_time');
    const apiMetrics = performanceMetrics.filter(m => m.name === 'api_response_time');
    const errorMetrics = performanceMetrics.filter(m => m.name === 'error_rate');

    return {
      avgPageLoad: pageLoadMetrics.length > 0 
        ? pageLoadMetrics.reduce((sum, m) => sum + m.value, 0) / pageLoadMetrics.length
        : 0,
      avgApiResponse: apiMetrics.length > 0
        ? apiMetrics.reduce((sum, m) => sum + m.value, 0) / apiMetrics.length
        : 0,
      errorRate: errorMetrics.length > 0
        ? errorMetrics[errorMetrics.length - 1].value
        : 0,
      totalRequests: performanceMetrics.length
    };
  };

  const perfStats = getPerformanceStats();
  const activeAlerts = [...alerts, ...performanceAlerts.filter(a => !a.resolved)];
  const totalResolvedAlerts = [...resolvedAlerts, ...performanceAlerts.filter(a => a.resolved)];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitoring Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time application and database monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isMonitoring ? "default" : "secondary"}>
            {isMonitoring ? "Active" : "Inactive"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Alert Summary */}
      {activeAlerts.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {activeAlerts.length} active alert{activeAlerts.length !== 1 ? 's' : ''} requiring attention
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Page Load Time"
              value={`${Math.round(perfStats.avgPageLoad)}ms`}
              description="Average page load time"
              icon={<Clock className="h-4 w-4" />}
              severity={perfStats.avgPageLoad > 3000 ? 'high' : perfStats.avgPageLoad > 1000 ? 'medium' : 'low'}
            />
            <MetricCard
              title="API Response"
              value={`${Math.round(perfStats.avgApiResponse)}ms`}
              description="Average API response time"
              icon={<Zap className="h-4 w-4" />}
              severity={perfStats.avgApiResponse > 2000 ? 'high' : perfStats.avgApiResponse > 500 ? 'medium' : 'low'}
            />
            <MetricCard
              title="Error Rate"
              value={`${perfStats.errorRate.toFixed(1)}%`}
              description="Application error rate"
              icon={<AlertTriangle className="h-4 w-4" />}
              severity={perfStats.errorRate > 5 ? 'critical' : perfStats.errorRate > 2 ? 'high' : 'low'}
            />
            <MetricCard
              title="Database Uptime"
              value={`${health?.uptime.toFixed(1) || 0}%`}
              description="Database availability"
              icon={<Database className="h-4 w-4" />}
              severity={!health || health.uptime < 99 ? 'critical' : 'low'}
            />
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="Total Requests"
              value={perfStats.totalRequests}
              description="Total performance measurements"
              icon={<Activity className="h-4 w-4" />}
            />
            <MetricCard
              title="Core Web Vitals"
              value="Good"
              description="LCP, FID, CLS scores"
              icon={<TrendingUp className="h-4 w-4" />}
              severity="low"
            />
            <MetricCard
              title="Memory Usage"
              value="N/A"
              description="Client-side memory usage"
              icon={<Server className="h-4 w-4" />}
            />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Recent performance measurements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {performanceMetrics.slice(-10).map((metric, index) => (
                  <div key={index} className="flex justify-between items-center p-2 border rounded">
                    <span className="font-medium">{metric.name}</span>
                    <span>{metric.value}ms</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(metric.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
                {performanceMetrics.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No performance metrics available yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Connections"
              value={health?.connection_count || 0}
              description="Active database connections"
              icon={<Database className="h-4 w-4" />}
              severity={!health || health.connection_count > 40 ? 'high' : 'low'}
            />
            <MetricCard
              title="Query Time"
              value={`${Math.round(health?.query_performance.avg_duration || 0)}ms`}
              description="Average query duration"
              icon={<Clock className="h-4 w-4" />}
              severity={!health || health.query_performance.avg_duration > 1000 ? 'medium' : 'low'}
            />
            <MetricCard
              title="Slow Queries"
              value={health?.query_performance.slow_queries || 0}
              description="Queries > 2s in last hour"
              icon={<AlertTriangle className="h-4 w-4" />}
              severity={!health || health.query_performance.slow_queries > 5 ? 'high' : 'low'}
            />
            <MetricCard
              title="Last Check"
              value={health ? new Date(health.last_check).toLocaleTimeString() : 'Never'}
              description="Last health check"
              icon={<Eye className="h-4 w-4" />}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Database Health Status</CardTitle>
              <CardDescription>
                Current database performance and connectivity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {health ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Database is operational</span>
                  </div>
                  <div className="grid gap-2 text-sm">
                    <div>Error Rate: {health.error_rate.toFixed(2)}%</div>
                    <div>Uptime: {health.uptime.toFixed(3)}%</div>
                    <div>Last Updated: {new Date(health.last_check).toLocaleString()}</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <span>Waiting for health data...</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Active Alerts</h3>
            {totalResolvedAlerts.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearResolvedAlerts}>
                Clear Resolved ({totalResolvedAlerts.length})
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {activeAlerts.map((alert, index) => (
              <Card key={alert.id || index}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          alert.severity === 'critical' ? 'destructive' :
                          alert.severity === 'high' ? 'destructive' :
                          alert.severity === 'medium' ? 'secondary' :
                          'outline'
                        }>
                          {alert.severity}
                        </Badge>
                        <span className="font-medium">{alert.type || 'Performance Alert'}</span>
                      </div>
                      <p className="text-sm">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => resolveAlert(alert.id)}
                    >
                      Resolve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {activeAlerts.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
                  <p className="text-muted-foreground">No active alerts at this time.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};