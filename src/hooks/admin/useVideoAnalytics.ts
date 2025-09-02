import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VideoAnalytics {
  video_key: string;
  total_views: number;
  completion_rate: number;
  avg_watch_time: number;
  top_events: Array<{ event_type: string; count: number }>;
  recent_activity: Array<{
    created_at: string;
    event_type: string;
    timestamp_seconds: number;
  }>;
}

export interface VideoABTest {
  id: string;
  video_key: string;
  variant_name: string;
  video_url: string;
  is_active: boolean;
  traffic_percentage: number;
  conversion_rate: number;
  total_views: number;
  total_conversions: number;
}

export const useVideoAnalytics = () => {
  return useQuery({
    queryKey: ['video-analytics'],
    queryFn: async (): Promise<VideoAnalytics[]> => {
      // For now, return empty array until we have real data
      // TODO: Implement analytics aggregation
      return [];
    }
  });
};

export const useVideoABTests = () => {
  return useQuery({
    queryKey: ['video-ab-tests'],
    queryFn: async (): Promise<VideoABTest[]> => {
      const { data, error } = await supabase
        .from('video_ab_tests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching A/B tests:', error);
        return [];
      }
      
      return data || [];
    }
  });
};

export const useCreateABTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (testData: { video_key: string; variant_name: string; video_url: string; traffic_percentage?: number }) => {
      const { data, error } = await supabase
        .from('video_ab_tests')
        .insert([{
          video_key: testData.video_key,
          variant_name: testData.variant_name,
          video_url: testData.video_url,
          traffic_percentage: testData.traffic_percentage || 50,
          is_active: true
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-ab-tests'] });
      toast.success('A/B test created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create A/B test: ${error.message}`);
    }
  });
};

export const useUpdateABTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<VideoABTest> }) => {
      const { data, error } = await supabase
        .from('video_ab_tests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-ab-tests'] });
      toast.success('A/B test updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update A/B test: ${error.message}`);
    }
  });
};

export const useActivityFeed = () => {
  return useQuery({
    queryKey: ['user-activity-feed'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_activity_feed')
        .select(`
          *,
          profiles:user_id(username, avatar_url)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error fetching activity feed:', error);
        return [];
      }
      
      return data || [];
    },
    refetchInterval: 30000 // Refresh every 30 seconds for real-time feel
  });
};

// Track video events
export const trackVideoEvent = async (
  videoKey: string,
  videoUrl: string,
  eventType: string,
  timestampSeconds?: number
) => {
  const sessionId = sessionStorage.getItem('video-session-id') || 
    Math.random().toString(36).substring(2);
  sessionStorage.setItem('video-session-id', sessionId);
  
  try {
    await supabase.from('video_analytics').insert({
      video_key: videoKey,
      video_url: videoUrl,
      session_id: sessionId,
      event_type: eventType,
      timestamp_seconds: timestampSeconds,
      user_agent: navigator.userAgent,
      referrer: document.referrer
    });
  } catch (error) {
    console.error('Error tracking video event:', error);
  }
};