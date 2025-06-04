
import { useUnifiedStudyStats } from '@/hooks/useUnifiedStudyStats';
import { SharedStatsGrid } from '@/components/shared/SharedStatsGrid';

export const StudyStatsOverview = () => {
  const { stats, isLoading } = useUnifiedStudyStats();

  return <SharedStatsGrid stats={stats} isLoading={isLoading} variant="overview" />;
};
