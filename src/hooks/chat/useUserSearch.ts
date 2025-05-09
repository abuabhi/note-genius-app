
import { useState, useCallback } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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
        .select('*')
        .ilike('username', `%${query}%`)
        .neq('id', user.id)
        .limit(10);

      if (error) throw error;
      
      // Ensure the user_tier is properly typed
      const typedProfiles = data.map(profile => ({
        ...profile,
        user_tier: profile.user_tier as UserTier
      }));
      
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
