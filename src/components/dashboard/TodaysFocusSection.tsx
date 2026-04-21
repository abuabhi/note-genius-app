
import { Target } from "lucide-react";
import { GoalsSection } from "./GoalsSection";
import { StudyPlannerSection } from "./StudyPlannerSection";

export const TodaysFocusSection = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Target className="h-6 w-6 text-mint-600" />
          Your Study Dashboard
        </h2>
        <p className="text-gray-600">Manage your study plans, goals, and tasks all in one place</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 grid-cols-1">
        <StudyPlannerSection />
        <GoalsSection />
      </div>
    </div>
  );
};
