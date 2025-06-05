
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";

interface Goal {
  id: string;
  title: string;
  description: string;
  target_hours: number;
  progress: number;
}

interface TodaysFocusGoalsProps {
  goals: Goal[];
}

export const TodaysFocusGoals = ({ goals }: TodaysFocusGoalsProps) => {
  if (goals.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Target className="h-4 w-4 text-blue-600" />
        <span className="font-medium text-gray-800">Active Goals</span>
      </div>
      <div className="space-y-2">
        {goals.map((goal) => (
          <div key={goal.id} className="flex items-center justify-between bg-blue-50 rounded p-3">
            <div>
              <div className="font-medium text-blue-800">{goal.title}</div>
              <div className="text-sm text-blue-600">{goal.description}</div>
              <div className="text-xs text-blue-500 mt-1">
                Target: {goal.target_hours}h | Progress: {goal.progress}%
              </div>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="border-blue-300 text-blue-700">
                {goal.target_hours}h goal
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
