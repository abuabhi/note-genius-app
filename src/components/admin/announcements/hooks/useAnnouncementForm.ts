
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { announcementFormSchema } from '../schema';
import { AnnouncementFormData, Announcement } from '../types';
import { useEffect } from 'react';

export const useAnnouncementForm = (
  announcement?: Announcement | null,
  onOpenChange?: (open: boolean) => void
) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      title: '',
      content: '',
      cta_text: '',
      cta_url: '',
      background_color: '#14b8a6',
      text_color: '#ffffff',
      is_active: false,
      start_date: new Date().toISOString().slice(0, 16),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      target_tier: 'all',
      target_pages: '["all"]',
      mobile_layout: 'default',
      dismissible: true,
      text_align: 'center',
    },
  });

  // Reset form when announcement changes
  useEffect(() => {
    if (announcement) {
      form.reset({
        title: announcement.title || '',
        content: announcement.content || '',
        cta_text: announcement.cta_text || '',
        cta_url: announcement.cta_url || '',
        background_color: announcement.background_color || '#14b8a6',
        text_color: announcement.text_color || '#ffffff',
        is_active: announcement.is_active || false,
        start_date: announcement.start_date ? 
          new Date(announcement.start_date).toISOString().slice(0, 16) : 
          new Date().toISOString().slice(0, 16),
        end_date: announcement.end_date ? 
          new Date(announcement.end_date).toISOString().slice(0, 16) : 
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        target_tier: announcement.target_tier || 'all',
        target_pages: announcement.target_pages ? 
          JSON.stringify(announcement.target_pages) : '["all"]',
        mobile_layout: announcement.mobile_layout || 'default',
        dismissible: announcement.dismissible ?? true,
        text_align: announcement.text_align || 'center',
      });
    } else {
      // Reset to default values when creating new announcement
      form.reset({
        title: '',
        content: '',
        cta_text: '',
        cta_url: '',
        background_color: '#14b8a6',
        text_color: '#ffffff',
        is_active: false,
        start_date: new Date().toISOString().slice(0, 16),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        target_tier: 'all',
        target_pages: '["all"]',
        mobile_layout: 'default',
        dismissible: true,
        text_align: 'center',
      });
    }
  }, [announcement, form]);

  const createMutation = useMutation({
    mutationFn: async (data: AnnouncementFormData) => {
      const announcementData = {
        title: data.title,
        content: data.content,
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
        dismissible: data.dismissible,
        text_align: data.text_align,
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
