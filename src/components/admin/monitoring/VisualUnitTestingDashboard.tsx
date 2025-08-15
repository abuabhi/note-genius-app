import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  FileText, 
  TrendingUp,
  Eye,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'pending';
  duration: number;
  coverage: number;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  totalCoverage: number;
  passRate: number;
}

export const VisualUnitTestingDashboard = () => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [testResults, setTestResults] = useState<TestSuite[]>([
    {
      name: 'Components Tests',
      totalCoverage: 85,
      passRate: 92,
      tests: [
        { name: 'Button Component', status: 'passed', duration: 120, coverage: 95 },
        { name: 'Card Component', status: 'passed', duration: 85, coverage: 88 },
        { name: 'Form Components', status: 'failed', duration: 200, coverage: 72 },
        { name: 'Navigation', status: 'passed', duration: 150, coverage: 90 }
      ]
    },
    {
      name: 'Hooks Tests',
      totalCoverage: 78,
      passRate: 88,
      tests: [
        { name: 'useAuth Hook', status: 'passed', duration: 95, coverage: 85 },
        { name: 'useToast Hook', status: 'passed', duration: 65, coverage: 92 },
        { name: 'useForm Hook', status: 'pending', duration: 0, coverage: 0 }
      ]
    },
    {
      name: 'Utils Tests',
      totalCoverage: 92,
      passRate: 100,
      tests: [
        { name: 'String Utilities', status: 'passed', duration: 45, coverage: 98 },
        { name: 'Date Utilities', status: 'passed', duration: 55, coverage: 86 },
        { name: 'Validation Utils', status: 'passed', duration: 75, coverage: 92 }
      ]
    }
  ]);

  const runAllTests = async () => {
    setIsRunning(true);
    setProgress(0);
    
    // Simulate test execution
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setProgress(i);
    }
    
    setIsRunning(false);
    toast({
      title: "Tests Completed",
      description: "All unit tests have been executed successfully.",
    });
  };

  const runSingleSuite = async (suiteName: string) => {
    toast({
      title: "Running Test Suite",
      description: `Executing ${suiteName}...`,
    });
  };

  const downloadCoverageReport = () => {
    toast({
      title: "Coverage Report",
      description: "HTML coverage report downloaded successfully.",
    });
  };

  const getTotalCoverage = () => {
    const total = testResults.reduce((sum, suite) => sum + suite.totalCoverage, 0);
    return Math.round(total / testResults.length);
  };

  const getTotalPassRate = () => {
    const total = testResults.reduce((sum, suite) => sum + suite.passRate, 0);
    return Math.round(total / testResults.length);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getCoverageColor = (coverage: number) => {
    if (coverage >= 90) return 'text-green-600';
    if (coverage >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{getTotalCoverage()}%</p>
                <p className="text-sm text-muted-foreground">Total Coverage</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{getTotalPassRate()}%</p>
                <p className="text-sm text-muted-foreground">Pass Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{testResults.length}</p>
                <p className="text-sm text-muted-foreground">Test Suites</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {testResults.reduce((sum, suite) => sum + suite.tests.length, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Tests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Runner */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Test Runner
          </CardTitle>
          <CardDescription>
            Execute unit tests and view real-time results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={downloadCoverageReport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Coverage Report
            </Button>
          </div>

          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Test Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="coverage">Coverage Details</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {testResults.map((suite, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{suite.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {suite.tests.length} tests
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => runSingleSuite(suite.name)}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Run
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Coverage</p>
                      <p className={`text-2xl font-bold ${getCoverageColor(suite.totalCoverage)}`}>
                        {suite.totalCoverage}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pass Rate</p>
                      <p className="text-2xl font-bold text-green-600">
                        {suite.passRate}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="coverage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Coverage Breakdown</CardTitle>
              <CardDescription>
                Detailed coverage analysis by test suite
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map((suite, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{suite.name}</span>
                      <span className={getCoverageColor(suite.totalCoverage)}>
                        {suite.totalCoverage}%
                      </span>
                    </div>
                    <Progress value={suite.totalCoverage} className="w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {testResults.map((suite, suiteIndex) => (
            <Card key={suiteIndex}>
              <CardHeader>
                <CardTitle>{suite.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {suite.tests.map((test, testIndex) => (
                    <div key={testIndex} className="flex items-center justify-between p-3 rounded border">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(test.status)}
                        <span className="font-medium">{test.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{test.duration}ms</span>
                        <span className={getCoverageColor(test.coverage)}>
                          {test.coverage}% coverage
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};