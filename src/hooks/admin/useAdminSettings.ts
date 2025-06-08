
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AdminSettings {
  feedback_mode: 'internal' | 'external';
  support_email: string;
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
