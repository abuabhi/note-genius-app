
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Play, Download, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface LoadTestResult {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  metrics: {
    totalRequests: number;
    avgResponseTime: number;
    p95ResponseTime: number;
    errorRate: number;
    throughput: number;
  };
}

export const LoadTestingDashboard = () => {
  const [testResults, setTestResults] = useState<LoadTestResult[]>([
    {
      id: '1',
      name: 'Artillery Load Test',
      status: 'completed',
      startTime: new Date(Date.now() - 3600000),
      endTime: new Date(Date.now() - 3000000),
      metrics: {
        totalRequests: 1250,
        avgResponseTime: 845,
        p95ResponseTime: 1200,
        errorRate: 2.4,
        throughput: 15.2
      }
    },
    {
      id: '2',
      name: 'Edge Functions Test',
      status: 'completed',
      startTime: new Date(Date.now() - 7200000),
      endTime: new Date(Date.now() - 6600000),
      metrics: {
        totalRequests: 300,
        avgResponseTime: 2100,
        p95ResponseTime: 4500,
        errorRate: 5.1,
        throughput: 3.8
      }
    }
  ]);
  
  const [isRunningTest, setIsRunningTest] = useState(false);

  const runLoadTest = useCallback(async (testType: string) => {
    setIsRunningTest(true);
    toast.info(`Starting ${testType} load test...`);
    
    try {
      // Simulate running a load test
      const newTest: LoadTestResult = {
        id: Date.now().toString(),
        name: testType,
        status: 'running',
        startTime: new Date(),
        metrics: {
          totalRequests: 0,
          avgResponseTime: 0,
          p95ResponseTime: 0,
          errorRate: 0,
          throughput: 0
        }
      };
      
      setTestResults(prev => [newTest, ...prev]);
      
      // Simulate test completion after 5 seconds
      setTimeout(() => {
        setTestResults(prev => prev.map(test => 
          test.id === newTest.id 
            ? {
                ...test,
                status: 'completed' as const,
                endTime: new Date(),
                metrics: {
                  totalRequests: Math.floor(Math.random() * 2000) + 500,
                  avgResponseTime: Math.floor(Math.random() * 1000) + 200,
                  p95ResponseTime: Math.floor(Math.random() * 2000) + 800,
                  errorRate: Math.random() * 5,
                  throughput: Math.random() * 20 + 5
                }
              }
            : test
        ));
        setIsRunningTest(false);
        toast.success(`${testType} completed successfully!`);
      }, 5000);
      
    } catch (error) {
      toast.error('Failed to run load test');
      setIsRunningTest(false);
    }
  }, []);

  const getStatusIcon = (status: LoadTestResult['status']) => {
    switch (status) {
      case 'running':
        return <Clock className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: LoadTestResult['status']) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
    }
  };

  const downloadReport = (testId: string) => {
    toast.info('Downloading load test report...');
    // In a real implementation, this would download the actual report
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Load Testing Control Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => runLoadTest('Artillery Load Test')}
              disabled={isRunningTest}
              className="flex items-center"
            >
              <Play className="h-4 w-4 mr-2" />
              Run Artillery Test
            </Button>
            <Button
              onClick={() => runLoadTest('K6 Performance Test')}
              disabled={isRunningTest}
              variant="outline"
              className="flex items-center"
            >
              <Play className="h-4 w-4 mr-2" />
              Run K6 Test
            </Button>
            <Button
              onClick={() => runLoadTest('Edge Functions Test')}
              disabled={isRunningTest}
              variant="outline"
              className="flex items-center"
            >
              <Play className="h-4 w-4 mr-2" />
              Run Edge Functions Test
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="results" className="space-y-4">
        <TabsList>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="trends">Historical Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Load Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(test.status)}
                      <div>
                        <h3 className="font-semibold">{test.name}</h3>
                        <p className="text-sm text-gray-600">
                          Started: {test.startTime.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={getStatusColor(test.status)}>
                        {test.status.toUpperCase()}
                      </Badge>
                      {test.status === 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadReport(test.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Report
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {testResults.filter(t => t.status === 'completed').slice(0, 1).map((test) => (
              <React.Fragment key={test.id}>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {test.metrics.totalRequests.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Total Requests</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {test.metrics.avgResponseTime.toFixed(0)}ms
                      </div>
                      <div className="text-sm text-gray-600">Avg Response Time</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {test.metrics.p95ResponseTime.toFixed(0)}ms
                      </div>
                      <div className="text-sm text-gray-600">95th Percentile</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${test.metrics.errorRate > 5 ? 'text-red-600' : 'text-green-600'}`}>
                        {test.metrics.errorRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Error Rate</div>
                    </div>
                  </CardContent>
                </Card>
              </React.Fragment>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Historical trend analysis will be available after running multiple tests</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
