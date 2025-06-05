
import { SafeStats } from './types';

export const calculateAchievementProgress = (
  templateTitle: string,
  stats: SafeStats,
  isEarned: boolean
): { current: number; target: number; progress: number } => {
  let current = 0;
  let target = 1;

  // Calculate progress based on achievement type and title
  switch (templateTitle) {
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
  let progress = 0;
  if (isEarned) {
    progress = 100;
    current = target;
  } else {
    progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  }

  return { current, target, progress };
};
