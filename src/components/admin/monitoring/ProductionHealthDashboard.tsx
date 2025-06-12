
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Activity, Database, Globe, Zap, RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SystemHealth {
  database: 'healthy' | 'warning' | 'error';
  api: 'healthy' | 'warning' | 'error';
  cache: 'healthy' | 'warning' | 'error';
  memory: 'healthy' | 'warning' | 'error';
  lastChecked: Date;
  metrics: {
    dbResponseTime: number;
    apiResponseTime: number;
    memoryUsage: number;
    cacheHitRate: number;
  };
}

export const ProductionHealthDashboard = () => {
  const [health, setHealth] = useState<SystemHealth>({
    database: 'healthy',
    api: 'healthy',
    cache: 'healthy',
    memory: 'healthy',
    lastChecked: new Date(),
    metrics: {
      dbResponseTime: 0,
      apiResponseTime: 0,
      memoryUsage: 0,
      cacheHitRate: 0
    }
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkDatabaseHealth = async (): Promise<{ status: 'healthy' | 'warning' | 'error', responseTime: number }> => {
    try {
      const start = performance.now();
      const { error } = await supabase.from('profiles').select('count').limit(1);
      const responseTime = performance.now() - start;
      
      if (error) return { status: 'error', responseTime };
      if (responseTime > 2000) return { status: 'warning', responseTime };
      return { status: 'healthy', responseTime };
    } catch (error) {
      console.error('Database health check failed:', error);
      return { status: 'error', responseTime: 0 };
    }
  };

  const checkApiHealth = async (): Promise<{ status: 'healthy' | 'warning' | 'error', responseTime: number }> => {
    try {
      const start = performance.now();
      const response = await fetch('/api/health', { method: 'HEAD' });
      const responseTime = performance.now() - start;
      
      if (!response.ok) return { status: 'error', responseTime };
      if (responseTime > 1000) return { status: 'warning', responseTime };
      return { status: 'healthy', responseTime };
    } catch (error) {
      console.error('API health check failed:', error);
      return { status: 'error', responseTime: 0 };
    }
  };

  const checkMemoryHealth = (): { status: 'healthy' | 'warning' | 'error', usage: number } => {
    try {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        
        if (usedMB > 200) return { status: 'error', usage: usedMB };
        if (usedMB > 100) return { status: 'warning', usage: usedMB };
        return { status: 'healthy', usage: usedMB };
      }
      return { status: 'healthy', usage: 0 };
    } catch (error) {
      console.error('Memory health check failed:', error);
      return { status: 'error', usage: 0 };
    }
  };

  const checkCacheHealth = (): { status: 'healthy' | 'warning' | 'error', hitRate: number } => {
    try {
      // Mock cache health check - in production this would check actual cache metrics
      const hitRate = Math.random() * 100; // Replace with actual cache hit rate
      
      if (hitRate < 50) return { status: 'error', hitRate };
      if (hitRate < 70) return { status: 'warning', hitRate };
      return { status: 'healthy', hitRate };
    } catch (error) {
      console.error('Cache health check failed:', error);
      return { status: 'error', hitRate: 0 };
    }
  };

  const performHealthCheck = async () => {
    setIsChecking(true);
    console.log('Performing comprehensive health check...');
    
    try {
      const [dbHealth, apiHealth] = await Promise.all([
        checkDatabaseHealth(),
        checkApiHealth()
      ]);
      
      const memoryHealth = checkMemoryHealth();
      const cacheHealth = checkCacheHealth();
      
      setHealth({
        database: dbHealth.status,
        api: apiHealth.status,
        cache: cacheHealth.status,
        memory: memoryHealth.status,
        lastChecked: new Date(),
        metrics: {
          dbResponseTime: dbHealth.responseTime,
          apiResponseTime: apiHealth.responseTime,
          memoryUsage: memoryHealth.usage,
          cacheHitRate: cacheHealth.hitRate
        }
      });
      
      console.log('Health check completed:', { dbHealth, apiHealth, memoryHealth, cacheHealth });
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    performHealthCheck();
    
    // Run health check every 2 minutes in production
    const interval = setInterval(performHealthCheck, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
    }
  };

  const getStatusIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const getOverallStatus = () => {
    const statuses = [health.database, health.api, health.cache, health.memory];
    if (statuses.includes('error')) return 'error';
    if (statuses.includes('warning')) return 'warning';
    return 'healthy';
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Status
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(overallStatus)}>
                {getStatusIcon(overallStatus)}
                <span className="ml-1 capitalize">{overallStatus}</span>
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={performHealthCheck}
                disabled={isChecking}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500">
            Last checked: {health.lastChecked.toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>

      {/* Individual Health Checks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Database Health */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Database
              </div>
              {getStatusIcon(health.database)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(health.database)}>
              {health.database}
            </Badge>
            <div className="text-xs text-muted-foreground mt-2">
              Response: {health.metrics.dbResponseTime.toFixed(0)}ms
            </div>
          </CardContent>
        </Card>

        {/* API Health */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                API
              </div>
              {getStatusIcon(health.api)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(health.api)}>
              {health.api}
            </Badge>
            <div className="text-xs text-muted-foreground mt-2">
              Response: {health.metrics.apiResponseTime.toFixed(0)}ms
            </div>
          </CardContent>
        </Card>

        {/* Memory Health */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Memory
              </div>
              {getStatusIcon(health.memory)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(health.memory)}>
              {health.memory}
            </Badge>
            <div className="text-xs text-muted-foreground mt-2">
              Usage: {health.metrics.memoryUsage.toFixed(1)}MB
            </div>
          </CardContent>
        </Card>

        {/* Cache Health */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Cache
              </div>
              {getStatusIcon(health.cache)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(health.cache)}>
              {health.cache}
            </Badge>
            <div className="text-xs text-muted-foreground mt-2">
              Hit Rate: {health.metrics.cacheHitRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Database Response Time</span>
              <span>{health.metrics.dbResponseTime.toFixed(0)}ms</span>
            </div>
            <Progress 
              value={Math.min((health.metrics.dbResponseTime / 2000) * 100, 100)} 
              className="h-2"
            />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Memory Usage</span>
              <span>{health.metrics.memoryUsage.toFixed(1)}MB</span>
            </div>
            <Progress 
              value={Math.min((health.metrics.memoryUsage / 200) * 100, 100)} 
              className="h-2"
            />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Cache Hit Rate</span>
              <span>{health.metrics.cacheHitRate.toFixed(1)}%</span>
            </div>
            <Progress 
              value={health.metrics.cacheHitRate} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
