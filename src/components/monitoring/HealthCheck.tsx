
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Database, Globe, Zap, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { config, logger } from '@/config/environment';

interface HealthStatus {
  database: 'healthy' | 'warning' | 'error';
  api: 'healthy' | 'warning' | 'error';
  cache: 'healthy' | 'warning' | 'error';
  lastChecked: Date;
}

export const HealthCheck = () => {
  const [health, setHealth] = useState<HealthStatus>({
    database: 'healthy',
    api: 'healthy',
    cache: 'healthy',
    lastChecked: new Date()
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkDatabaseHealth = async (): Promise<'healthy' | 'warning' | 'error'> => {
    try {
      const start = performance.now();
      const { error } = await supabase.from('profiles').select('count').limit(1);
      const duration = performance.now() - start;
      
      if (error) return 'error';
      if (duration > 2000) return 'warning'; // Slow response
      return 'healthy';
    } catch (error) {
      logger.error('Database health check failed:', error);
      return 'error';
    }
  };

  const checkApiHealth = async (): Promise<'healthy' | 'warning' | 'error'> => {
    try {
      const start = performance.now();
      const response = await fetch(`${config.supabase.url}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': config.supabase.anonKey
        }
      });
      const duration = performance.now() - start;
      
      if (!response.ok) return 'error';
      if (duration > 1000) return 'warning';
      return 'healthy';
    } catch (error) {
      logger.error('API health check failed:', error);
      return 'error';
    }
  };

  const checkCacheHealth = (): 'healthy' | 'warning' | 'error' => {
    try {
      // Check if localStorage is available (cache persistence)
      if (config.cache.enablePersistence) {
        localStorage.setItem('health-check', 'test');
        localStorage.removeItem('health-check');
      }
      
      // Check memory usage if available
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        if (usedMB > 100) return 'warning'; // High memory usage
      }
      
      return 'healthy';
    } catch (error) {
      logger.error('Cache health check failed:', error);
      return 'error';
    }
  };

  const performHealthCheck = async () => {
    setIsChecking(true);
    logger.info('Performing health check...');
    
    try {
      const [databaseStatus, apiStatus] = await Promise.all([
        checkDatabaseHealth(),
        checkApiHealth()
      ]);
      
      const cacheStatus = checkCacheHealth();
      
      setHealth({
        database: databaseStatus,
        api: apiStatus,
        cache: cacheStatus,
        lastChecked: new Date()
      });
      
      logger.info('Health check completed:', { databaseStatus, apiStatus, cacheStatus });
    } catch (error) {
      logger.error('Health check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    performHealthCheck();
    
    // Run health check every 5 minutes
    const interval = setInterval(performHealthCheck, 5 * 60 * 1000);
    
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
      case 'healthy': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            System Health
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={performHealthCheck}
            disabled={isChecking}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Database Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="text-sm">Database</span>
          </div>
          <Badge className={getStatusColor(health.database)}>
            {getStatusIcon(health.database)} {health.database}
          </Badge>
        </div>

        {/* API Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="text-sm">API</span>
          </div>
          <Badge className={getStatusColor(health.api)}>
            {getStatusIcon(health.api)} {health.api}
          </Badge>
        </div>

        {/* Cache Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="text-sm">Cache</span>
          </div>
          <Badge className={getStatusColor(health.cache)}>
            {getStatusIcon(health.cache)} {health.cache}
          </Badge>
        </div>

        {/* Environment Info */}
        <div className="pt-2 border-t text-xs text-gray-500">
          <div>Environment: {config.name}</div>
          <div>Last checked: {health.lastChecked.toLocaleTimeString()}</div>
        </div>
      </CardContent>
    </Card>
  );
};
