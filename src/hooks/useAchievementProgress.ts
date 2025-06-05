
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
      console.log('No user found, setting empty achievement progress');
      setAchievementProgress([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Calculating achievement progress for user:', user.id);
      console.log('Current stats:', stats);
      
      // Get all achievement templates (achievements with user_id = null)
      const { data: templates, error: templatesError } = await supabase
        .from('study_achievements')
        .select('*')
        .is('user_id', null);

      console.log('Achievement templates fetched:', templates);

      if (templatesError) {
        console.error('Error fetching achievement templates:', templatesError);
        setAchievementProgress([]);
        return;
      }

      // If no templates exist, show empty state
      if (!templates || templates.length === 0) {
        console.log('No achievement templates found');
        setAchievementProgress([]);
        return;
      }

      // Get user's already earned achievements
      const { data: earnedAchievements, error: earnedError } = await supabase
        .from('study_achievements')
        .select('title')
        .eq('user_id', user.id);

      console.log('Earned achievements:', earnedAchievements);

      if (earnedError) {
        console.error('Error fetching earned achievements:', earnedError);
        // Continue even if we can't fetch earned achievements
      }

      const earnedTitles = new Set(earnedAchievements?.map(a => a.title) || []);
      console.log('Earned titles set:', earnedTitles);

      // Create progress data for ALL achievements
      const progressData: AchievementProgress[] = templates.map(template => {
        let current = 0;
        let target = 1;
        let progress = 0;

        // Calculate progress based on achievement type and title
        switch (template.title) {
          case 'First Steps':
            current = stats.totalCardsMastered > 0 ? 1 : 0;
            target = 1;
            break;
          case 'Getting Started':
            current = stats.totalSets > 0 ? 1 : 0;
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

        // If already earned, show 100% progress
        if (earnedTitles.has(template.title)) {
          progress = 100;
          current = target;
        } else {
          progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;
        }

        console.log(`Achievement ${template.title}: progress=${progress}%, current=${current}, target=${target}, earned=${earnedTitles.has(template.title)}`);

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
      setAchievementProgress(sortedProgress);
    } catch (error) {
      console.error('Error calculating achievement progress:', error);
      setAchievementProgress([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useAchievementProgress effect triggered, user:', user?.id, 'stats:', stats);
    calculateProgress();
  }, [user, stats]);

  return {
    achievementProgress,
    loading,
    refreshProgress: calculateProgress
  };
};
