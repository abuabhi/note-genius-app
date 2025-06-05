
import { useAuth } from "@/contexts/auth";
import { useAchievements } from "@/hooks/useAchievements";
import { AchievementStats } from "./achievements/AchievementStats";
import { SimpleAchievementProgress } from "./achievements/SimpleAchievementProgress";
import { EarnedAchievementsSection } from "./achievements/EarnedAchievementsSection";
import { EmptyAchievementsState } from "./achievements/EmptyAchievementsState";

export const Achievements = () => {
  const { user } = useAuth();
  const { achievements, loading, checkAndAwardAchievements } = useAchievements();

  const totalPoints = achievements.reduce((sum, achievement) => sum + achievement.points, 0);

  return (
    <div className="space-y-6">
      {/* Achievement Stats */}
      <AchievementStats 
        totalPoints={totalPoints}
        achievementsCount={achievements.length}
        availableCount={8} // We know there are 8 achievement templates
      />

      {/* Simplified Achievement Progress - bypasses complex hooks */}
      <SimpleAchievementProgress />

      {/* Earned Achievements */}
      <EarnedAchievementsSection achievements={achievements} />

      {/* Empty State for New Users */}
      {achievements.length === 0 && !loading && (
        <EmptyAchievementsState onCheckAchievements={checkAndAwardAchievements} />
      )}
    </div>
  );
};

export default Achievements;
