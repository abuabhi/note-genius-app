import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useQueryClient } from '@tanstack/react-query';
import { ganttPlansKey } from './useGanttPlans';
import { GANTT_STORAGE_PREFIX } from '@/types/gantt';
import { toast } from 'sonner';

interface LegacyTask {
  id: string;
  name: string;
  start: string;
  end: string;
  progress: number;
  type: 'task' | 'milestone' | 'project';
  parentId?: string;
  dependencies?: string[];
  hideChildren?: boolean;
}

interface LegacyPlan {
  examId: string | null;
  tasks: LegacyTask[];
  updatedAt: string;
}

const MIGRATED_FLAG = 'gantt:migrated:v1';

/** Once per browser/user, push any localStorage gantt plans to Supabase. */
export function useLocalToCloudMigration() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const ran = useRef(false);

  useEffect(() => {
    if (!user?.id || ran.current) return;
    if (localStorage.getItem(`${MIGRATED_FLAG}:${user.id}`)) return;
    ran.current = true;

    (async () => {
      const keys = Object.keys(localStorage).filter((k) =>
        k.startsWith(GANTT_STORAGE_PREFIX),
      );
      if (keys.length === 0) {
        localStorage.setItem(`${MIGRATED_FLAG}:${user.id}`, '1');
        return;
      }

      let migrated = 0;
      for (const key of keys) {
        try {
          const raw = localStorage.getItem(key);
          if (!raw) continue;
          const plan = JSON.parse(raw) as LegacyPlan;
          if (!plan.tasks?.length) continue;

          const title = plan.examId ? 'Imported plan' : 'Standalone plan';
          const { data: planRow, error: planErr } = await supabase
            .from('gantt_plans')
            .insert({
              user_id: user.id,
              title,
              exam_id: plan.examId,
            })
            .select('id')
            .single();
          if (planErr || !planRow) continue;

          const planId = (planRow as { id: string }).id;
          const idMap = new Map<string, string>();
          const sorted = [...plan.tasks].sort((a, b) =>
            (a.parentId ? 1 : 0) - (b.parentId ? 1 : 0),
          );

          for (let i = 0; i < sorted.length; i++) {
            const t = sorted[i];
            const parent = t.parentId ? idMap.get(t.parentId) ?? null : null;
            const deps = (t.dependencies ?? [])
              .map((d) => idMap.get(d))
              .filter(Boolean) as string[];
            const { data: taskRow } = await supabase
              .from('gantt_tasks')
              .insert({
                plan_id: planId,
                user_id: user.id,
                name: t.name,
                type: t.type,
                start_date: t.start,
                end_date: t.end,
                progress: Math.round(t.progress ?? 0),
                parent_id: parent,
                dependencies: deps,
                hide_children: t.hideChildren ?? false,
                position: i,
              })
              .select('id')
              .single();
            if (taskRow) idMap.set(t.id, (taskRow as { id: string }).id);
          }

          migrated++;
          localStorage.removeItem(key);
        } catch {
          // skip corrupted
        }
      }

      localStorage.setItem(`${MIGRATED_FLAG}:${user.id}`, '1');
      if (migrated > 0) {
        toast.success(`Imported ${migrated} Gantt plan${migrated === 1 ? '' : 's'} to your account`);
        qc.invalidateQueries({ queryKey: ganttPlansKey(user.id) });
      }
    })();
  }, [user?.id, qc]);
}
