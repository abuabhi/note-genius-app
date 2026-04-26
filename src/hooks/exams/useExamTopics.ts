import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import type { ExamTopic, TopicStatus } from '@/types/exam';
import { toast } from 'sonner';

export const examTopicsKey = (examId?: string) => ['exam-topics', examId] as const;

export function useExamTopics(examId: string | undefined) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: examTopicsKey(examId),
    enabled: !!examId && !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exam_topics')
        .select('*')
        .eq('exam_id', examId!)
        .order('position', { ascending: true });
      if (error) throw error;
      return (data || []) as ExamTopic[];
    },
  });

  const addTopic = useMutation({
    mutationFn: async (input: { name: string; weight?: number }) => {
      if (!user?.id || !examId) throw new Error('Missing context');
      const position = (query.data?.length ?? 0);
      const { data, error } = await supabase
        .from('exam_topics')
        .insert({
          exam_id: examId,
          user_id: user.id,
          name: input.name,
          weight: input.weight ?? 1,
          position,
        })
        .select('*')
        .single();
      if (error) throw error;
      return data as ExamTopic;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: examTopicsKey(examId) }),
    onError: (e: any) => toast.error(e.message ?? 'Failed to add topic'),
  });

  const updateTopic = useMutation({
    mutationFn: async ({ id, ...patch }: Partial<ExamTopic> & { id: string }) => {
      const { data, error } = await supabase
        .from('exam_topics')
        .update(patch)
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      return data as ExamTopic;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: examTopicsKey(examId) }),
  });

  const deleteTopic = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('exam_topics').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: examTopicsKey(examId) }),
  });

  const setTopicStatus = (id: string, status: TopicStatus) =>
    updateTopic.mutateAsync({ id, status });

  return {
    topics: query.data ?? [],
    isLoading: query.isLoading,
    addTopic: addTopic.mutateAsync,
    updateTopic: updateTopic.mutateAsync,
    deleteTopic: deleteTopic.mutateAsync,
    setTopicStatus,
  };
}
