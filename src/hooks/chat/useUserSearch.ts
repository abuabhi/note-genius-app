
import { useState, useCallback } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth'; // Updated import path
import { UserProfile, UserTier } from "@/hooks/useRequireAuth";
import { useToast } from "@/hooks/use-toast";
import { UseUserSearchReturn } from './types';

export const useUserSearch = (): UseUserSearchReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState<Error | null>(null);

  const searchUsers = useCallback(async (query: string): Promise<UserProfile[]> => {
    if (!user || query.length < 3) return [];

    try {
      setError(null);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, user_tier, created_at, updated_at, do_not_disturb, dnd_start_time, dnd_end_time, notification_preferences')
        .ilike('username', `%${query}%`)
        .neq('id', user.id)
        .limit(10);

      if (error) throw error;
      
      // Transform profiles to match UserProfile interface
      const typedProfiles: UserProfile[] = data.map(profile => {
        // Parse notification_preferences if it's a string or use default
        const notificationPrefs = profile.notification_preferences ? 
          (typeof profile.notification_preferences === 'string' 
            ? JSON.parse(profile.notification_preferences)
            : profile.notification_preferences) 
          : { email: false, in_app: true, whatsapp: false };

        return {
          id: profile.id,
          username: profile.username || '',
          avatar_url: profile.avatar_url,
          user_tier: profile.user_tier as UserTier,
          do_not_disturb: profile.do_not_disturb || false,
          dnd_start_time: profile.dnd_start_time,
          dnd_end_time: profile.dnd_end_time,
          notification_preferences: {
            email: notificationPrefs.email === true,
            in_app: notificationPrefs.in_app !== false,
            whatsapp: notificationPrefs.whatsapp === true
          },
          created_at: profile.created_at || '',
          updated_at: profile.updated_at || ''
        };
      });
      
      return typedProfiles;
    } catch (error) {
      console.error('Error searching users:', error);
      setError(error instanceof Error ? error : new Error('Failed to search users'));
      return [];
    }
  }, [user]);

  const sendConnectionRequest = useCallback(async (receiverId: string) => {
    if (!user) return;

    try {
      setError(null);
      // Check if connection already exists
      const { data: existingConnection } = await supabase
        .from('user_connections')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
        .single();

      if (existingConnection) {
        toast({
          title: 'Connection exists',
          description: 'You already have a connection with this user',
        });
        return;
      }

      // Create new connection request
      const { error } = await supabase
        .from('user_connections')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: 'Request sent',
        description: 'Connection request has been sent',
      });
    } catch (error) {
      console.error('Error sending connection request:', error);
      setError(error instanceof Error ? error : new Error('Failed to send connection request'));
      toast({
        title: 'Error',
        description: 'Failed to send connection request',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  return {
    searchUsers,
    sendConnectionRequest,
    error
  };
};
