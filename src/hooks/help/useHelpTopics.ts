import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HelpTopicSection {
  id: string;
  title: string;
  content: string;
  image_url?: string | null;
  image_urls?: string[];
  sort_order: number;
}

export interface HelpTopic {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: number;
  tags: string[];
  sections: HelpTopicSection[];
  video_url?: string | null;
  video_title?: string | null;
  video_duration?: string | null;
  video_chapters?: { time: number; title: string; description?: string }[] | null;
  quick_tips?: string[] | null;
  image_url?: string | null;
  is_active: boolean;
  show_video: boolean;
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
        .select(`
          *,
          help_topic_sections (
            id,
            title,
            content,
            image_url,
            image_urls,
            sort_order
          )
        `)
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (error) throw error;

      return (data || []).map(topic => ({
        ...topic,
        sections: (topic.help_topic_sections || [])
          .sort((a, b) => a.sort_order - b.sort_order),
        tags: Array.isArray(topic.tags) ? topic.tags as string[] : [],
        video_chapters: Array.isArray(topic.video_chapters) ? topic.video_chapters as { time: number; title: string; description?: string }[] : null,
        quick_tips: Array.isArray(topic.quick_tips) ? topic.quick_tips as string[] : null,
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
        .select(`
          *,
          help_topic_sections (
            id,
            title,
            content,
            image_url,
            image_urls,
            sort_order
          )
        `)
        .order('priority', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(topic => ({
        ...topic,
        sections: (topic.help_topic_sections || [])
          .sort((a, b) => a.sort_order - b.sort_order),
        tags: Array.isArray(topic.tags) ? topic.tags as string[] : [],
        video_chapters: Array.isArray(topic.video_chapters) ? topic.video_chapters as { time: number; title: string; description?: string }[] : null,
        quick_tips: Array.isArray(topic.quick_tips) ? topic.quick_tips as string[] : null,
      })) as HelpTopic[];
    },
  });
};

export const useCreateHelpTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (topic: Omit<HelpTopic, 'id' | 'created_at' | 'updated_at' | 'sections'> & { sections: Omit<HelpTopicSection, 'id'>[] }) => {
      const { sections, ...topicData } = topic;
      
      // Create the topic first
      const { data: createdTopic, error: topicError } = await supabase
        .from('help_topics')
        .insert([topicData])
        .select()
        .single();

      if (topicError) throw topicError;

      // Create sections if any
      if (sections && sections.length > 0) {
        const sectionsData = sections.map(section => ({
          ...section,
          help_topic_id: createdTopic.id
        }));

        const { error: sectionsError } = await supabase
          .from('help_topic_sections')
          .insert(sectionsData);

        if (sectionsError) throw sectionsError;
      }

      return createdTopic;
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
    mutationFn: async ({ id, sections, ...updates }: Partial<HelpTopic> & { id: string }) => {
      // Update the main topic
      const { data, error } = await supabase
        .from('help_topics')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Handle sections if provided
      if (sections) {
        // Delete existing sections
        await supabase
          .from('help_topic_sections')
          .delete()
          .eq('help_topic_id', id);

        // Insert new sections
        if (sections.length > 0) {
          const sectionsData = sections.map((section, index) => ({
            help_topic_id: id,
            title: section.title,
            content: section.content,
            image_url: section.image_url,
            image_urls: section.image_urls || [],
            sort_order: index
          }));

          const { error: sectionsError } = await supabase
            .from('help_topic_sections')
            .insert(sectionsData);

          if (sectionsError) throw sectionsError;
        }
      }

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
      // Sections will be deleted automatically due to CASCADE
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