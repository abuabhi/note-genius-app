
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

interface Announcement {
  id: string;
  title: string;
  content: string;
  compact_text?: string;
  cta_text?: string;
  cta_url?: string;
  background_color: string;
  text_color: string;
  mobile_layout: string;
  priority: number;
  dismissible: boolean;
}

export const useAnnouncementData = () => {
  const { user } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [userTier, setUserTier] = useState<string>('SCHOLAR');

  // Fetch user profile to get user tier
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('user_tier')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setUserTier(data.user_tier);
      }
    };

    fetchUserProfile();
  }, [user]);

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['active-announcements', userTier, location.pathname],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase.rpc('get_active_announcements', {
        user_tier_param: userTier,
        current_page: location.pathname
      });

      if (error) {
        console.error('Error fetching announcements:', error);
        return [];
      }

      // Filter out dismissed announcements
      if (data && data.length > 0) {
        const { data: dismissed } = await supabase
          .from('user_dismissed_announcements')
          .select('announcement_id')
          .eq('user_id', user.id);

        const dismissedIds = new Set(dismissed?.map(d => d.announcement_id) || []);
        return data.filter((announcement: Announcement) => !dismissedIds.has(announcement.id));
      }

      return data || [];
    },
    enabled: !!user
  });

  const dismissMutation = useMutation({
    mutationFn: async (announcementId: string) => {
      const { error } = await supabase.rpc('dismiss_announcement', {
        announcement_uuid: announcementId
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-announcements'] });
    }
  });

  const handleDismiss = (announcementId: string) => {
    dismissMutation.mutate(announcementId);
  };

  return {
    announcements,
    isLoading,
    handleDismiss
  };
};
