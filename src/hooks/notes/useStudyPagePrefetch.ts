
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

export const useStudyPagePrefetch = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Prefetch commonly accessed data
  const prefetchUserSubjects = () => {
    if (!user) return;

    queryClient.prefetchQuery({
      queryKey: ['user-subjects', user.id],
      queryFn: async () => {
        const { data } = await supabase
          .from('user_subjects')
          .select('*')
          .eq('user_id', user.id);
        return data || [];
      },
      staleTime: 5 * 60 * 1000 // 5 minutes
    });
  };

  const prefetchUserTags = () => {
    if (!user) return;

    queryClient.prefetchQuery({
      queryKey: ['user-tags', user.id],
      queryFn: async () => {
        const { data } = await supabase
          .from('tags')
          .select('*')
          .eq('user_id', user.id);
        return data || [];
      },
      staleTime: 5 * 60 * 1000 // 5 minutes
    });
  };

  const prefetchEnhancementUsage = () => {
    if (!user) return;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    queryClient.prefetchQuery({
      queryKey: ['enhancement-usage', user.id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('note_enrichment_usage')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', startOfMonth.toISOString());
        
        if (error) {
          console.error('Error fetching enhancement usage:', error);
          return [];
        }
        
        return data || [];
      },
      staleTime: 30 * 1000 // 30 seconds
    });
  };

  return {
    prefetchUserSubjects,
    prefetchUserTags,
    prefetchEnhancementUsage
  };
};
