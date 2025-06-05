
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { useUnifiedStudyStats } from "./useUnifiedStudyStats";

interface AchievementProgress {
  id: string;
  title: string;
  description: string;
  type: string;
  points: number;
  badge_image: string;
  progress: number;
  current: number;
  target: number;
}

export const useAchievementProgress = () => {
  const [achievementProgress, setAchievementProgress] = useState<AchievementProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { stats } = useUnifiedStudyStats();

  const calculateProgress = async () => {
    if (!user) {
      setAchievementProgress([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Get all achievement templates (achievements with user_id = null)
      const { data: templates, error: templatesError } = await supabase
        .from('study_achievements')
        .select('*')
        .is('user_id', null);

      if (templatesError) {
        console.error('Error fetching achievement templates:', templatesError);
        setAchievementProgress([]);
        return;
      }

      // Get user's already earned achievements
      const { data: earnedAchievements, error: earnedError } = await supabase
        .from('study_achievements')
        .select('title')
        .eq('user_id', user.id);

      if (earnedError) {
        console.error('Error fetching earned achievements:', earnedError);
        setAchievementProgress([]);
        return;
      }

      const earnedTitles = new Set(earnedAchievements?.map(a => a.title) || []);

      // Filter out already earned achievements
      const unearnedTemplates = templates?.filter(template => 
        !earnedTitles.has(template.title)
      ) || [];

      // Calculate progress for each unearned achievement
      const progressData: AchievementProgress[] = unearnedTemplates.map(template => {
        let current = 0;
        let target = 1;
        let progress = 0;

        // Calculate progress based on achievement type and title
        switch (template.title) {
          case 'First Steps':
            current = Math.min(stats.totalCardsMastered > 0 ? 1 : 0, 1);
            target = 1;
            break;
          case 'Getting Started':
            current = Math.min(stats.totalSets, 1);
            target = 1;
            break;
          case 'Study Streak':
            current = Math.min(stats.streakDays, 3);
            target = 3;
            break;
          case 'Week Warrior':
            current = Math.min(stats.streakDays, 7);
            target = 7;
            break;
          case 'Flashcard Master':
            current = Math.min(stats.totalSets, 10);
            target = 10;
            break;
          case 'Goal Crusher':
            // For now, we don't have completed goals data, so we'll use a placeholder
            current = 0;
            target = 5;
            break;
          case 'Century Club':
            current = Math.min(stats.totalCardsMastered, 100);
            target = 100;
            break;
          case 'Study Session Champion':
            current = Math.min(stats.totalSessions, 20);
            target = 20;
            break;
          default:
            current = 0;
            target = 1;
        }

        progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;

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

      // Sort by progress (highest first) to show closest achievements first
      const sortedProgress = progressData.sort((a, b) => b.progress - a.progress);

      setAchievementProgress(sortedProgress);
    } catch (error) {
      console.error('Error calculating achievement progress:', error);
      setAchievementProgress([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateProgress();
  }, [user, stats]);

  return {
    achievementProgress,
    loading,
    refreshProgress: calculateProgress
  };
};
