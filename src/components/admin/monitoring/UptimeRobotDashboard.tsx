import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import UptimeRobotMonitorManager from './UptimeRobotMonitorManager';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Globe, 
  RefreshCw, 
  TrendingUp,
  Zap
} from 'lucide-react';

interface Monitor {
  id: string;
  friendly_name: string;
  url: string;
  status: number;
  type: number;
  interval: number;
  create_datetime: number;
  response_times: Array<{
    datetime: number;
    value: number;
  }>;
  logs: Array<{
    type: number;
    datetime: number;
    duration: number;
  }>;
  all_time_uptime_ratio: string;
  custom_uptime_ratio: string;
}

interface AccountDetails {
  email: string;
  monitor_limit: number;
  monitor_interval: number;
  up_monitors: number;
  down_monitors: number;
  paused_monitors: number;
}

const UptimeRobotDashboard = () => {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const getStatusColor = (status: number) => {
    switch (status) {
      case 2: return 'bg-green-500';
      case 9: return 'bg-red-500';
      case 1: return 'bg-yellow-500';
      case 0: return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 2: return 'Up';
      case 9: return 'Down';
      case 1: return 'Paused';
      case 0: return 'Not checked yet';
      default: return 'Unknown';
    }
  };

  const formatUptime = (ratio: string) => {
    return `${parseFloat(ratio).toFixed(2)}%`;
  };

  const formatResponseTime = (time: number) => {
    return `${time}ms`;
  };

  const fetchData = async () => {
    try {
      const { data: monitorsData, error: monitorsError } = await supabase.functions.invoke('uptimerobot-api', {
        body: { action: 'getMonitors' }
      });

      if (monitorsError) throw monitorsError;

      const { data: accountData, error: accountError } = await supabase.functions.invoke('uptimerobot-api', {
        body: { action: 'getAccountDetails' }
      });

      if (accountError) throw accountError;

      if (monitorsData?.success && monitorsData.data?.monitors) {
        setMonitors(monitorsData.data.monitors);
      }

      if (accountData?.success && accountData.data?.account) {
        setAccountDetails(accountData.data.account);
      }

    } catch (error) {
      console.error('Error fetching UptimeRobot data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch UptimeRobot data",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast({
      title: "Refreshed",
      description: "UptimeRobot data updated successfully",
    });
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">UptimeRobot Monitoring</h2>
            <p className="text-muted-foreground">Website uptime and performance monitoring</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalMonitors = monitors.length;
  const upMonitors = monitors.filter(m => m.status === 2).length;
  const downMonitors = monitors.filter(m => m.status === 9).length;
  const avgUptime = monitors.length > 0 
    ? monitors.reduce((acc, m) => acc + parseFloat(m.all_time_uptime_ratio || '0'), 0) / monitors.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">UptimeRobot Monitoring</h2>
          <p className="text-muted-foreground">Website uptime and performance monitoring</p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Monitors</p>
                <p className="text-2xl font-bold">{totalMonitors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Up</p>
                <p className="text-2xl font-bold text-green-600">{upMonitors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Down</p>
                <p className="text-2xl font-bold text-red-600">{downMonitors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Uptime</p>
                <p className="text-2xl font-bold">{formatUptime(avgUptime.toString())}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="monitors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="monitors">Monitors</TabsTrigger>
          <TabsTrigger value="manage">Manage</TabsTrigger>
        </TabsList>

        <TabsContent value="monitors">
          <div className="grid gap-4">
            {monitors.map((monitor) => (
              <Card key={monitor.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(monitor.status)}`} />
                      <div>
                        <CardTitle className="text-lg">{monitor.friendly_name}</CardTitle>
                        <CardDescription>{monitor.url}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={monitor.status === 2 ? "default" : "destructive"}>
                      {getStatusText(monitor.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">All-time Uptime</p>
                      <p className="font-semibold">{formatUptime(monitor.all_time_uptime_ratio)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">30-day Uptime</p>
                      <p className="font-semibold">{formatUptime(monitor.custom_uptime_ratio)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Check Interval</p>
                      <p className="font-semibold">{monitor.interval / 60} min</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Latest Response</p>
                      <p className="font-semibold">
                        {monitor.response_times?.[0] 
                          ? formatResponseTime(monitor.response_times[0].value)
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>
                  
                  {monitor.logs && monitor.logs.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <h4 className="font-medium mb-2 flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Recent Events
                        </h4>
                        <div className="space-y-1">
                          {monitor.logs.slice(0, 3).map((log, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                {new Date(log.datetime * 1000).toLocaleString()}
                              </span>
                              <Badge variant={log.type === 2 ? "default" : "destructive"} className="text-xs">
                                {log.type === 2 ? 'Up' : 'Down'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {monitors.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No monitors configured yet.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Use the Manage tab to create your first monitor.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="manage">
          <UptimeRobotMonitorManager onMonitorChange={fetchData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UptimeRobotDashboard;