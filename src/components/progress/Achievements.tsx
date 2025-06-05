
import { useAuth } from "@/contexts/auth";
import { useAchievements } from "@/hooks/useAchievements";
import { useAchievementProgress } from "@/hooks/achievements/useAchievementProgress";
import { AchievementStats } from "./achievements/AchievementStats";
import { AchievementProgressSection } from "./achievements/AchievementProgressSection";
import { EarnedAchievementsSection } from "./achievements/EarnedAchievementsSection";
import { EmptyAchievementsState } from "./achievements/EmptyAchievementsState";

export const Achievements = () => {
  const { user } = useAuth();
  const { achievements, loading, checkAndAwardAchievements } = useAchievements();
  const { achievementProgress, loading: progressLoading, refreshProgress } = useAchievementProgress();

  const handleCheckProgress = async () => {
    await checkAndAwardAchievements();
    await refreshProgress();
  };

  const totalPoints = achievements.reduce((sum, achievement) => sum + achievement.points, 0);

  return (
    <div className="space-y-6">
      {/* Achievement Stats */}
      <AchievementStats 
        totalPoints={totalPoints}
        achievementsCount={achievements.length}
        availableCount={achievementProgress.length}
      />

      {/* All Available Achievements with Progress */}
      <AchievementProgressSection 
        achievementProgress={achievementProgress}
        loading={loading}
        progressLoading={progressLoading}
        onCheckProgress={handleCheckProgress}
      />

      {/* Earned Achievements */}
      <EarnedAchievementsSection achievements={achievements} />

      {/* Empty State for New Users */}
      {achievements.length === 0 && achievementProgress.length === 0 && !loading && !progressLoading && (
        <EmptyAchievementsState onCheckAchievements={checkAndAwardAchievements} />
      )}
    </div>
  );
};

export default Achievements;
