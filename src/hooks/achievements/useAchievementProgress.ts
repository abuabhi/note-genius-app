
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { useUnifiedStudyStats } from "../useUnifiedStudyStats";
import { AchievementProgress, SafeStats } from "./types";
import { calculateAchievementProgress } from "./achievementCalculations";
import { fetchAchievementTemplates, fetchEarnedAchievements } from "./achievementQueries";

export const useAchievementProgress = () => {
  const [achievementProgress, setAchievementProgress] = useState<AchievementProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { stats, isLoading: statsLoading } = useUnifiedStudyStats();

  const calculateProgress = async () => {
    console.log('=== calculateProgress START ===');
    console.log('User:', user?.id);
    console.log('Stats:', stats);
    console.log('Stats loading:', statsLoading);
    
    if (!user) {
      console.log('No user found, setting empty achievement progress');
      setAchievementProgress([]);
      setLoading(false);
      return;
    }

    // Don't calculate progress if stats are still loading
    if (statsLoading) {
      console.log('Stats still loading, skipping progress calculation');
      return;
    }

    try {
      setLoading(true);
      console.log('Calculating achievement progress for user:', user.id);
      
      const templates = await fetchAchievementTemplates();

      // If no templates exist, show empty state
      if (!templates || templates.length === 0) {
        console.log('No achievement templates found in database');
        setAchievementProgress([]);
        setLoading(false);
        return;
      }

      console.log(`Found ${templates.length} achievement templates:`, templates.map(t => t.title));

      const earnedTitles = await fetchEarnedAchievements(user.id);
      console.log('Earned titles set:', earnedTitles);

      // Create progress data for ALL achievements - Use default stats if stats is null
      const safeStats: SafeStats = stats || {
        totalCardsMastered: 0,
        totalSets: 0,
        streakDays: 0,
        totalSessions: 0,
        flashcardAccuracy: 0,
        studyTimeHours: 0
      };

      console.log('Using stats for calculation:', safeStats);

      const progressData: AchievementProgress[] = templates.map(template => {
        console.log(`Processing template: ${template.title}`);
        
        const isEarned = earnedTitles.has(template.title);
        const { current, target, progress } = calculateAchievementProgress(
          template.title, 
          safeStats, 
          isEarned
        );

        console.log(`Achievement ${template.title}: progress=${progress}%, current=${current}, target=${target}, earned=${isEarned}`);

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
          return a.progress - b.progress; // Show incomplete achievements first
        }
        return a.title.localeCompare(b.title);
      });

      console.log('Final sorted progress data:', sortedProgress);
      console.log('Setting achievementProgress to:', sortedProgress.length, 'items');
      setAchievementProgress(sortedProgress);
      console.log('=== calculateProgress END ===');
    } catch (error) {
      console.error('Error calculating achievement progress:', error);
      setAchievementProgress([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useAchievementProgress effect triggered');
    console.log('- user:', user?.id);
    console.log('- statsLoading:', statsLoading);
    console.log('- stats available:', !!stats);
    
    if (user && !statsLoading) {
      console.log('Conditions met, calling calculateProgress');
      calculateProgress();
    } else {
      console.log('Conditions not met, not calling calculateProgress');
      if (!user) console.log('  - No user');
      if (statsLoading) console.log('  - Stats still loading');
    }
  }, [user, stats, statsLoading]);

  console.log('useAchievementProgress returning:', {
    achievementProgressLength: achievementProgress.length,
    loading,
    firstFewTitles: achievementProgress.slice(0, 3).map(a => a.title)
  });

  return {
    achievementProgress,
    loading,
    refreshProgress: calculateProgress
  };
};
