import { format } from 'date-fns';
import { CheckCircle2, Clock, Circle, TrendingUp, TrendingDown } from 'lucide-react';
import type { PlanStats } from '@/utils/ganttRollup';

interface PlanSummaryProps {
  stats: PlanStats;
}

export const PlanSummary = ({ stats }: PlanSummaryProps) => {
  if (stats.totals.total === 0) return null;

  const { overallProgress, expectedProgress, onTrack, delta, totals, range } = stats;

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold">Plan progress</h3>
          {range && (
            <p className="text-xs text-muted-foreground">
              {format(range.start, 'd MMM')} → {format(range.end, 'd MMM yyyy')}
            </p>
          )}
        </div>
        <div
          className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
            onTrack
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
          }`}
        >
          {onTrack ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {delta >= 0
            ? `Ahead by ${delta}%`
            : `Behind by ${Math.abs(delta)}%`}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="relative h-2.5 w-full rounded-full bg-secondary overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-primary transition-all"
            style={{ width: `${overallProgress}%` }}
          />
          <div
            className="absolute top-[-4px] bottom-[-4px] w-0.5 bg-foreground/60"
            style={{ left: `${expectedProgress}%` }}
            title={`Expected: ${expectedProgress}%`}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Actual: <span className="font-medium text-foreground">{overallProgress}%</span></span>
          <span>Expected: <span className="font-medium text-foreground">{expectedProgress}%</span></span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs pt-1">
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
          {totals.done} done
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-blue-600" />
          {totals.inProgress} in progress
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Circle className="h-3.5 w-3.5 text-muted-foreground" />
          {totals.notStarted} not started
        </span>
        <span className="ml-auto text-muted-foreground">
          {totals.total} task{totals.total === 1 ? '' : 's'}
        </span>
      </div>
    </div>
  );
};
