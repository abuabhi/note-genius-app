
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart
} from "recharts";
import { ProgressCard } from "../shared/ProgressCard";
import { Clock } from "lucide-react";
import { useProgressAnalytics } from "@/hooks/progress/useProgressAnalytics";
import { format, parseISO } from 'date-fns';

export const DailyStudyTrends = () => {
  const { studyTimeAnalytics, isLoading } = useProgressAnalytics();

  if (isLoading) {
    return (
      <ProgressCard title="Daily Study Trends" icon={Clock}>
        <div className="h-80 animate-pulse bg-gray-200 rounded"></div>
      </ProgressCard>
    );
  }

  const { dailyTrends } = studyTimeAnalytics;

  if (dailyTrends.length === 0) {
    return (
      <ProgressCard title="Daily Study Trends" icon={Clock}>
        <div className="h-80 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Start studying to see your daily trends!</p>
          </div>
        </div>
      </ProgressCard>
    );
  }

  // Format data for the chart
  const chartData = dailyTrends.map(day => ({
    ...day,
    displayDate: format(parseISO(day.date), 'MM/dd'),
    fullDate: format(parseISO(day.date), 'MMM dd, yyyy')
  }));

  // Calculate 7-day moving average
  const dataWithMovingAverage = chartData.map((day, index) => {
    const start = Math.max(0, index - 6);
    const slice = chartData.slice(start, index + 1);
    const average = slice.reduce((sum, d) => sum + d.minutes, 0) / slice.length;
    
    return {
      ...day,
      movingAverage: Math.round(average * 10) / 10
    };
  });

  return (
    <ProgressCard 
      title="Daily Study Time (Last 30 Days)" 
      icon={Clock}
      headerAction={
        <div className="text-sm text-gray-600">
          7-day moving average shown
        </div>
      }
    >
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={dataWithMovingAverage}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="displayDate"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'movingAverage') return [`${value} min`, '7-day average'];
                if (name === 'minutes') return [`${value} min`, 'Study time'];
                if (name === 'cardsReviewed') return [`${value}`, 'Cards reviewed'];
                return [value, name];
              }}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  return payload[0].payload.fullDate;
                }
                return label;
              }}
            />
            <Bar 
              dataKey="minutes" 
              fill="#10b981" 
              name="Study time"
              radius={[2, 2, 0, 0]}
            />
            <Line 
              type="monotone" 
              dataKey="movingAverage" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={false}
              name="7-day average"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-mint-600">
            {Math.round(chartData.reduce((sum, d) => sum + d.minutes, 0) / chartData.length)}
          </div>
          <div className="text-sm text-gray-600">Daily Average</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-blue-600">
            {Math.max(...chartData.map(d => d.minutes))}
          </div>
          <div className="text-sm text-gray-600">Best Day</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600">
            {chartData.reduce((sum, d) => sum + d.cardsReviewed, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Cards</div>
        </div>
      </div>
    </ProgressCard>
  );
};
