
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { ProgressCard } from "../shared/ProgressCard";
import { TrendingUp } from "lucide-react";
import { useProgressAnalytics } from "@/hooks/progress/useProgressAnalytics";

export const GradeProgressionChart = () => {
  const { gradeProgression, isLoading } = useProgressAnalytics();

  if (isLoading) {
    return (
      <ProgressCard title="Grade Progression" icon={TrendingUp}>
        <div className="h-80 animate-pulse bg-gray-200 rounded"></div>
      </ProgressCard>
    );
  }

  if (gradeProgression.length === 0) {
    return (
      <ProgressCard title="Grade Progression" icon={TrendingUp}>
        <div className="h-80 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Start studying to see your grade progression!</p>
          </div>
        </div>
      </ProgressCard>
    );
  }

  // Transform data for the chart
  const chartData = gradeProgression.map((subject, index) => {
    const aGrade = subject.gradeDistribution.find(g => g.grade === 'A')?.percentage || 0;
    const bGrade = subject.gradeDistribution.find(g => g.grade === 'B')?.percentage || 0;
    const cGrade = subject.gradeDistribution.find(g => g.grade === 'C')?.percentage || 0;
    
    return {
      subject: subject.subject.length > 10 ? subject.subject.substring(0, 10) + '...' : subject.subject,
      'Grade A': aGrade,
      'Grade B': bGrade,
      'Grade C': cGrade,
      masteryLevel: subject.masteryLevel
    };
  });

  return (
    <ProgressCard title="Grade Progression by Subject" icon={TrendingUp}>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="subject" 
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value, name) => [`${value}%`, name]}
              labelFormatter={(label) => `Subject: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="Grade A"
              stroke="#22c55e"
              strokeWidth={3}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="Grade B"
              stroke="#f59e0b"
              strokeWidth={3}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="Grade C"
              stroke="#f97316"
              strokeWidth={3}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Track your progress from C → B → A grades across different subjects</p>
      </div>
    </ProgressCard>
  );
};
