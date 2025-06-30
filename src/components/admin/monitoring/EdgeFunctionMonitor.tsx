
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, AlertTriangle, CheckCircle, RefreshCw, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface EdgeFunctionMetrics {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  avgExecutionTime: number;
  coldStartFrequency: number;
  errorRate: number;
  invocationsLast24h: number;
  lastInvocation: Date;
}

export const EdgeFunctionMonitor = () => {
  const [functions, setFunctions] = useState<EdgeFunctionMetrics[]>([
    {
      name: 'enrich-note',
      status: 'healthy',
      avgExecutionTime: 2100,
      coldStartFrequency: 15,
      errorRate: 2.1,
      invocationsLast24h: 145,
      lastInvocation: new Date(Date.now() - 300000)
    },
    {
      name: 'generate-flashcards',
      status: 'warning',
      avgExecutionTime: 8500,
      coldStartFrequency: 45,
      errorRate: 5.2,
      invocationsLast24h: 89,
      lastInvocation: new Date(Date.now() - 600000)
    },
    {
      name: 'generate-quiz',
      status: 'healthy',
      avgExecutionTime: 6200,
      coldStartFrequency: 25,
      errorRate: 1.8,
      invocationsLast24h: 67,
      lastInvocation: new Date(Date.now() - 1200000)
    },
    {
      name: 'process-document',
      status: 'error',
      avgExecutionTime: 12000,
      coldStartFrequency: 80,
      errorRate: 12.5,
      invocationsLast24h: 23,
      lastInvocation: new Date(Date.now() - 1800000)
    }
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshMetrics = async () => {
    setIsRefreshing(true);
    try {
      // In a real implementation, this would fetch actual metrics
      // For now, simulate random updates
      setFunctions(prev => prev.map(func => ({
        ...func,
        avgExecutionTime: func.avgExecutionTime + (Math.random() - 0.5) * 1000,
        errorRate: Math.max(0, func.errorRate + (Math.random() - 0.5) * 2),
        invocationsLast24h: func.invocationsLast24h + Math.floor(Math.random() * 10),
        lastInvocation: new Date()
      })));
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = (status: EdgeFunctionMetrics['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: EdgeFunctionMetrics['status']) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
    }
  };

  const testFunction = async (functionName: string) => {
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { test: true }
      });
      
      if (error) {
        console.error(`Error testing ${functionName}:`, error);
      } else {
        console.log(`${functionName} test successful:`, data);
      }
    } catch (error) {
      console.error(`Failed to test ${functionName}:`, error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Edge Functions Monitor
            </CardTitle>
            <Button
              onClick={refreshMetrics}
              disabled={isRefreshing}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {functions.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Functions</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {functions.filter(f => f.status === 'healthy').length}
                  </div>
                  <div className="text-sm text-gray-600">Healthy</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {functions.filter(f => f.status === 'warning').length}
                  </div>
                  <div className="text-sm text-gray-600">Warnings</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {functions.filter(f => f.status === 'error').length}
                  </div>
                  <div className="text-sm text-gray-600">Errors</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="logs">Recent Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {functions.map((func) => (
              <Card key={func.name}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(func.status)}
                      <div>
                        <h3 className="font-semibold">{func.name}</h3>
                        <p className="text-sm text-gray-600">
                          Last invocation: {func.lastInvocation.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={getStatusColor(func.status)}>
                        {func.status.toUpperCase()}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testFunction(func.name)}
                      >
                        Test Function
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold">{func.avgExecutionTime.toFixed(0)}ms</div>
                      <div className="text-xs text-gray-600">Avg Execution</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">{func.errorRate.toFixed(1)}%</div>
                      <div className="text-xs text-gray-600">Error Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">{func.coldStartFrequency}%</div>
                      <div className="text-xs text-gray-600">Cold Starts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">{func.invocationsLast24h}</div>
                      <div className="text-xs text-gray-600">24h Invocations</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  Functions with performance concerns:
                </div>
                {functions
                  .filter(f => f.avgExecutionTime > 5000 || f.errorRate > 5)
                  .map(func => (
                    <div key={func.name} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-yellow-800">{func.name}</h4>
                          <p className="text-sm text-yellow-700">
                            {func.avgExecutionTime > 5000 && 'Slow execution time detected. '}
                            {func.errorRate > 5 && 'High error rate detected.'}
                          </p>
                        </div>
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Function Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Function logs will appear here. Check the Supabase dashboard for detailed logs.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
