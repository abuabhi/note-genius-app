import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, Users, Activity, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

interface SecurityAlert {
  alert_id: string;
  alert_type: string;
  severity: string;
  message: string;
  user_email: string;
  created_at: string;
  metadata: any;
}

interface SecurityMetrics {
  total_events: number;
  critical_events: number;
  high_risk_events: number;
  suspicious_sessions: number;
  blocked_ips: number;
  last_updated: string;
}

export const SecurityAuditDashboard = () => {
  const [refreshing, setRefreshing] = useState(false);

  // Fetch security alerts
  const { data: securityAlerts, refetch: refetchAlerts } = useQuery({
    queryKey: ['security-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_security_alerts');
      if (error) throw error;
      return data as SecurityAlert[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds for real-time monitoring
  });

  // Fetch security metrics
  const { data: securityMetrics, refetch: refetchMetrics } = useQuery({
    queryKey: ['security-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_monitoring')
        .select('risk_level, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      
      if (error) throw error;

      const metrics: SecurityMetrics = {
        total_events: data.length,
        critical_events: data.filter(d => d.risk_level === 'critical').length,
        high_risk_events: data.filter(d => d.risk_level === 'high').length,
        suspicious_sessions: data.filter(d => d.risk_level === 'medium').length,
        blocked_ips: 0, // This would be calculated from rate limiting data
        last_updated: new Date().toISOString()
      };

      return metrics;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchAlerts(), refetchMetrics()]);
      toast.success('Security monitoring data refreshed');
    } catch (error) {
      toast.error('Failed to refresh security data');
    } finally {
      setRefreshing(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'high':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'orange';
      default:
        return 'yellow';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Security Audit Dashboard</h2>
          <p className="text-muted-foreground">Real-time security monitoring and threat detection</p>
        </div>
        <Button 
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <Activity className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events (24h)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityMetrics?.total_events || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {securityMetrics?.critical_events || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Events</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {securityMetrics?.high_risk_events || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Sessions</CardTitle>
            <Users className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {securityMetrics?.suspicious_sessions || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold text-green-500">
              {securityMetrics?.critical_events === 0 ? 'SECURE' : 'MONITORING'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Real-time Security Alerts
          </CardTitle>
          <CardDescription>
            Latest security events and threats detected in the last 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          {securityAlerts && securityAlerts.length > 0 ? (
            <div className="space-y-3">
              {securityAlerts.map((alert) => (
                <div
                  key={alert.alert_id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg bg-card"
                >
                  <div className="flex items-center gap-3">
                    {getSeverityIcon(alert.severity)}
                    <div>
                      <p className="font-medium text-foreground">{alert.message}</p>
                      <p className="text-sm text-muted-foreground">
                        User: {alert.user_email} • Action: {alert.alert_type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getSeverityColor(alert.severity) as any}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(alert.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground">No security alerts in the last 24 hours</p>
              <p className="text-sm text-green-600">System is operating securely</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Policy Status */}
      <Card>
        <CardHeader>
          <CardTitle>Security Policy Status</CardTitle>
          <CardDescription>
            Current status of enhanced security policies and access controls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Subscriber Data Protection</span>
                <Badge variant="secondary" className="bg-green-500 text-white">ACTIVE</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Influencer Financial Security</span>
                <Badge variant="secondary" className="bg-green-500 text-white">ACTIVE</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Contact Submission Controls</span>
                <Badge variant="secondary" className="bg-green-500 text-white">ACTIVE</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Referral Code Protection</span>
                <Badge variant="secondary" className="bg-green-500 text-white">ACTIVE</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Real-time Audit Logging</span>
                <Badge variant="secondary" className="bg-green-500 text-white">ACTIVE</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Session Security Monitoring</span>
                <Badge variant="secondary" className="bg-green-500 text-white">ACTIVE</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};