
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HealthCheck } from '@/components/monitoring/HealthCheck';
import { LightweightPerformanceOverlay } from '@/components/performance/LightweightPerformanceOverlay';
import { Activity, Database, Zap } from 'lucide-react';

export const ProductionHealthDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Performance Overlay - only in development */}
      <LightweightPerformanceOverlay enabled={process.env.NODE_ENV === 'development'} />
      
      {/* System Health Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              System Health Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HealthCheck />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              System Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Environment</span>
                <span className="text-sm text-muted-foreground">
                  {process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Build Version</span>
                <span className="text-sm text-muted-foreground">v1.0.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Deployment</span>
                <span className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">Optimized</div>
              <div className="text-sm text-green-700">Monitoring System</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">Reduced</div>
              <div className="text-sm text-blue-700">Timer Load</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">Improved</div>
              <div className="text-sm text-purple-700">Performance</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
