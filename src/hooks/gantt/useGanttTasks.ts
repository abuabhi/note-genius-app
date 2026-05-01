import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import type { GanttTask } from '@/types/gantt';
import { rollupParentProgress } from '@/utils/ganttRollup';
import { toast } from 'sonner';

export const ganttTasksKey = (planId?: string | null) =>
  ['gantt-tasks', planId] as const;

interface RawTask {
  id: string;
  plan_id: string;
  user_id: string;
  parent_id: string | null;
  topic_id: string | null;
  name: string;
  type: string;
  start_date: string;
  end_date: string;
  progress: number;
  dependencies: string[];
  hide_children: boolean;
  position: number;
}

const toTask = (r: RawTask): GanttTask => ({
  id: r.id,
  name: r.name,
  start: r.start_date,
  end: r.end_date,
  progress: r.progress,
  type: (r.type as GanttTask['type']) ?? 'task',
  parentId: r.parent_id ?? undefined,
  dependencies: r.dependencies ?? [],
  hideChildren: r.hide_children,
  topicId: r.topic_id,
  position: r.position,
});

const toRowPatch = (
  patch: Partial<GanttTask>,
): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  if (patch.name !== undefined) out.name = patch.name;
  if (patch.start !== undefined) out.start_date = patch.start;
  if (patch.end !== undefined) out.end_date = patch.end;
  if (patch.progress !== undefined) out.progress = Math.round(patch.progress);
  if (patch.type !== undefined) out.type = patch.type;
  if (patch.parentId !== undefined) out.parent_id = patch.parentId ?? null;
  if (patch.dependencies !== undefined) out.dependencies = patch.dependencies ?? [];
  if (patch.hideChildren !== undefined) out.hide_children = patch.hideChildren;
  if (patch.topicId !== undefined) out.topic_id = patch.topicId ?? null;
  if (patch.position !== undefined) out.position = patch.position;
  return out;
};

export function useGanttTasks(planId: string | null) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [localTasks, setLocalTasks] = useState<GanttTask[]>([]);
  const saveTimers = useRef<Map<string, number>>(new Map());

  const query = useQuery({
    queryKey: ganttTasksKey(planId),
    enabled: !!planId && !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gantt_tasks')
        .select('*')
        .eq('plan_id', planId!)
        .order('position', { ascending: true });
      if (error) throw error;
      return (data as RawTask[]).map(toTask);
    },
  });

  useEffect(() => {
    if (query.data) setLocalTasks(rollupParentProgress(query.data));
  }, [query.data]);

  const persistRow = useCallback(
    (id: string, patch: Partial<GanttTask>) => {
      const existing = saveTimers.current.get(id);
      if (existing) window.clearTimeout(existing);
      const timer = window.setTimeout(async () => {
        const { error } = await supabase
          .from('gantt_tasks')
          .update(toRowPatch(patch))
          .eq('id', id);
        if (error) toast.error('Failed to save: ' + error.message);
      }, 350);
      saveTimers.current.set(id, timer);
    },
    [],
  );

  const updateTask = useCallback(
    (id: string, patch: Partial<GanttTask>) => {
      setLocalTasks((prev) =>
        rollupParentProgress(prev.map((t) => (t.id === id ? { ...t, ...patch } : t))),
      );
      persistRow(id, patch);
    },
    [persistRow],
  );

  const addTask = useCallback(
    async (partial: Omit<GanttTask, 'id'> & { id?: string }) => {
      if (!planId || !user?.id) return;
      const position = localTasks.length;
      const { data, error } = await supabase
        .from('gantt_tasks')
        .insert({
          plan_id: planId,
          user_id: user.id,
          name: partial.name,
          type: partial.type,
          start_date: partial.start,
          end_date: partial.end,
          progress: Math.round(partial.progress ?? 0),
          parent_id: partial.parentId ?? null,
          dependencies: partial.dependencies ?? [],
          hide_children: partial.hideChildren ?? false,
          topic_id: partial.topicId ?? null,
          position,
        })
        .select('*')
        .single();
      if (error) {
        toast.error('Failed to add task: ' + error.message);
        return;
      }
      const newTask = toTask(data as RawTask);
      setLocalTasks((prev) => rollupParentProgress([...prev, newTask]));
      qc.invalidateQueries({ queryKey: ganttTasksKey(planId) });
      return newTask;
    },
    [planId, user?.id, localTasks.length, qc],
  );

  const removeTask = useCallback(
    async (id: string) => {
      // also delete children locally; cascade handled server-side if FK set,
      // but we used SET NULL so we must delete children explicitly.
      const toDelete = new Set<string>([id]);
      let added = true;
      while (added) {
        added = false;
        for (const t of localTasks) {
          if (t.parentId && toDelete.has(t.parentId) && !toDelete.has(t.id)) {
            toDelete.add(t.id);
            added = true;
          }
        }
      }
      const ids = Array.from(toDelete);
      setLocalTasks((prev) =>
        rollupParentProgress(prev.filter((t) => !toDelete.has(t.id))),
      );
      const { error } = await supabase
        .from('gantt_tasks')
        .delete()
        .in('id', ids);
      if (error) toast.error('Failed to delete: ' + error.message);
      qc.invalidateQueries({ queryKey: ganttTasksKey(planId) });
    },
    [localTasks, planId, qc],
  );

  const clearPlan = useCallback(async () => {
    if (!planId) return;
    setLocalTasks([]);
    const { error } = await supabase
      .from('gantt_tasks')
      .delete()
      .eq('plan_id', planId);
    if (error) toast.error('Failed to clear: ' + error.message);
    qc.invalidateQueries({ queryKey: ganttTasksKey(planId) });
  }, [planId, qc]);

  /**
   * Bulk replace plan tasks (used by auto-seed). Maintains client-supplied
   * ids → server ids mapping to preserve dependency / parent relationships.
   */
  const replaceAll = useCallback(
    async (next: GanttTask[]) => {
      if (!planId || !user?.id) return;
      // Wipe existing
      await supabase.from('gantt_tasks').delete().eq('plan_id', planId);

      // Insert in two passes to respect parent/deps via id remap
      const idMap = new Map<string, string>();

      // First pass: roots (no parent, no deps)
      const inOrder = [...next];
      // Topological-ish sort: items without parent first, then by depth
      inOrder.sort((a, b) => {
        const aDepth = a.parentId ? 1 : 0;
        const bDepth = b.parentId ? 1 : 0;
        return aDepth - bDepth;
      });

      for (let i = 0; i < inOrder.length; i++) {
        const t = inOrder[i];
        const mappedParent = t.parentId ? idMap.get(t.parentId) ?? null : null;
        const mappedDeps = (t.dependencies ?? [])
          .map((d) => idMap.get(d))
          .filter(Boolean) as string[];

        const { data, error } = await supabase
          .from('gantt_tasks')
          .insert({
            plan_id: planId,
            user_id: user.id,
            name: t.name,
            type: t.type,
            start_date: t.start,
            end_date: t.end,
            progress: Math.round(t.progress ?? 0),
            parent_id: mappedParent,
            dependencies: mappedDeps,
            hide_children: t.hideChildren ?? false,
            topic_id: t.topicId ?? null,
            position: i,
          })
          .select('id')
          .single();
        if (error) {
          toast.error('Failed to seed: ' + error.message);
          return;
        }
        idMap.set(t.id, (data as { id: string }).id);
      }

      qc.invalidateQueries({ queryKey: ganttTasksKey(planId) });
    },
    [planId, user?.id, qc],
  );

  return {
    tasks: localTasks,
    isLoading: query.isLoading,
    updateTask,
    addTask,
    removeTask,
    clearPlan,
    replaceAll,
  };
}
