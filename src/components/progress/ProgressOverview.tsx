
import { useUnifiedStudyStats } from "@/hooks/useUnifiedStudyStats";
import { SharedStatsGrid } from "@/components/shared/SharedStatsGrid";
import LearningSummary from "./overview/LearningSummary";
import StudyConsistency from "./overview/StudyConsistency";
import { Skeleton } from "@/components/ui/skeleton";

const ProgressOverview = () => {
  const { stats, isLoading } = useUnifiedStudyStats();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg border p-6">
              <Skeleton className="h-4 w-20 mb-3" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Detailed Stats Grid */}
      <SharedStatsGrid stats={stats} isLoading={isLoading} variant="detailed" />

      <h2 className="text-xl font-semibold mt-8 mb-4">Learning Summary</h2>
      <LearningSummary 
        totalCardsMastered={stats.totalCardsMastered} 
        studyTimeHours={stats.studyTimeHours} 
        totalSets={stats.totalSets} 
      />
      
      <StudyConsistency />
    </div>
  );
};

export default ProgressOverview;
