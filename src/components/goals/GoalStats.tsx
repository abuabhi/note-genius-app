import React from 'react';
import { StudyGoal } from '@/hooks/useStudyGoals';

interface GoalStatsProps {
  goals: StudyGoal[];
  streakBonus: string | null;
}

/**
 * Compact inline summary line. Replaces the previous 4-card stat grid.
 * Shows only what a student needs at a glance: active / due soon / overdue.
 */
export const GoalStats: React.FC<GoalStatsProps> = ({ goals, streakBonus }) => {
  const today = new Date();
  const activeGoals = goals.filter(g => !g.is_completed && g.status !== 'archived');

  const dueSoon = activeGoals.filter(g => {
    const days = Math.ceil((new Date(g.end_date).getTime() - today.getTime()) / 86_400_000);
    return days >= 0 && days <= 3;
  }).length;

  const overdue = activeGoals.filter(g => new Date(g.end_date) < today).length;

  const parts: string[] = [
    `${activeGoals.length} active`,
  ];
  if (dueSoon > 0) parts.push(`${dueSoon} due soon`);
  if (overdue > 0) parts.push(`${overdue} overdue`);

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
      <span>{parts.join(' · ')}</span>
      {streakBonus && (
        <>
          <span className="text-muted-foreground/50">·</span>
          <span className="text-mint-700 font-medium">{streakBonus}</span>
        </>
      )}
    </div>
  );
};
