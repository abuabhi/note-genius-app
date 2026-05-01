import { useMemo } from 'react';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import type { GanttTask } from '@/types/gantt';

interface GanttBoardProps {
  tasks: GanttTask[];
  viewMode: ViewMode;
  onChange: (id: string, patch: Partial<GanttTask>) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

const toLibTask = (t: GanttTask): Task => ({
  id: t.id,
  name: t.name,
  start: new Date(t.start),
  end: new Date(t.end),
  progress: t.progress,
  type: t.type,
  project: t.parentId,
  dependencies: t.dependencies,
  hideChildren: t.hideChildren,
  isDisabled: false,
  styles: {
    progressColor: 'hsl(var(--primary))',
    progressSelectedColor: 'hsl(var(--primary))',
    backgroundColor: 'hsl(var(--primary) / 0.35)',
    backgroundSelectedColor: 'hsl(var(--primary) / 0.55)',
  },
});

export const GanttBoard = ({ tasks, viewMode, onChange, onDelete, onEdit }: GanttBoardProps) => {
  const libTasks = useMemo(() => tasks.map(toLibTask), [tasks]);

  if (libTasks.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 text-sm text-muted-foreground">
        No tasks yet — pick an exam and click <span className="mx-1 font-medium">Auto-seed</span>, or add one manually.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <Gantt
        tasks={libTasks}
        viewMode={viewMode}
        listCellWidth="220px"
        columnWidth={viewMode === ViewMode.Month ? 200 : viewMode === ViewMode.Week ? 120 : 50}
        onDateChange={(task) =>
          onChange(task.id, {
            start: task.start.toISOString().slice(0, 10),
            end: task.end.toISOString().slice(0, 10),
          })
        }
        onProgressChange={(task) => onChange(task.id, { progress: Math.round(task.progress) })}
        onDelete={(task) => {
          onDelete(task.id);
          return true;
        }}
        onExpanderClick={(task) => onChange(task.id, { hideChildren: task.hideChildren })}
        onDoubleClick={(task) => onEdit(task.id)}
        onClick={(task) => onEdit(task.id)}
      />
    </div>
  );
};
