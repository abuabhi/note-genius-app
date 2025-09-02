
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AdminSettings {
  feedback_mode: 'internal' | 'external';
  support_email: string;
}

export interface VideoSettings {
  video_hero_url: string;
  video_notes_import_url: string;
  video_flashcard_generation_url: string;
  video_smart_quizzes_url: string;
  video_ai_chat_url: string;
  video_study_plans_url: string;
  video_todo_focus_url: string;
  video_analytics_url: string;
  video_timer_url: string;
  video_goals_progress_url: string;
  video_resources_url: string;
}

export const useAdminSettings = () => {
  return useQuery({
    queryKey: ['admin-settings'],
    queryFn: async (): Promise<AdminSettings> => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value');

      if (error) throw error;

      // Convert array of settings to object
      const settings: AdminSettings = {
        feedback_mode: 'internal',
        support_email: ''
      };

      data?.forEach(setting => {
        if (setting.setting_key === 'feedback_mode') {
          settings.feedback_mode = setting.setting_value as 'internal' | 'external';
        } else if (setting.setting_key === 'support_email') {
          settings.support_email = setting.setting_value;
        }
      });

      return settings;
    },
  });
};

export const useUpdateAdminSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<AdminSettings>) => {
      const updates = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value
      }));

      const promises = updates.map(update =>
        supabase
          .from('admin_settings')
          .upsert(update, { onConflict: 'setting_key' })
      );

      const results = await Promise.all(promises);
      
      for (const result of results) {
        if (result.error) throw result.error;
      }

      return settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      toast.success('Settings updated successfully.');
    },
    onError: (error) => {
      console.error('Error updating admin settings:', error);
      toast.error('Failed to update settings.');
    },
  });
};

export const useVideoSettings = () => {
  return useQuery({
    queryKey: ['video-settings'],
    queryFn: async (): Promise<VideoSettings> => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value')
        .like('setting_key', 'video_%');

      if (error) throw error;

      const defaultSettings: VideoSettings = {
        video_hero_url: 'https://www.youtube.com/watch?v=UR94FhzUOg0',
        video_notes_import_url: 'https://www.youtube.com/watch?v=UR94FhzUOg0',
        video_flashcard_generation_url: 'https://www.youtube.com/watch?v=UR94FhzUOg0',
        video_smart_quizzes_url: 'https://www.youtube.com/watch?v=UR94FhzUOg0',
        video_ai_chat_url: 'https://www.youtube.com/watch?v=UR94FhzUOg0',
        video_study_plans_url: 'https://www.youtube.com/watch?v=UR94FhzUOg0',
        video_todo_focus_url: 'https://www.youtube.com/watch?v=UR94FhzUOg0',
        video_analytics_url: 'https://www.youtube.com/watch?v=UR94FhzUOg0',
        video_timer_url: 'https://www.youtube.com/watch?v=UR94FhzUOg0',
        video_goals_progress_url: 'https://www.youtube.com/watch?v=UR94FhzUOg0',
        video_resources_url: 'https://www.youtube.com/watch?v=UR94FhzUOg0',
      };

      data?.forEach(setting => {
        if (setting.setting_key in defaultSettings) {
          (defaultSettings as any)[setting.setting_key] = setting.setting_value;
        }
      });

      return defaultSettings;
    },
  });
};

export const useUpdateVideoSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<VideoSettings>) => {
      const updates = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value
      }));

      const promises = updates.map(update =>
        supabase
          .from('admin_settings')
          .upsert(update, { onConflict: 'setting_key' })
      );

      const results = await Promise.all(promises);
      
      for (const result of results) {
        if (result.error) throw result.error;
      }

      return settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-settings'] });
      toast.success('Video settings updated successfully.');
    },
    onError: (error) => {
      console.error('Error updating video settings:', error);
      toast.error('Failed to update video settings.');
    },
  });
};
