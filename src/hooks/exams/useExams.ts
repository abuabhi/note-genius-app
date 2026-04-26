import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import type { Exam, ExamStatus } from '@/types/exam';
import { toast } from 'sonner';

export interface CreateExamInput {
  title: string;
  subject_id: string | null;
  subject_name?: string | null;
  exam_date: string; // ISO
  location?: string | null;
  notes?: string | null;
  target_readiness?: number;
  createCalendarEvent?: boolean;
  reminderDaysBefore?: number[]; // e.g. [7, 3, 1]
}

export const examsKey = (uid?: string) => ['exams', uid] as const;

export function useExams() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: examsKey(user?.id),
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('user_id', user!.id)
        .order('exam_date', { ascending: true });
      if (error) throw error;
      return (data || []) as Exam[];
    },
  });

  const create = useMutation({
    mutationFn: async (input: CreateExamInput) => {
      if (!user?.id) throw new Error('Not authenticated');

      let event_id: string | null = null;
      if (input.createCalendarEvent !== false) {
        const start = new Date(input.exam_date);
        const end = new Date(start.getTime() + 60 * 60 * 1000);
        const { data: ev, error: evErr } = await supabase
          .from('events')
          .insert({
            user_id: user.id,
            title: `Exam: ${input.title}`,
            description: input.notes ?? null,
            start_time: start.toISOString(),
            end_time: end.toISOString(),
            all_day: true,
            event_type: 'exam',
            color: '#ef4444',
          })
          .select('id')
          .single();
        if (evErr) throw evErr;
        event_id = ev.id;
      }

      const { data: exam, error } = await supabase
        .from('exams')
        .insert({
          user_id: user.id,
          subject_id: input.subject_id,
          title: input.title,
          exam_date: input.exam_date,
          location: input.location ?? null,
          notes: input.notes ?? null,
          target_readiness: input.target_readiness ?? 80,
          event_id,
        })
        .select('*')
        .single();
      if (error) throw error;

      // Reminders
      if (event_id && input.reminderDaysBefore?.length) {
        const examTs = new Date(input.exam_date).getTime();
        const rows = input.reminderDaysBefore
          .map(d => ({
            user_id: user.id,
            title: `Exam in ${d} day${d === 1 ? '' : 's'}: ${input.title}`,
            description: input.notes ?? null,
            reminder_time: new Date(examTs - d * 24 * 60 * 60 * 1000).toISOString(),
            event_id,
            type: 'event',
            delivery_methods: ['in_app'],
            status: 'pending',
            priority: d <= 1 ? 'high' : 'medium',
          }))
          .filter(r => new Date(r.reminder_time).getTime() > Date.now());
        if (rows.length) {
          await supabase.from('reminders').insert(rows);
        }
      }

      return exam as Exam;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: examsKey(user?.id) });
      qc.invalidateQueries({ queryKey: ['events'] });
      toast.success('Exam added');
    },
    onError: (e: any) => toast.error(e.message ?? 'Failed to create exam'),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Exam> & { id: string }) => {
      const { data, error } = await supabase
        .from('exams')
        .update(patch)
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      return data as Exam;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: examsKey(user?.id) });
    },
  });

  const remove = useMutation({
    mutationFn: async (exam: Exam) => {
      if (exam.event_id) {
        await supabase.from('events').delete().eq('id', exam.event_id);
      }
      const { error } = await supabase.from('exams').delete().eq('id', exam.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: examsKey(user?.id) });
      qc.invalidateQueries({ queryKey: ['events'] });
      toast.success('Exam removed');
    },
  });

  const setStatus = (id: string, status: ExamStatus) =>
    update.mutateAsync({ id, status });

  return {
    exams: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createExam: create.mutateAsync,
    updateExam: update.mutateAsync,
    deleteExam: remove.mutateAsync,
    setStatus,
  };
}

export function useExam(id: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['exam', id],
    enabled: !!id && !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as Exam;
    },
  });
}
