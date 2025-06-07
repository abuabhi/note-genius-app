
import { useUnifiedStudyStats } from '@/hooks/useUnifiedStudyStats';
import { SharedStatsGrid } from '@/components/shared/SharedStatsGrid';

export const StudyStatsOverview = () => {
  const { stats, isLoading } = useUnifiedStudyStats();

  // Transform stats to match SharedStatsGrid interface
  const transformedStats = {
    totalHours: stats.studyTimeHours,
    averageDuration: stats.averageSessionTime,
    totalSessions: stats.totalSessions,
    activeSessions: 0, // We don't track active sessions in unified stats
    streakDays: stats.streakDays,
    totalCardsMastered: stats.totalCardsMastered,
    cardsReviewedToday: 0, // We don't track today's cards in unified stats
    todayStudyMinutes: 0, // We don't track today's study time in unified stats
  };

  return <SharedStatsGrid stats={transformedStats} isLoading={isLoading} variant="sessions" />;
};
