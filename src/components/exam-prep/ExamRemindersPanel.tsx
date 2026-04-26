import React, { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Bell, BellOff, Calendar as CalIcon, AlertTriangle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import type { Exam } from '@/types/exam';

interface ExamRemindersPanelProps {
  exam: Exam;
}

const PRESET_DAYS = [7, 3, 1] as const;
type PresetDay = typeof PRESET_DAYS[number];

interface ReminderRow {
  id: string;
  title: string;
  reminder_time: string;
  status: string;
  event_id: string | null;
}

const remindersKey = (eventId: string | null) => ['exam-reminders', eventId] as const;

export const ExamRemindersPanel: React.FC<ExamRemindersPanelProps> = ({ exam }) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const eventId = exam.event_id;
  const examTs = new Date(exam.exam_date).getTime();

  const query = useQuery({
    queryKey: remindersKey(eventId),
    enabled: !!eventId && !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reminders')
        .select('id, title, reminder_time, status, event_id')
        .eq('event_id', eventId!)
        .eq('user_id', user!.id)
        .order('reminder_time', { ascending: true });
      if (error) throw error;
      return (data || []) as ReminderRow[];
    },
  });

  // Map each preset day → existing reminder (if any), matched by reminder_time within ±2h tolerance.
  const presetMap = useMemo(() => {
    const map = new Map<PresetDay, ReminderRow | undefined>();
    PRESET_DAYS.forEach(d => {
      const target = examTs - d * 24 * 60 * 60 * 1000;
      const tolerance = 2 * 60 * 60 * 1000;
      const match = (query.data ?? []).find(
        r => Math.abs(new Date(r.reminder_time).getTime() - target) <= tolerance,
      );
      map.set(d, match);
    });
    return map;
  }, [query.data, examTs]);

  const create = useMutation({
    mutationFn: async (days: PresetDay) => {
      if (!user?.id || !eventId) throw new Error('Missing context');
      const reminder_time = new Date(examTs - days * 24 * 60 * 60 * 1000).toISOString();
      const { error } = await supabase.from('reminders').insert({
        user_id: user.id,
        title: `Exam in ${days} day${days === 1 ? '' : 's'}: ${exam.title}`,
        description: exam.notes ?? null,
        reminder_time,
        event_id: eventId,
        type: 'event',
        delivery_methods: ['in_app'],
        status: 'pending',
        priority: days <= 1 ? 'high' : 'medium',
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: remindersKey(eventId) }),
    onError: (e: any) => toast.error(e.message ?? 'Failed to add reminder'),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reminders').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: remindersKey(eventId) }),
    onError: (e: any) => toast.error(e.message ?? 'Failed to remove reminder'),
  });

  const toggle = async (days: PresetDay, on: boolean) => {
    const existing = presetMap.get(days);
    if (on && !existing) {
      await create.mutateAsync(days);
      toast.success(`Reminder set for ${days} day${days === 1 ? '' : 's'} before`);
    } else if (!on && existing) {
      await remove.mutateAsync(existing.id);
      toast.success('Reminder removed');
    }
  };

  if (!eventId) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4 text-primary" /> Exam reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            This exam has no calendar event, so reminders can't be attached. Re-create the exam to enable reminders.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-4 w-4 text-primary" /> Exam reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {query.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading reminders…</div>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {PRESET_DAYS.map(d => {
              const existing = presetMap.get(d);
              const fireAt = new Date(examTs - d * 24 * 60 * 60 * 1000);
              const inPast = fireAt.getTime() < Date.now();
              const enabled = !!existing;
              return (
                <li key={d} className="flex items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground">
                      {d} day{d === 1 ? '' : 's'} before
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <CalIcon className="h-3 w-3" />
                      {format(fireAt, "PPP 'at' p")}
                      {inPast ? (
                        <span className="ml-1 text-destructive">(in the past)</span>
                      ) : (
                        <span className="ml-1">· fires {formatDistanceToNow(fireAt, { addSuffix: true })}</span>
                      )}
                      {existing && existing.status !== 'pending' && (
                        <span className="ml-1">· {existing.status}</span>
                      )}
                    </div>
                  </div>
                  <Switch
                    checked={enabled}
                    disabled={inPast && !enabled}
                    onCheckedChange={v => toggle(d, !!v)}
                    aria-label={`${d}-day reminder`}
                  />
                </li>
              );
            })}
          </ul>
        )}

        {/* Any custom reminders the user added elsewhere for this event */}
        {(query.data ?? []).some(r => {
          const target = PRESET_DAYS.some(d => {
            const t = examTs - d * 24 * 60 * 60 * 1000;
            return Math.abs(new Date(r.reminder_time).getTime() - t) <= 2 * 60 * 60 * 1000;
          });
          return !target;
        }) && (
          <div className="rounded-lg border border-dashed border-border p-3 space-y-1">
            <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <BellOff className="h-3 w-3" /> Other reminders for this exam
            </div>
            {(query.data ?? [])
              .filter(r => {
                return !PRESET_DAYS.some(d => {
                  const t = examTs - d * 24 * 60 * 60 * 1000;
                  return Math.abs(new Date(r.reminder_time).getTime() - t) <= 2 * 60 * 60 * 1000;
                });
              })
              .map(r => (
                <div key={r.id} className="text-xs text-muted-foreground flex items-center justify-between gap-2">
                  <span className="truncate">
                    {format(new Date(r.reminder_time), "PPP 'at' p")} · {r.title}
                  </span>
                  <button
                    className="text-destructive hover:underline"
                    onClick={() => remove.mutate(r.id)}
                  >
                    remove
                  </button>
                </div>
              ))}
          </div>
        )}

        <p className="text-[11px] text-muted-foreground">
          Reminders use your existing notification system. Past times can't be enabled.
        </p>
      </CardContent>
    </Card>
  );
};
