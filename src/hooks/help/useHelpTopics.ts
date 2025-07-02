import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HelpTopic {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  priority: number;
  tags: string[];
  video_url?: string | null;
  video_title?: string | null;
  video_duration?: string | null;
  video_chapters?: { time: number; title: string; description?: string }[] | null;
  quick_tips?: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  last_edited_by?: string | null;
}

export const useHelpTopics = () => {
  return useQuery({
    queryKey: ['help-topics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('help_topics')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: true });

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        tags: Array.isArray(item.tags) ? item.tags : [],
        video_chapters: Array.isArray(item.video_chapters) ? item.video_chapters : null,
        quick_tips: Array.isArray(item.quick_tips) ? item.quick_tips : null,
      })) as HelpTopic[];
    },
  });
};

export const useAllHelpTopics = () => {
  return useQuery({
    queryKey: ['all-help-topics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('help_topics')
        .select('*')
        .order('priority', { ascending: true });

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        tags: Array.isArray(item.tags) ? item.tags : [],
        video_chapters: Array.isArray(item.video_chapters) ? item.video_chapters : null,
        quick_tips: Array.isArray(item.quick_tips) ? item.quick_tips : null,
      })) as HelpTopic[];
    },
  });
};

export const useCreateHelpTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (topic: Omit<HelpTopic, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('help_topics')
        .insert([topic])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['help-topics'] });
      queryClient.invalidateQueries({ queryKey: ['all-help-topics'] });
    },
  });
};

export const useUpdateHelpTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HelpTopic> & { id: string }) => {
      const { data, error } = await supabase
        .from('help_topics')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['help-topics'] });
      queryClient.invalidateQueries({ queryKey: ['all-help-topics'] });
    },
  });
};

export const useDeleteHelpTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('help_topics')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['help-topics'] });
      queryClient.invalidateQueries({ queryKey: ['all-help-topics'] });
    },
  });
};