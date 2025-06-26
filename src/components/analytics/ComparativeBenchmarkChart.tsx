
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useComparativeBenchmarks } from '@/hooks/analytics/useComparativeBenchmarks';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const ComparativeBenchmarkChart: React.FC = () => {
  const { benchmarks, isLoading } = useComparativeBenchmarks();

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'above': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'below': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'above': return 'text-green-600 bg-green-100';
      case 'below': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const radarData = benchmarks.map(benchmark => ({
    metric: benchmark.metric.replace(' ', '\n'),
    percentile: benchmark.percentile,
    fullMark: 100
  }));

  const barData = benchmarks.map(benchmark => ({
    metric: benchmark.metric,
    user: benchmark.userValue,
    benchmark: benchmark.benchmarkValue,
    percentile: benchmark.percentile
  }));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Performance Benchmarks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (benchmarks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Performance Benchmarks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No benchmark data available yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Complete more study sessions to see comparisons
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          Performance Benchmarks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Radar Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tick={{ fontSize: 10 }}
                />
                <Radar
                  name="Your Percentile"
                  dataKey="percentile"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Breakdown */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Detailed Comparison</h4>
            {benchmarks.map((benchmark, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getTrendIcon(benchmark.trend)}
                    <span className="font-medium">{benchmark.metric}</span>
                    <Badge className={getTrendColor(benchmark.trend)}>
                      {benchmark.percentile}th percentile
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Your Performance</p>
                    <p className="font-semibold text-blue-600">
                      {typeof benchmark.userValue === 'number' && benchmark.userValue % 1 !== 0
                        ? benchmark.userValue.toFixed(1)
                        : benchmark.userValue
                      }
                      {benchmark.metric.includes('Accuracy') || benchmark.metric.includes('Rate') || benchmark.metric.includes('Consistency') ? '%' : 
                       benchmark.metric.includes('Hours') ? ' hrs' :
                       benchmark.metric.includes('Velocity') ? ' cards/hr' : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Average</p>
                    <p className="font-semibold text-gray-700">
                      {typeof benchmark.benchmarkValue === 'number' && benchmark.benchmarkValue % 1 !== 0
                        ? benchmark.benchmarkValue.toFixed(1)
                        : benchmark.benchmarkValue
                      }
                      {benchmark.metric.includes('Accuracy') || benchmark.metric.includes('Rate') || benchmark.metric.includes('Consistency') ? '%' : 
                       benchmark.metric.includes('Hours') ? ' hrs' :
                       benchmark.metric.includes('Velocity') ? ' cards/hr' : ''}
                    </p>
                  </div>
                </div>
                
                <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
                  {benchmark.trend === 'above' && 
                    `You're performing ${Math.round(((benchmark.userValue / benchmark.benchmarkValue) - 1) * 100)}% above average`}
                  {benchmark.trend === 'below' && 
                    `You're ${Math.round((1 - (benchmark.userValue / benchmark.benchmarkValue)) * 100)}% below average - room for improvement`}
                  {benchmark.trend === 'at' && 
                    'You're performing at the average level'}
                </div>
              </div>
            ))}
          </div>

          {/* Bar Chart Comparison */}
          <div className="h-64">
            <h4 className="font-medium text-gray-900 mb-4">Performance vs Average</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="metric" 
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    typeof value === 'number' && value % 1 !== 0 ? value.toFixed(1) : value,
                    name === 'user' ? 'Your Performance' : 'Average'
                  ]}
                />
                <Bar dataKey="user" fill="#3b82f6" name="user" />
                <Bar dataKey="benchmark" fill="#e5e7eb" name="benchmark" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
