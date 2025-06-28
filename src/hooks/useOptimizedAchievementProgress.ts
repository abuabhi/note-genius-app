
import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { useStableStats } from "./useStableStats";
import { AchievementProgress, SafeStats } from "./achievements/types";
import { calculateAchievementProgress } from "./achievements/achievementCalculations";
import { fetchAchievementTemplates, fetchEarnedAchievements } from "./achievements/achievementQueries";

export const useOptimizedAchievementProgress = () => {
  const [achievementProgress, setAchievementProgress] = useState<AchievementProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastCalculated, setLastCalculated] = useState<number>(0);
  const { user } = useAuth();
  const { stats, isLoading: statsLoading } = useStableStats();

  // Memoize safe stats to prevent recalculation
  const safeStats: SafeStats = useMemo(() => stats || {
    totalCardsMastered: 0,
    totalSets: 0,
    streakDays: 0,
    totalSessions: 0,
    flashcardAccuracy: 0,
    studyTimeHours: 0
  }, [stats]);

  // Memoize the calculation function
  const calculateProgress = useCallback(async () => {
    if (!user || statsLoading) {
      return;
    }

    // Prevent excessive recalculations
    const now = Date.now();
    if (now - lastCalculated < 2000) { // Throttle to max once per 2 seconds
      return;
    }

    try {
      setLoading(true);
      console.log('🏆 Calculating achievement progress (optimized)');
      
      const templates = await fetchAchievementTemplates();
      
      if (!templates || templates.length === 0) {
        console.log('No achievement templates found');
        setAchievementProgress([]);
        setLoading(false);
        return;
      }

      const earnedTitles = await fetchEarnedAchievements(user.id);

      const progressData: AchievementProgress[] = templates.map(template => {
        const isEarned = earnedTitles.has(template.title);
        const { current, target, progress } = calculateAchievementProgress(
          template.title, 
          safeStats, 
          isEarned
        );

        return {
          id: template.id,
          title: template.title,
          description: template.description,
          type: template.type,
          points: template.points,
          badge_image: template.badge_image,
          progress,
          current,
          target
        };
      });

      // Sort by progress (incomplete first), then by title
      const sortedProgress = progressData.sort((a, b) => {
        if (a.progress !== b.progress) {
          return a.progress - b.progress;
        }
        return a.title.localeCompare(b.title);
      });

      setAchievementProgress(sortedProgress);
      setLastCalculated(now);
      console.log('✅ Achievement progress calculated successfully');
    } catch (error) {
      console.error('❌ Error calculating achievement progress:', error);
      setAchievementProgress([]);
    } finally {
      setLoading(false);
    }
  }, [user, safeStats, statsLoading, lastCalculated]);

  useEffect(() => {
    if (user && !statsLoading) {
      calculateProgress();
    }
  }, [calculateProgress]);

  return {
    achievementProgress,
    loading,
    refreshProgress: calculateProgress
  };
};
