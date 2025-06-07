
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
      <ProgressCard 
        title="Grade Progression by Subject" 
        icon={TrendingUp}
        description="Track your journey from C → B → A grades"
      >
        <div className="h-80 animate-pulse bg-mint-100 rounded-lg"></div>
      </ProgressCard>
    );
  }

  if (gradeProgression.length === 0) {
    return (
      <ProgressCard 
        title="Grade Progression by Subject" 
        icon={TrendingUp}
        description="Track your journey from C → B → A grades"
      >
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-mint-300" />
            <p className="text-mint-600 font-medium">Start studying to see your grade progression!</p>
            <p className="text-sm text-mint-500 mt-2">Complete flashcard reviews to track improvement</p>
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
    <ProgressCard 
      title="Grade Progression by Subject" 
      icon={TrendingUp}
      description="Track your journey from C → B → A grades"
    >
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#c7f2dc" />
            <XAxis 
              dataKey="subject" 
              tick={{ fontSize: 12, fill: '#257c57' }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', style: { fill: '#257c57' } }}
              tick={{ fill: '#257c57' }}
            />
            <Tooltip 
              formatter={(value, name) => [`${value}%`, name]}
              labelFormatter={(label) => `Subject: ${label}`}
              contentStyle={{ 
                backgroundColor: '#f2fcf6', 
                border: '1px solid #c7f2dc',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="Grade A"
              stroke="#22c55e"
              strokeWidth={3}
              activeDot={{ r: 6, fill: '#22c55e' }}
            />
            <Line
              type="monotone"
              dataKey="Grade B"
              stroke="#3dc087"
              strokeWidth={3}
              activeDot={{ r: 6, fill: '#3dc087' }}
            />
            <Line
              type="monotone"
              dataKey="Grade C"
              stroke="#62d3a3"
              strokeWidth={3}
              activeDot={{ r: 6, fill: '#62d3a3' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 p-3 bg-mint-50 rounded-lg border border-mint-200">
        <p className="text-sm text-mint-700">
          <strong>Progress Insight:</strong> Higher grades indicate better mastery. Focus on subjects with lower A-grade percentages.
        </p>
      </div>
    </ProgressCard>
  );
};
