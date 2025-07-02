
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
import { GoalsSection } from "./GoalsSection";
import { TodosSection } from "./TodosSection";

export const TodaysFocusSection = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Target className="h-6 w-6 text-mint-600" />
          Today's Focus
        </h2>
        <p className="text-gray-600">Stay on track with your goals and todos</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <GoalsSection />
        <TodosSection />
      </div>
    </div>
  );
};
