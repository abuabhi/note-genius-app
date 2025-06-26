
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAdvancedPerformanceMetrics } from '@/hooks/analytics/useAdvancedPerformanceMetrics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, PieChart, Pie, Cell } from 'recharts';
import { Brain, Zap, Trophy, Users, TrendingUp, Target } from 'lucide-react';

export const AdvancedPerformanceMetrics: React.FC = () => {
  const { metrics, isLoading } = useAdvancedPerformanceMetrics();

  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const subjectMasteryData = Object.entries(metrics.subjectMastery).map(([subject, mastery]) => ({
    subject: subject.length > 10 ? subject.substring(0, 10) + '...' : subject,
    mastery: Math.round(mastery * 20), // Convert to percentage (5-point scale to 100)
    color: mastery >= 4 ? '#10b981' : mastery >= 3 ? '#f59e0b' : '#ef4444'
  }));

  const cognitiveLoadData = [
    { name: 'Cognitive Load', value: Math.round(metrics.cognitiveLoadScore * 100), fill: '#8b5cf6' }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              Cognitive Load Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(metrics.cognitiveLoadScore * 100)}%
            </div>
            <Progress value={metrics.cognitiveLoadScore * 100} className="mt-2" />
            <p className="text-xs text-gray-500 mt-1">
              {metrics.cognitiveLoadScore > 0.8 ? 'Excellent' : 
               metrics.cognitiveLoadScore > 0.6 ? 'Good' : 'Needs Work'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Learning Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {metrics.learningEfficiency.toFixed(1)}
            </div>
            <p className="text-sm text-gray-600 mt-1">cards/hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Percentile Rank
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics.comparativePerformance.percentileRank}th
            </div>
            <p className="text-sm text-gray-600 mt-1">vs peers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy className="h-4 w-4 text-green-500" />
              Session Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(metrics.sessionQualityScore * 100)}%
            </div>
            <Progress value={metrics.sessionQualityScore * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Subject Mastery Levels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectMasteryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Mastery']} />
                <Bar dataKey="mastery" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              Cognitive Load Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart innerRadius="30%" outerRadius="80%" data={cognitiveLoadData}>
                <RadialBar dataKey="value" cornerRadius={10} fill="#8b5cf6" />
                <Tooltip formatter={(value) => [`${value}%`, 'Load Score']} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                {metrics.cognitiveLoadScore > 0.8 ? 'Optimal cognitive load management' :
                 metrics.cognitiveLoadScore > 0.6 ? 'Good cognitive load balance' :
                 'Consider reducing session complexity'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Learning Acceleration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Improvement Rate</span>
                <Badge variant={metrics.learningAcceleration > 0 ? "default" : "secondary"}>
                  {metrics.learningAcceleration > 0 ? '+' : ''}{(metrics.learningAcceleration * 100).toFixed(1)}%
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Recent Performance</span>
                  <span className="font-medium">85%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Previous Performance</span>
                  <span className="font-medium">
                    {Math.round((0.85 - metrics.learningAcceleration) * 100)}%
                  </span>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  {metrics.learningAcceleration > 0.05 ? 
                    "Excellent improvement! Your performance is accelerating." :
                   metrics.learningAcceleration > 0 ?
                    "Steady improvement in your learning performance." :
                    "Focus on consistency to improve your learning trajectory."
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Peer Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Your Performance</span>
                  <span className="text-sm text-gray-600">
                    {Math.round(metrics.comparativePerformance.averagePeerPerformance * 120)}%
                  </span>
                </div>
                <Progress value={Math.min(100, metrics.comparativePerformance.averagePeerPerformance * 120)} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Average Peer</span>
                  <span className="text-sm text-gray-600">
                    {Math.round(metrics.comparativePerformance.averagePeerPerformance * 100)}%
                  </span>
                </div>
                <Progress value={metrics.comparativePerformance.averagePeerPerformance * 100} />
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  {metrics.comparativePerformance.percentileRank}th Percentile
                </p>
                <p className="text-sm text-blue-700">
                  You're performing better than {metrics.comparativePerformance.percentileRank}% of users 
                  with similar study patterns.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Subject Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Performance Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(metrics.subjectMastery).map(([subject, mastery], index) => (
              <div key={subject} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{subject}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {Math.round(mastery * 20)}% mastery
                    </span>
                    <Badge 
                      variant={mastery >= 4 ? "default" : mastery >= 3 ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      {mastery >= 4 ? 'Expert' : mastery >= 3 ? 'Intermediate' : 'Beginner'}
                    </Badge>
                  </div>
                </div>
                <Progress value={mastery * 20} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
