
import { LearningPathCard } from "./LearningPathCard";
import { StudyScheduleCard } from "./StudyScheduleCard";
import { PerformanceForecastCard } from "./PerformanceForecastCard";
import { BehavioralInsightsCard } from "./BehavioralInsightsCard";

export const AdaptiveLearningDashboard = () => {
  return (
    <div className="space-y-8">
      {/* Learning Paths & Schedule */}
      <div className="grid gap-8 lg:grid-cols-2">
        <LearningPathCard />
        <StudyScheduleCard />
      </div>
      
      {/* Forecasting & Behavioral Insights */}
      <div className="grid gap-8 lg:grid-cols-2">
        <PerformanceForecastCard />
        <BehavioralInsightsCard />
      </div>
    </div>
  );
};
