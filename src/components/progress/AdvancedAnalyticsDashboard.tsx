
import { PerformancePredictionCard } from "./advanced/PerformancePredictionCard";
import { ComparativeAnalyticsCard } from "./advanced/ComparativeAnalyticsCard";
import { StudyRecommendationsCard } from "./advanced/StudyRecommendationsCard";
import { LearningVelocityCard } from "./advanced/LearningVelocityCard";

export const AdvancedAnalyticsDashboard = () => {
  return (
    <div className="space-y-8">
      {/* Performance Predictions & Study Recommendations */}
      <div className="grid gap-8 lg:grid-cols-2">
        <PerformancePredictionCard />
        <StudyRecommendationsCard />
      </div>
      
      {/* Comparative Analytics & Learning Velocity */}
      <div className="grid gap-8 lg:grid-cols-2">
        <ComparativeAnalyticsCard />
        <LearningVelocityCard />
      </div>
    </div>
  );
};
