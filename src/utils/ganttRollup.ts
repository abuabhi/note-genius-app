import { differenceInCalendarDays } from 'date-fns';
import type { GanttTask } from '@/types/gantt';

export type TaskStatus = 'not_started' | 'in_progress' | 'done';

export const statusOf = (progress: number): TaskStatus => {
  if (progress >= 100) return 'done';
  if (progress > 0) return 'in_progress';
  return 'not_started';
};

export const statusLabel: Record<TaskStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  done: 'Done',
};

const durationDays = (t: GanttTask) =>
  Math.max(differenceInCalendarDays(new Date(t.end), new Date(t.start)), 1);

/**
 * For every `project` task, recompute progress as the duration-weighted
 * average of its direct children. Leaves task/milestone rows untouched.
 */
export function rollupParentProgress(tasks: GanttTask[]): GanttTask[] {
  const byParent = new Map<string, GanttTask[]>();
  for (const t of tasks) {
    if (t.parentId) {
      const arr = byParent.get(t.parentId) ?? [];
      arr.push(t);
      byParent.set(t.parentId, arr);
    }
  }
  return tasks.map((t) => {
    if (t.type !== 'project') return t;
    const kids = byParent.get(t.id) ?? [];
    if (kids.length === 0) return t;
    const totalDur = kids.reduce((s, k) => s + durationDays(k), 0);
    const weighted = kids.reduce((s, k) => s + k.progress * durationDays(k), 0);
    const progress = Math.round(weighted / Math.max(totalDur, 1));
    return { ...t, progress };
  });
}

export interface PlanStats {
  overallProgress: number;
  expectedProgress: number;
  onTrack: boolean;
  delta: number;
  totals: { total: number; done: number; inProgress: number; notStarted: number };
  range: { start: Date; end: Date } | null;
}

export function computePlanStats(tasks: GanttTask[]): PlanStats {
  const leaves = tasks.filter((t) => t.type !== 'project');
  if (leaves.length === 0) {
    return {
      overallProgress: 0,
      expectedProgress: 0,
      onTrack: true,
      delta: 0,
      totals: { total: 0, done: 0, inProgress: 0, notStarted: 0 },
      range: null,
    };
  }

  const totalDur = leaves.reduce((s, k) => s + durationDays(k), 0);
  const weighted = leaves.reduce((s, k) => s + k.progress * durationDays(k), 0);
  const overallProgress = Math.round(weighted / Math.max(totalDur, 1));

  const start = new Date(
    Math.min(...leaves.map((t) => new Date(t.start).getTime())),
  );
  const end = new Date(
    Math.max(...leaves.map((t) => new Date(t.end).getTime())),
  );
  const now = new Date();
  const span = Math.max(differenceInCalendarDays(end, start), 1);
  const elapsed = Math.min(Math.max(differenceInCalendarDays(now, start), 0), span);
  const expectedProgress = Math.round((elapsed / span) * 100);

  const totals = {
    total: leaves.length,
    done: leaves.filter((t) => t.progress >= 100).length,
    inProgress: leaves.filter((t) => t.progress > 0 && t.progress < 100).length,
    notStarted: leaves.filter((t) => t.progress <= 0).length,
  };

  const delta = overallProgress - expectedProgress;
  return {
    overallProgress,
    expectedProgress,
    onTrack: delta >= -5,
    delta,
    totals,
    range: { start, end },
  };
}
