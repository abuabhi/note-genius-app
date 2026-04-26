import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import type { ExamTopicLink, ExamLinkResourceType } from '@/types/exam';
import { toast } from 'sonner';

export const examTopicLinksKey = (topicId?: string) =>
  ['exam-topic-links', topicId] as const;

export function useExamTopicLinks(topicId: string | undefined) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: examTopicLinksKey(topicId),
    enabled: !!topicId && !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exam_topic_links')
        .select('*')
        .eq('topic_id', topicId!);
      if (error) throw error;
      return (data || []) as ExamTopicLink[];
    },
  });

  const addLink = useMutation({
    mutationFn: async (input: { resource_type: ExamLinkResourceType; resource_id: string }) => {
      if (!user?.id || !topicId) throw new Error('Missing context');
      const { data, error } = await supabase
        .from('exam_topic_links')
        .insert({
          topic_id: topicId,
          user_id: user.id,
          resource_type: input.resource_type,
          resource_id: input.resource_id,
        })
        .select('*')
        .single();
      if (error) throw error;
      return data as ExamTopicLink;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: examTopicLinksKey(topicId) }),
    onError: (e: any) => toast.error(e.message ?? 'Failed to link resource'),
  });

  const removeLink = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('exam_topic_links').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: examTopicLinksKey(topicId) }),
  });

  return {
    links: query.data ?? [],
    isLoading: query.isLoading,
    addLink: addLink.mutateAsync,
    removeLink: removeLink.mutateAsync,
  };
}
