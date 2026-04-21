
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
      queryFn: async (): Promise<any[]> => {
        const { data, error } = await supabase
          .from('user_subjects')
          .select('id, name, user_id, created_at')
          .eq('user_id', user.id)
          .limit(100);
        
        if (error) {
          console.error('Error fetching user subjects:', error);
          return [];
        }
        
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
        try {
          // Fetch all tags since tags table doesn't have user_id
          const { data, error } = await supabase
            .from('tags')
            .select('id, name, color')
            .order('name')
            .limit(200);
          
          if (error) {
            console.error('Error fetching tags:', error);
            return [];
          }
          
          return data || [];
        } catch (err) {
          console.error('Error in tags query:', err);
          return [];
        }
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
      queryFn: async (): Promise<any[]> => {
        try {
          const { data, error } = await supabase
            .from('note_enrichment_usage')
            .select('id, created_at, prompt_tokens, completion_tokens, llm_provider')
            .eq('user_id', user.id)
            .gte('created_at', startOfMonth.toISOString())
            .limit(500);
          
          if (error) {
            console.error('Error fetching enhancement usage:', error);
            return [];
          }
          
          return data || [];
        } catch (err) {
          console.error('Error in enhancement usage query:', err);
          return [];
        }
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
