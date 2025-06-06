
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { announcementSchema } from '../schema';
import { AnnouncementFormData, Announcement } from '../types';

export const useAnnouncementForm = (
  announcement?: Announcement,
  onOpenChange?: (open: boolean) => void
) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: announcement?.title || '',
      content: announcement?.content || '',
      compact_text: announcement?.compact_text || '',
      cta_text: announcement?.cta_text || '',
      cta_url: announcement?.cta_url || '',
      background_color: announcement?.background_color || '#3b82f6',
      text_color: announcement?.text_color || '#ffffff',
      is_active: announcement?.is_active || false,
      start_date: announcement?.start_date ? 
        new Date(announcement.start_date).toISOString().slice(0, 16) : 
        new Date().toISOString().slice(0, 16),
      end_date: announcement?.end_date ? 
        new Date(announcement.end_date).toISOString().slice(0, 16) : 
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      target_tier: announcement?.target_tier || 'all',
      target_pages: announcement?.target_pages ? 
        JSON.stringify(announcement.target_pages) : '["all"]',
      mobile_layout: announcement?.mobile_layout || 'compact',
      priority: announcement?.priority || 1,
      dismissible: announcement?.dismissible ?? true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: AnnouncementFormData) => {
      const announcementData = {
        title: data.title,
        content: data.content,
        compact_text: data.compact_text || null,
        cta_text: data.cta_text || null,
        cta_url: data.cta_url || null,
        background_color: data.background_color,
        text_color: data.text_color,
        is_active: data.is_active,
        start_date: new Date(data.start_date).toISOString(),
        end_date: new Date(data.end_date).toISOString(),
        target_tier: data.target_tier,
        target_pages: JSON.parse(data.target_pages),
        mobile_layout: data.mobile_layout,
        priority: data.priority,
        dismissible: data.dismissible,
        created_by: user?.id,
      };

      if (announcement) {
        const { error } = await supabase
          .from('announcements')
          .update(announcementData)
          .eq('id', announcement.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('announcements')
          .insert(announcementData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      toast.success(`Announcement ${announcement ? 'updated' : 'created'} successfully`);
      onOpenChange?.(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(`Failed to ${announcement ? 'update' : 'create'} announcement`);
      console.error('Error saving announcement:', error);
    }
  });

  const onSubmit = (data: AnnouncementFormData) => {
    createMutation.mutate(data);
  };

  return {
    form,
    onSubmit,
    isSubmitting: createMutation.isPending
  };
};
