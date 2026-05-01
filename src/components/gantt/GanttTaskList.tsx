import { useEffect, useRef, useState, type FC } from 'react';
import type { Task } from 'gantt-task-react';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface Props {
  rowHeight: number;
  rowWidth: string;
  fontFamily: string;
  fontSize: string;
  locale: string;
  tasks: Task[];
  selectedTaskId: string;
  setSelectedTask: (taskId: string) => void;
  onExpanderClick: (task: Task) => void;
  /** Inline rename — called when the user commits a name change */
  onRename: (id: string, name: string) => void;
}

/**
 * Custom task list rendered to the left of the Gantt bars.
 * Supports double-click to rename inline.
 */
export const buildTaskListTable = (
  onRename: (id: string, name: string) => void,
): FC<Omit<Props, 'onRename'>> => {
  const Component: FC<Omit<Props, 'onRename'>> = ({
    rowHeight,
    rowWidth,
    fontFamily,
    fontSize,
    tasks,
    onExpanderClick,
  }) => {
    return (
      <div
        className="border-r border-border bg-card"
        style={{ fontFamily, fontSize }}
      >
        {tasks.map((t) => (
          <Row
            key={t.id}
            task={t}
            rowHeight={rowHeight}
            rowWidth={rowWidth}
            onExpanderClick={onExpanderClick}
            onRename={onRename}
          />
        ))}
      </div>
    );
  };
  return Component;
};

interface RowProps {
  task: Task;
  rowHeight: number;
  rowWidth: string;
  onExpanderClick: (task: Task) => void;
  onRename: (id: string, name: string) => void;
}

const Row = ({ task, rowHeight, rowWidth, onExpanderClick, onRename }: RowProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(task.name);
  }, [task.name, editing]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = () => {
    const next = draft.trim();
    if (next && next !== task.name) onRename(task.id, next);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(task.name);
    setEditing(false);
  };

  const isProject = task.type === 'project';
  const indent = task.project ? 18 : 0;

  return (
    <div
      className="flex items-center gap-1 border-b border-border/60 px-2"
      style={{ height: rowHeight, width: rowWidth }}
    >
      <div style={{ width: indent }} className="shrink-0" />
      {isProject ? (
        <button
          type="button"
          onClick={() => onExpanderClick(task)}
          className="text-muted-foreground hover:text-foreground shrink-0"
          aria-label={task.hideChildren ? 'Expand' : 'Collapse'}
        >
          {task.hideChildren ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      ) : (
        <div className="w-4 shrink-0" />
      )}
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            else if (e.key === 'Escape') cancel();
          }}
          className="flex-1 min-w-0 rounded-sm border border-input bg-background px-1.5 py-0.5 text-sm outline-none ring-2 ring-ring"
        />
      ) : (
        <button
          type="button"
          onDoubleClick={() => setEditing(true)}
          className={`flex-1 min-w-0 truncate text-left text-sm hover:underline decoration-dotted ${
            isProject ? 'font-semibold' : ''
          }`}
          title="Double-click to rename"
        >
          {task.name}
        </button>
      )}
    </div>
  );
};
