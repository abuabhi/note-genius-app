import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, BarChart3, TrendingUp, Activity, Clock } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ComposedChart,
  Line,
  ReferenceLine
} from 'recharts';
import { format, subDays, isWithinInterval, parseISO } from 'date-fns';
import { useStudySessionChartData } from '@/hooks/useStudySessionChartData';
import { StudySessionDateFilter } from './StudySessionDateFilter';

type ChartType = 'sessions' | 'time' | 'combined';

interface StudySessionChartProps {
  className?: string;
}

export const StudySessionChart = ({ className }: StudySessionChartProps) => {
  const [chartType, setChartType] = useState<ChartType>('combined');
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date()
  });

  const { chartData, totalSessions, totalHours, avgSessionTime, isLoading } = useStudySessionChartData(dateRange);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-mint-200 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-mint-900 mb-2">
            {format(new Date(label), 'MMM d, yyyy')}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{entry.name}:</span>
              <span className="font-medium text-gray-900">
                {entry.name.includes('Time') ? `${entry.value}h` : entry.value}
              </span>
            </div>
          ))}
          {payload[0]?.payload?.manualSessions > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2 text-xs text-orange-600">
                <span>📱 Offline entries: {payload[0].payload.manualSessions}</span>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const chartConfig = {
    sessions: {
      dataKey: 'sessions',
      name: 'Sessions',
      color: 'hsl(var(--primary))'
    },
    studyTime: {
      dataKey: 'studyTime', 
      name: 'Study Time',
      color: 'hsl(151 68% 40%)'
    },
    avgTime: {
      dataKey: 'avgSessionTime',
      name: 'Avg Session',
      color: 'hsl(151 68% 60%)'
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Study Sessions Analytics
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 border-2 border-mint-100 rounded-full"></div>
              <div className="absolute inset-0 border-2 border-mint-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Study Sessions Analytics
          </CardTitle>
          
          {/* Chart Type Toggle */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={chartType === 'sessions' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('sessions')}
              className="text-xs"
            >
              <Activity className="h-3 w-3 mr-1" />
              Sessions
            </Button>
            <Button
              variant={chartType === 'time' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('time')}
              className="text-xs"
            >
              <Clock className="h-3 w-3 mr-1" />
              Time
            </Button>
            <Button
              variant={chartType === 'combined' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('combined')}
              className="text-xs"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Combined
            </Button>
          </div>
        </div>

        {/* Date Range Filter */}
        <StudySessionDateFilter 
          dateRange={dateRange} 
          setDateRange={setDateRange} 
        />

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-mint-50 rounded-lg border border-mint-100">
            <div className="text-2xl font-bold text-mint-700">{totalSessions}</div>
            <div className="text-xs text-mint-600">Total Sessions</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
            <div className="text-2xl font-bold text-green-700">{totalHours}h</div>
            <div className="text-xs text-green-600">Study Time</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-2xl font-bold text-blue-700">{avgSessionTime}m</div>
            <div className="text-xs text-blue-600">Avg Session</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'combined' ? (
              <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => format(new Date(value), 'MMM d')}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="sessions"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="time"
                  orientation="right"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  yAxisId="sessions"
                  dataKey="sessions" 
                  fill={chartConfig.sessions.color}
                  name="Sessions"
                  radius={[4, 4, 0, 0]}
                />
                <Line 
                  yAxisId="time"
                  type="monotone" 
                  dataKey="studyTime" 
                  stroke={chartConfig.studyTime.color}
                  strokeWidth={3}
                  dot={{ fill: chartConfig.studyTime.color, strokeWidth: 2 }}
                  name="Study Time (h)"
                />
              </ComposedChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => format(new Date(value), 'MMM d')}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey={chartType === 'sessions' ? 'sessions' : 'studyTime'} 
                  fill={chartType === 'sessions' ? chartConfig.sessions.color : chartConfig.studyTime.color}
                  name={chartType === 'sessions' ? 'Sessions' : 'Study Time (h)'}
                  radius={[4, 4, 0, 0]}
                />
                {/* Show 7-day moving average line for time chart */}
                {chartType === 'time' && (
                  <Line 
                    type="monotone" 
                    dataKey="movingAvg" 
                    stroke={chartConfig.avgTime.color}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="7-day Average"
                  />
                )}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Chart Legend */}
        <div className="flex flex-wrap gap-4 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary"></div>
            <span className="text-muted-foreground">Study Sessions</span>
          </div>
          {chartType !== 'sessions' && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: chartConfig.studyTime.color }}></div>
              <span className="text-muted-foreground">Study Time (hours)</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-400"></div>
            <span className="text-muted-foreground">📱 Offline entries</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};