import { useProgressAnalytics } from "@/hooks/progress/useProgressAnalytics";
import { ProgressOverviewCard } from "./overview/ProgressOverviewCard";
import { GradeProgressionChart } from "./grades/GradeProgressionChart";
import { FlashcardMasteryLevels } from "./grades/FlashcardMasteryLevels";
import { DailyStudyTrends } from "./time/DailyStudyTrends";
import { ConsistencyScore } from "./time/ConsistencyScore";
import { AdvancedAnalyticsDashboard } from "./AdvancedAnalyticsDashboard";
import { AdaptiveLearningDashboard } from "./AdaptiveLearningDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export const EnhancedProgressOverview = () => {
  const { isLoading } = useProgressAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-48 w-full" />
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Overview Card */}
      <ProgressOverviewCard />
      
      {/* AI-Powered Adaptive Learning Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">AI-Powered Adaptive Learning</h2>
          <p className="text-gray-600">Personalized learning paths and intelligent study optimization</p>
        </div>
        <AdaptiveLearningDashboard />
      </div>
      
      {/* Advanced AI Analytics Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Advanced Analytics</h2>
          <p className="text-gray-600">Performance predictions and comparative insights</p>
        </div>
        <AdvancedAnalyticsDashboard />
      </div>
      
      {/* Grade Progression Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Grade Progression</h2>
          <p className="text-gray-600">Track your journey from C → B → A grades across subjects</p>
        </div>
        
        <div className="grid gap-8 lg:grid-cols-2">
          <GradeProgressionChart />
          <FlashcardMasteryLevels />
        </div>
      </div>
      
      {/* Study Time Analytics Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Study Time Analytics</h2>
          <p className="text-gray-600">Analyze your study patterns and consistency</p>
        </div>
        
        <div className="grid gap-8 lg:grid-cols-2">
          <DailyStudyTrends />
          <ConsistencyScore />
        </div>
      </div>
    </div>
  );
};
