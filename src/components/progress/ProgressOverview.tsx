
import { useProgressStats } from "./overview/useProgressStats";
import MainProgressStats from "./overview/MainProgressStats";
import LearningSummary from "./overview/LearningSummary";
import StudyConsistency from "./overview/StudyConsistency";
import ProgressOverviewSkeleton from "./overview/ProgressOverviewSkeleton";

const ProgressOverview = () => {
  const { stats, isLoading } = useProgressStats();

  if (isLoading) {
    return <ProgressOverviewSkeleton />;
  }

  return (
    <div className="space-y-8">
      <MainProgressStats stats={stats} />

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
