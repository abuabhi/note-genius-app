import { useCallback, useEffect, useRef, useState } from 'react';
import type { GanttPlan, GanttTask } from '@/types/gantt';
import { ganttKey } from '@/types/gantt';
import { rollupParentProgress } from '@/utils/ganttRollup';

const loadPlan = (examId: string | null): GanttPlan => {
  try {
    const raw = localStorage.getItem(ganttKey(examId));
    if (raw) return JSON.parse(raw) as GanttPlan;
  } catch {
    // ignore corrupted local storage
  }
  return { examId, tasks: [], updatedAt: new Date().toISOString() };
};

export function useGanttPlan(examId: string | null) {
  const [tasks, setTasksState] = useState<GanttTask[]>(() => loadPlan(examId).tasks);
  const saveTimer = useRef<number | null>(null);

  // Reload when exam changes
  useEffect(() => {
    setTasksState(loadPlan(examId).tasks);
  }, [examId]);

  const persist = useCallback(
    (next: GanttTask[]) => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => {
        const plan: GanttPlan = {
          examId,
          tasks: next,
          updatedAt: new Date().toISOString(),
        };
        try {
          localStorage.setItem(ganttKey(examId), JSON.stringify(plan));
        } catch {
          // quota exceeded — silent
        }
      }, 400);
    },
    [examId],
  );

  const setTasks = useCallback(
    (updater: GanttTask[] | ((prev: GanttTask[]) => GanttTask[])) => {
      setTasksState((prev) => {
        const raw = typeof updater === 'function' ? (updater as any)(prev) : updater;
        const next = rollupParentProgress(raw);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const addSubTask = useCallback(
    (parentId: string, partial: Partial<GanttTask>) => {
      setTasks((prev) => {
        const parent = prev.find((t) => t.id === parentId);
        if (!parent) return prev;
        const newTask: GanttTask = {
          id: `task-${Date.now()}`,
          name: 'New sub-task',
          start: parent.start,
          end: parent.end,
          progress: 0,
          type: 'task',
          parentId,
          ...partial,
        };
        return [...prev, newTask];
      });
    },
    [setTasks],
  );

  const updateTask = useCallback(
    (id: string, patch: Partial<GanttTask>) => {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    },
    [setTasks],
  );

  const addTask = useCallback(
    (task: GanttTask) => setTasks((prev) => [...prev, task]),
    [setTasks],
  );

  const removeTask = useCallback(
    (id: string) =>
      setTasks((prev) => prev.filter((t) => t.id !== id && t.parentId !== id)),
    [setTasks],
  );

  const clearPlan = useCallback(() => setTasks([]), [setTasks]);

  return { tasks, setTasks, updateTask, addTask, addSubTask, removeTask, clearPlan };
}
